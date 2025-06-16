"use client"

import {useSession} from "next-auth/react";
import {useCallback, useEffect, useState, useRef} from "react";
import {Bookmark} from "@/lib/types";
import {toast} from "sonner";

export function useBookmarks() {
    const {data: session, status} = useSession();
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const isFetching = useRef(false);

    const fetchBookmarks = useCallback(async (force = false) => {
        // Prevent multiple simultaneous fetches
        if (isFetching.current && !force) return;
        
        try {
            isFetching.current = true;
            
            if (status === "authenticated" && session?.user?.id) {
                const res = await fetch("/api/bookmarks");
                if (!res.ok) throw new Error("Failed to fetch bookmarks");
                const data = await res.json();
                setBookmarks(data.results || []);
            } else if (status === "unauthenticated") {
                const ids = JSON.parse(localStorage.getItem("bookmarks") || "[]");
                if (ids.length > 0) {
                    const res = await fetch("/api/words", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({ids}),
                    });
                    if (!res.ok) throw new Error("Failed to fetch bookmarked words");
                    const data = await res.json();
                    setBookmarks(data.results || []);
                } else {
                    setBookmarks([]);
                }
            }
        } catch (error) {
            console.error("Error fetching bookmarks:", error);
            toast.error("Failed to fetch bookmarks");
        } finally {
            isFetching.current = false;
        }
    }, [status, session?.user?.id]);

    const addBookmark = useCallback(async (wordId: string) => {
        try {
            if (status === "authenticated") {
                const res = await fetch("/api/bookmarks/add", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({wordId}),
                });
                if (!res.ok) throw new Error("Failed to add bookmark");
                toast.success("Bookmark added");
            } else {
                const local = JSON.parse(localStorage.getItem("bookmarks") || "[]");
                if (!local.includes(wordId)) {
                    local.push(wordId);
                    localStorage.setItem("bookmarks", JSON.stringify(local));
                    toast.success("Bookmark saved locally");
                    // Trigger storage event for other tabs
                    window.dispatchEvent(new Event('storage'));
                } else {
                    toast.error("Bookmark already exists");
                    return;
                }
            }
            await fetchBookmarks(true);
        } catch (error) {
            console.error("Error adding bookmark:", error);
            toast.error("Error saving bookmark");
        }
    }, [status, fetchBookmarks]);

    const removeBookmark = useCallback(async (wordId: string) => {
        try {
            // Optimistically update UI
            setBookmarks(prev => prev.filter(b => b._id !== wordId));

            if (status === "authenticated") {
                const res = await fetch("/api/bookmarks/remove", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({wordId}),
                });
                if (!res.ok) throw new Error("Failed to remove bookmark");
                toast.success("Bookmark removed");
            } else {
                const local = JSON.parse(localStorage.getItem("bookmarks") || "[]");
                const updated = local.filter((id: string) => id !== wordId);
                localStorage.setItem("bookmarks", JSON.stringify(updated));
                toast.success("Bookmark removed from local storage");
                // Trigger storage event for other tabs
                window.dispatchEvent(new Event('storage'));
            }
            await fetchBookmarks(true);
        } catch (error) {
            console.error("Error removing bookmark:", error);
            // Revert optimistic update on error
            await fetchBookmarks(true);
            toast.error("Failed to delete bookmark");
        }
    }, [status, fetchBookmarks]);

    const isBookmarked = useCallback((wordId: string) => 
        bookmarks.some((b) => (b.wordId?.toString() || b._id?.toString()) === wordId.toString()), 
        [bookmarks]
    );

    const toggleBookmark = useCallback(async (wordId: string) => {
        if (isBookmarked(wordId)) {
            await removeBookmark(wordId);
        } else {
            await addBookmark(wordId);
        }
    }, [isBookmarked, addBookmark, removeBookmark]);

    // Initial fetch and storage sync
    useEffect(() => {
        fetchBookmarks();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "bookmarks") {
                fetchBookmarks(true);
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [fetchBookmarks]);

    return {
        bookmarks,
        addBookmark,
        removeBookmark,
        isBookmarked,
        toggleBookmark
    };
}
