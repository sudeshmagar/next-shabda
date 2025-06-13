"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Trash2 } from "lucide-react";
import {toast} from "sonner";
import {Toaster} from "@/components/ui/sonner";
import {WordCard} from "@/components/word-card";
import {DictionaryEntry} from "@/lib/types";


export default function BookmarksPage() {
    const { data: session, status } = useSession();
    const [bookmarks, setBookmarks] = useState<DictionaryEntry[]>([]);

    const fetchBookmarks = async () => {
        try {
            if (status === "authenticated" && session?.user?.id) {
                const res = await fetch("/api/bookmarks", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                if (!res.ok) throw new Error("Failed to fetch bookmarks");
                const data = await res.json();
                setBookmarks(data.results || []);
            } else {
                const bookmarkIds = JSON.parse(localStorage.getItem("bookmarks") || "[]") as string[];
                if (bookmarkIds.length === 0) {
                    setBookmarks([]);
                    return;
                }
                const res = await fetch("/api/words", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ids: bookmarkIds }),
                });
                if (!res.ok) throw new Error("Failed to fetch bookmarked words");
                const data = await res.json();
                setBookmarks(data.results || []);
            }
        } catch (error) {
            console.error("Error fetching bookmarks:", error);
            toast.error("Failed to load bookmarks");
        }
    };

    const removeBookmark = async (wordId: string) => {
        try {
            if (status === "authenticated" && session?.user?.id) {
                const res = await fetch("/api/bookmarks/remove", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ wordId }),
                });
                if (!res.ok) throw new Error("Failed to remove bookmark");
                await fetchBookmarks();
                toast.success("Bookmark removed!");
            } else {
                const bookmarkIds = JSON.parse(localStorage.getItem("bookmarks") || "[]") as string[];
                const updatedBookmarks = bookmarkIds.filter((id) => id !== wordId);
                localStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
                setBookmarks((prev) => prev.filter((word) => word._id !== wordId));
                toast.success("Bookmark removed!");
            }
        } catch (error) {
            console.error("Error removing bookmark:", error);
            toast.error("Failed to remove bookmark");
        }
    };

    useEffect(() => {
        fetchBookmarks();
        const handleStorageChange = () => {
            if (status !== "authenticated") {
                fetchBookmarks();
            }
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [status, session]);

    return (
        <main className="min-h-screen container mx-auto">
            <Toaster position="top-right" />
            <div className="flex items-center gap-2">
                <Bookmark className="mr-2 h-6 w-6" />
                <h1 className="text-2xl font-bold">Your Bookmarks</h1>
            </div>
            <WordCard entry={bookmarks} />

            <Card className="w-full border-border">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-blue-800 flex items-center">

                        Your Bookmarks
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {bookmarks.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bookmarks.map((word) => (
                                <Card key={word._id} className="bg-blue-50">
                                    <CardContent className="p-4">
                                        <Link href={`/words/${word._id}`} className="block">
                                            <h3 className="text-lg font-bold text-gray-900">{word.word}</h3>
                                            <p className="text-sm text-gray-600 italic">{word.romanized}</p>
                                            <p className="text-sm text-gray-700 mt-1">{word.english}</p>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="mt-2 text-red-600 hover:text-red-800"
                                            onClick={() => removeBookmark(word._id)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Remove
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">
                            No bookmarked words yet. Start saving your favorite words!
                        </p>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}