"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import {Search, BookOpen, ArrowRight, Bookmark, Trash2, Star, Calendar, RefreshCw} from "lucide-react";
import {toast} from "sonner";
import {Toaster} from "@/components/ui/sonner";
import {WordList} from "@/components/word-list";
import {DictionaryEntry} from "@/lib/types";
import {Badge} from "@/components/ui/badge";

interface Word {
    _id: string;
    word: string;
    romanized: string;
    english: string;
    definition: string;
    example?: string;
    partOfSpeech?: string;
}

export default function HomePage() {
    const { data: session, status } = useSession();

    const [words, setWords] = useState<DictionaryEntry[]>([]);
    const [search, setSearch] = useState("");
    const [limit, setLimit] = useState(10);
    // const [page, setLimit] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [wordOfTheDay, setWordOfTheDay] = useState<Word | null>(null);
    const [bookmarks, setBookmarks] = useState<Word[]>([]);

    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    // Fetch regular word list
    const fetchWords = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/words", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ search, limit, page }),
            });
            if (!response.ok) throw new Error("Failed to fetch words");
            const data = await response.json();
            setWords(data.results || []);
            setTotalPages(data.pages || 1);
            setLoading(false)
        } catch (error) {
            console.error("Error fetching words:", error);
            toast.error("Failed to load words");
        }
    };

    // Fetch Word of the Day
    const fetchWordOfTheDay = async () => {
        try {
            const response = await fetch("/api/words/random", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) throw new Error("Failed to fetch word of the day");
            const data = await response.json();
            if (data && data.word) {
                setWordOfTheDay(data.word);
            } else {
                const fallbackResponse = await fetch("/api/words", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ limit: 100, page: 1 }),
                });
                if (!fallbackResponse.ok) throw new Error("Failed to fetch fallback words");
                const fallbackData = await fallbackResponse.json();
                if (fallbackData.results && fallbackData.results.length > 0) {
                    const randomIndex = Math.floor(Math.random() * fallbackData.results.length);
                    setWordOfTheDay(fallbackData.results[randomIndex]);
                }
            }
        } catch (error) {
            console.error("Error fetching Word of the Day:", error);
            toast.error("Failed to load Word of the Day");
        }
    };

    // Fetch bookmarks
    const fetchBookmarks = async () => {
        try {
            if (status === "authenticated" && session?.user?.id) {
                const response = await fetch("/api/bookmarks", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                if (!response.ok) throw new Error("Failed to fetch bookmarks");
                const data = await response.json();
                setBookmarks(data.results || []);
            } else {
                const bookmarkIds = JSON.parse(localStorage.getItem("bookmarks") || "[]") as string[];
                if (bookmarkIds.length === 0) {
                    setBookmarks([]);
                    return;
                }
                const response = await fetch("/api/words", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ids: bookmarkIds }),
                });
                if (!response.ok) throw new Error("Failed to fetch bookmarked words");
                const data = await response.json();
                setBookmarks(data.results || []);
            }
        } catch (error) {
            console.error("Error fetching bookmarks:", error);
            toast.error("Failed to load bookmarks");
        }
    };

    // Add bookmark
    const addBookmark = async (wordId: string) => {
        try {
            if (status === "authenticated" && session?.user?.id) {
                const response = await fetch("/api/bookmarks/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ wordId }),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to add bookmark");
                }
                await fetchBookmarks();
                toast.success("Bookmark added!");
            } else {
                const bookmarkIds = JSON.parse(localStorage.getItem("bookmarks") || "[]") as string[];
                if (!bookmarkIds.includes(wordId)) {
                    bookmarkIds.push(wordId);
                    localStorage.setItem("bookmarks", JSON.stringify(bookmarkIds));
                    await fetchBookmarks();
                    toast.success("Bookmark added!");
                } else {
                    toast.error("Bookmark already exists");
                }
            }
        } catch (error) {
            console.error("Error adding bookmark:", error);
            toast.error(error instanceof Error ? error.message : "Failed to add bookmark");
        }
    };

    // Remove bookmark
    const removeBookmark = async (wordId: string) => {
        try {
            if (status === "authenticated" && session?.user?.id) {
                const response = await fetch("/api/bookmarks/remove", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ wordId }),
                });
                if (!response.ok) throw new Error("Failed to remove bookmark");
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

    // Sync localStorage bookmarks to MongoDB on signin
    useEffect(() => {
        if (status === "authenticated" && session?.user?.id) {
            const localBookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]") as string[];
            if (localBookmarks.length > 0) {
                localBookmarks.forEach(async (wordId) => {
                    try {
                        const response = await fetch("/api/bookmarks/add", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ wordId }),
                        });
                        if (!response.ok) throw new Error("Failed to sync bookmark");
                    } catch (error) {
                        console.error("Error syncing bookmark:", error);
                    }
                });
                localStorage.removeItem("bookmarks");
                fetchBookmarks();
            }
        }
    }, [status, session]);

    useEffect(() => {
        fetchWords();
    }, [search, page, limit]);

    useEffect(() => {
        fetchWordOfTheDay();
        const today = new Date().toDateString();
        const checkDailyRefresh = () => {
            const currentDay = new Date().toDateString();
            if (currentDay !== today) {
                fetchWordOfTheDay();
            }
        };
        const interval = setInterval(checkDailyRefresh, 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

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
        <main className="min-h-screen flex flex-col gap-5">
            <Toaster position="top-right" />
            {/* Hero Section */}
            <section className="container mx-auto flex flex-col gap-3 items-center p-5">
                <h1 className="text-4xl font-bold">शब्द</h1>
                <h3 className="text-xl">Nepali dictionary</h3>
                <p>Search for Nepali and English words. Create an account to bookmark your favorite words and add new entries</p>
            </section>

            {/* Search and Filters */}
            <section className="container mx-auto">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Search by Nepali, Romanized, or English..."
                            value={search}
                            onChange={(e) => {
                                setPage(1);
                                setSearch(e.target.value);
                            }}
                            className="pl-10 shadow-sm"
                        />
                    </div>
                    <Select
                        value={limit.toString()}
                        onValueChange={(value) => {
                            setLimit(Number(value));
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[120px] bg-white border-blue-200">
                            <SelectValue placeholder="Show 10" />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 20, 50, 100].map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                    Show {num}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </section>

            {/* Word of the Day */}
            <section className="container mx-auto">
                {wordOfTheDay && (
                    <Card className="bg-primary border-border text-primary-foreground">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5" />
                                    <CardTitle>Word of the Day</CardTitle>
                                </div>
                                <div className="flex item-center gap-2">
                                    <Badge variant="outline">
                                        <Calendar className="h-3 w-3" />
                                        Today
                                    </Badge>
                                    <Button variant="outline" size="sm">
                                        <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                                    </Button>
                                </div>

                            </div>
                        </CardHeader>
                        <CardContent>
                            <Link href={`/words/${wordOfTheDay._id}`} className="block group">
                                <h2 className="text-3xl font-bold ">
                                    {wordOfTheDay.word}
                                </h2>
                                <p className="text-lg  italic">{wordOfTheDay.romanized}</p>
                                {wordOfTheDay.partOfSpeech && (
                                    <p className="text-sm  mt-2">{wordOfTheDay.partOfSpeech}</p>
                                )}
                                <p className=" mt-2 font-medium">{wordOfTheDay.english}</p>
                                {wordOfTheDay.definition && (
                                    <p className="text-sm  mt-2">{wordOfTheDay.definition}</p>
                                )}
                                {wordOfTheDay.example && (
                                    <p className="text-sm  italic mt-2">
                                        Example: {wordOfTheDay.example}
                                    </p>
                                )}
                                <Button variant="link" className="mt-4  p-0">
                                    Explore Word <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

            </section>

            {/* Bookmarks Section */}
            {/*<section className="max-w-6xl mx-auto px-6 py-8">*/}
            {/*    <Card className="bg-white border-none shadow-md">*/}
            {/*        <CardHeader>*/}
            {/*            <CardTitle className="text-2xl font-bold text-blue-800 flex items-center">*/}
            {/*                <Bookmark className="mr-2 h-6 w-6" />*/}
            {/*                Your Bookmarks*/}
            {/*                {bookmarks.length > 0 && (*/}
            {/*                    <Button asChild variant="link" className="ml-auto text-blue-600">*/}
            {/*                        <Link href="/bookmarks">View All</Link>*/}
            {/*                    </Button>*/}
            {/*                )}*/}
            {/*            </CardTitle>*/}
            {/*        </CardHeader>*/}
            {/*        <CardContent>*/}
            {/*            {bookmarks.length > 0 ? (*/}
            {/*                <div className="flex overflow-x-auto gap-4 pb-4">*/}
            {/*                    <AnimatePresence>*/}
            {/*                        {bookmarks.map((word) => (*/}
            {/*                            <motion.div*/}
            {/*                                key={word._id}*/}
            {/*                                initial={{ opacity: 0, scale: 0.95 }}*/}
            {/*                                animate={{ opacity: 1, scale: 1 }}*/}
            {/*                                exit={{ opacity: 0, scale: 0.95 }}*/}
            {/*                                transition={{ duration: 0.3 }}*/}
            {/*                                className="min-w-[250px] flex-shrink-0"*/}
            {/*                            >*/}
            {/*                                <Card className="bg-blue-50 hover:bg-blue-100 transition-all duration-300">*/}
            {/*                                    <CardContent className="p-4">*/}
            {/*                                        <Link href={`/words/${word._id}`} className="block">*/}
            {/*                                            <h3 className="text-lg font-bold text-gray-900">{word.word}</h3>*/}
            {/*                                            <p className="text-sm text-gray-600 italic">{word.romanized}</p>*/}
            {/*                                            <p className="text-sm text-gray-700 mt-1">{word.english}</p>*/}
            {/*                                        </Link>*/}
            {/*                                        <Button*/}
            {/*                                            variant="ghost"*/}
            {/*                                            size="sm"*/}
            {/*                                            className="mt-2 text-red-600 hover:text-red-800"*/}
            {/*                                            onClick={() => removeBookmark(word._id)}*/}
            {/*                                        >*/}
            {/*                                            <Trash2 className="h-4 w-4 mr-1" />*/}
            {/*                                            Remove*/}
            {/*                                        </Button>*/}
            {/*                                    </CardContent>*/}
            {/*                                </Card>*/}
            {/*                            </motion.div>*/}
            {/*                        ))}*/}
            {/*                    </AnimatePresence>*/}
            {/*                </div>*/}
            {/*            ) : (*/}
            {/*                <p className="text-gray-500 text-center">*/}
            {/*                    No bookmarked words yet. Start saving your favorite words!*/}
            {/*                </p>*/}
            {/*            )}*/}
            {/*        </CardContent>*/}
            {/*    </Card>*/}
            {/*</section>*/}


            <section className="container mx-auto">
                <WordList entries={words} loading={loading} />
            </section>


            {/* Word List */}
            {/*<section className="max-w-6xl mx-auto px-6">*/}
            {/*    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">*/}
            {/*        <AnimatePresence>*/}
            {/*            {words.map((word: Word) => (*/}
            {/*                <motion.div*/}
            {/*                    key={word._id}*/}
            {/*                    initial={{ opacity: 0, y: 20 }}*/}
            {/*                    animate={{ opacity: 1, y: 0 }}*/}
            {/*                    exit={{ opacity: 0 }}*/}
            {/*                    transition={{ duration: 0.3 }}*/}
            {/*                >*/}
            {/*                    <Card className="bg-white hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg border-none">*/}
            {/*                        <CardHeader>*/}
            {/*                            <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600">*/}
            {/*                                {word.word}*/}
            {/*                            </CardTitle>*/}
            {/*                            <p className="text-sm text-gray-500 italic">{word.romanized}</p>*/}
            {/*                        </CardHeader>*/}
            {/*                        <CardContent>*/}
            {/*                            {word.partOfSpeech && (*/}
            {/*                                <p className="text-xs text-blue-500 font-medium mb-2">{word.partOfSpeech}</p>*/}
            {/*                            )}*/}
            {/*                            <p className="text-gray-700 font-medium">{word.english}</p>*/}
            {/*                            {word.definition && (*/}
            {/*                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{word.definition}</p>*/}
            {/*                            )}*/}
            {/*                            {word.example && (*/}
            {/*                                <p className="text-xs text-gray-500 italic mt-2 line-clamp-1">*/}
            {/*                                    Ex: {word.example}*/}
            {/*                                </p>*/}
            {/*                            )}*/}
            {/*                            <Button*/}
            {/*                                variant="ghost"*/}
            {/*                                size="sm"*/}
            {/*                                className="mt-2 text-blue-600 hover:text-blue-800"*/}
            {/*                                onClick={() => addBookmark(word._id)}*/}
            {/*                            >*/}
            {/*                                <Bookmark className="h-4 w-4 mr-1" />*/}
            {/*                                Bookmark*/}
            {/*                            </Button>*/}
            {/*                        </CardContent>*/}
            {/*                    </Card>*/}
            {/*                </motion.div>*/}
            {/*            ))}*/}
            {/*        </AnimatePresence>*/}
            {/*    </div>*/}

            {/*    {words.length === 0 && (*/}
            {/*        <Card className="text-center py-12 bg-white shadow-sm">*/}
            {/*            <CardContent>*/}
            {/*                <p className="text-gray-500 text-lg">No words found</p>*/}
            {/*            </CardContent>*/}
            {/*        </Card>*/}
            {/*    )}*/}
            {/*</section>*/}

            {/* Pagination */}
            {totalPages > 1 && (
                <section className="max-w-6xl mx-auto px-6 py-8">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className={page === 1 ? "pointer-events-none opacity-50" : "hover:bg-blue-100"}
                                />
                            </PaginationItem>
                            <PaginationItem>
                                <span className="text-gray-600 font-medium">
                                    Page {page} of {totalPages}
                                </span>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    className={page === totalPages ? "pointer-events-none opacity-50" : "hover:bg-blue-100"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </section>
            )}
        </main>
    );
}