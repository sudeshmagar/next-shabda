"use client"

import {useSession} from "next-auth/react";
import {useCallback, useEffect, useState} from "react";
import {Bookmark} from "@/lib/types";
import {toast} from "sonner";

export function useBookmarks() {
    const {data: session, status} = useSession();
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

    const fetchBookmarks = useCallback(async () => {
        try {
            if (status === "authenticated" && session?.user?.id) {
                const res = await fetch("/api/bookmarks")
                const data = await res.json()
                setBookmarks(data.results || [])
            } else {
                const ids = JSON.parse(localStorage.getItem("bookmarks") || "[]");
                if (ids.length > 0) {
                    const res = await fetch("/api/words", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({ids}),
                    })
                    const data = await res.json()
                    setBookmarks(data.results || [])
                }
            }
        } catch {
            toast.error("Failed to fetch bookmarks");
        }
    }, [status, session?.user?.id])


    const addBookmark = async (wordId: string) => {
        try {
            if (status === "authenticated") {
                await fetch("/api/bookmarks/add", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({wordId}),
                })
                toast.success("Bookmark added");
            } else {
                const local = JSON.parse(localStorage.getItem("bookmarks") || "[]");
                if (!local.includes(wordId)) {
                    local.push(wordId);
                    localStorage.setItem("bookmarks", JSON.stringify(local));
                    toast.success("Bookmark saved locally");
                } else {
                    toast.error("Bookmark already exists");
                }
            }
            await fetchBookmarks();
        } catch {
            toast.error("Error saving bookmark.")
        }
    }

    const removeBookmark = async (wordId: string) => {
        try {
            if (status === "authenticated") {
                await fetch("/api/bookmarks/remove", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({wordId}),
                })
                toast.success("Bookmark removed");
            } else {
                const local = JSON.parse(localStorage.getItem("bookmarks") || "[]");
                const updated = local.filter((id: string) => id !== wordId);
                localStorage.setItem("bookmarks", JSON.stringify(updated));
                toast.success("bookmark removed from local storage");
            }
            await fetchBookmarks();

        } catch {
            toast.error("Failed to delete bookmark.")
        }
    }



    const isBookmarked =  useCallback((wordId: string) => bookmarks.some((b) => b.wordId?.toString?.() || b._id?.toString?.() === wordId.toString()), [bookmarks]);

    const toggleBookmark = async (wordId: string) => {
        if (isBookmarked(wordId)) {
            await removeBookmark(wordId);
        } else {
            await addBookmark(wordId);
        }
    }

    useEffect(() => {
        fetchBookmarks();

        const sync = () => {
            if (status !== "authenticated") {
                fetchBookmarks();
            }
        };
        window.addEventListener("storage", sync)
        return () => window.removeEventListener("storage", sync)
    }, [status, session?.user?.id, fetchBookmarks]);

    return {
        bookmarks,
        addBookmark,
        removeBookmark,
        isBookmarked,
        toggleBookmark
    }
}
