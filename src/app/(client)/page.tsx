"use client";
import {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";
import {ArrowRight, Calendar, RefreshCw, Search, Star} from "lucide-react";
import {toast} from "sonner";
import {Toaster} from "@/components/ui/sonner";
import {WordList} from "@/components/word-list";
import {Bookmark, DictionaryEntry, ExtendedDictionaryEntry} from "@/lib/types";
import {Badge} from "@/components/ui/badge";
import bookmark from "@/models/Bookmark";


export default function HomePage() {
    const {data: session, status} = useSession();

    const [words, setWords] = useState<ExtendedDictionaryEntry[]>([]);
    const [search, setSearch] = useState("");
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);


    const [wordOfTheDay, setWordOfTheDay] = useState<ExtendedDictionaryEntry | null>(null);
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    // Fetch Words
    useEffect(() => {
        const fetchWords = async () => {
            try {
                setLoading(true)
                const response = await fetch("/api/words", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({search, limit, page}),
                });
                if (!response.ok) throw new Error("Failed to fetch words");
                const data = await response.json();
                setWords(data.results || []);
                setTotalPages(data.pages || 1);
                setLoading(false)
            } catch (error) {
                console.error("Error fetching words:", error);
                toast.error("Failed to load words");
            } finally {
                setLoading(false)
            }
        };
        fetchWords();
    }, [search, page, limit]);


    // Fetch Word of the Day + Daily Refresh
    useEffect(() => {
        const fetchWordOfTheDay = async () => {
            try {
                const response = await fetch("/api/words/random");
                if (!response.ok) throw new Error("Failed to fetch word of the day");
                const data = await response.json();
                if (data?.word) {
                    setWordOfTheDay(data.word);
                } else {
                    const fallbackResponse = await fetch("/api/words", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({limit: 100, page: 1}),
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

        fetchWordOfTheDay();
        const today = new Date().toDateString();
        const interval = setInterval(() => {
            if (new Date().toDateString() !== today) fetchWordOfTheDay();
        }, 60 * 60 * 1000); // Check every hour
        return () => clearInterval(interval);
    }, []);

    // Fetch Bookmarks
    const fetchBookmarks = async () => {
        try {
            if (status === "authenticated" && session?.user?.id) {
                const res = await fetch("api/bookmarks");
                const data = await res.json();
                setBookmarks(data.results || []);
            } else {
                const ids = JSON.parse(localStorage.getItem("bookmarks") || "[]") as string[];
                if (ids.length > 0) {
                    const res = await fetch('/api/words', {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({ids}),
                    });
                    const data = await res.json();
                    setBookmarks(data.results || []);
                }
            }
        } catch (error) {
            console.error("Error fetching bookmarks:", error);
            toast.error("Failed to load bookmarks");
        }
    };

    // add bookmark
    const addBookmark = async ( wordId: string) => {
        try {
            if (status === "authenticated") {
                await fetch("/api/bookmarks/add", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({wordId}),
                })
                toast.success("Bookmark added successfully.");
                await fetchBookmarks(); // Refresh bookmarks
            } else {
                const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
                if (!bookmarks.includes(wordId)) {
                    bookmarks.push(wordId);
                    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
                    toast.success("Bookmark saved locally.");
                    await fetchBookmarks(); // Refresh bookmarks
                } else {
                    toast.error("This word is already bookmarked.");
                }
            }
        } catch (e) {
            toast.error("Failed to add bookmark");
            console.error("Error adding bookmark:", e);
        }
    }

    // toggle bookmark
    const toggleBookmark = async ( wordId: string ) => {
        const isBookmarked = bookmarks.some((b) => b.id === wordId);
        if (!isBookmarked) {
            await addBookmark(wordId);
        } else {
            //remove bookmark
            if (status === "authenticated") {
                await fetch("/api/bookmarks/remove", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({wordId}),
                })
            } else {
                const local = JSON.parse(localStorage.getItem("bookmarks") || "[]");
                localStorage.setItem("bookmarks", JSON.stringify(local.filter((id: string) => id !== wordId)));
            }
            toast.success("Bookmark removed successfully.");
            await fetchBookmarks();
        }
    }

    //  Bookmark
    useEffect(() => {


        fetchBookmarks();

        //sync localStorage bookmarks to MongoDB on login
        if (status === "authenticated" && session?.user.id) {
            const localBookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]") as string[];
            if (localBookmarks.length) {
                localBookmarks.forEach(async (wordId: string) => {
                    await fetch("/api/bookmarks/add", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({wordId}),
                    })
                })
                localStorage.removeItem("bookmarks");
                fetchBookmarks();
            }
        }
        const syncStorage = () => {
            if (status !== "authenticated") fetchBookmarks();
        }

        window.addEventListener("storage", syncStorage)
        return () => {
            window.removeEventListener("storage", syncStorage);
        };
    }, [status, session]);


    return (
        <main className="min-h-screen flex flex-col gap-5">
            <Toaster position="top-right"/>
            {/* Hero Section */}
            <section className="container mx-auto flex flex-col gap-3 items-center p-5">
                <h1 className="text-4xl font-bold">शब्द</h1>
                <h3 className="text-xl">Nepali dictionary</h3>
                <p>Search for Nepali and English words. Create an account to bookmark your favorite words and add new
                    entries</p>
            </section>

            {/* Search and Filters */}
            <section className="container mx-auto">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
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
                            <SelectValue placeholder="Show 10"/>
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
            { (wordOfTheDay && search === "") && (
                <section className="container mx-auto">
                    {wordOfTheDay && (
                        <Card className="bg-card border-border text-card-foreground">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Star className="h-5 w-5"/>
                                        <CardTitle>Word of the Day</CardTitle>
                                    </div>
                                    <div className="flex item-center gap-2">
                                        <Badge variant="outline" className="border-border">
                                            <Calendar className="h-3 w-3"/>
                                            Today
                                        </Badge>
                                        <Button variant="outline" size="sm" className={"border-border"}>
                                            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}/>
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
                                    <p className=" mt-2 font-medium">{wordOfTheDay.english}</p>
                                    {wordOfTheDay.definitions?.map((definition, index) => (
                                        <div key={index}>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">
                                                    {index + 1}
                                                </Badge>
                                                {definition.grammar && (
                                                    <Badge variant="secondary">
                                                        {definition.grammar}
                                                    </Badge>
                                                )}
                                                {definition.etymology && <span className="text-xs text-muted-foreground">{definition.etymology}</span>}
                                            </div>
                                            <div className="flex flex-col gap-2 mt-2">
                                                {/*paired senses*/}
                                                {definition.senses && Object.keys(definition.senses).length > 0 && (
                                                    <div>
                                                        <h4 className="font-semibold mb-1 text-primary">अर्थ (Meanings)</h4>
                                                        <ul className="space-y-1">
                                                            {Object.entries(definition.senses).map(([lang, senses], idx) => (
                                                                <li key={idx} className="text-muted-foreground">
                                                                    {senses.map((sense, j) => (
                                                                        <div key={j} className="font-medium">
                                                                            • {sense}
                                                                        </div>
                                                                    ))}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {definition.examples && Object.keys(definition.examples).length > 0 && (
                                                    <div>
                                                        <h4 className="font-semibold mb-1 text-primary">उदाहरण (Examples)</h4>
                                                        <ul className="space-y-1">
                                                            {Object.entries(definition.examples).map(([lang, examples], idx) => (
                                                                <li key={idx} className="text-muted-foreground italic">
                                                                    {examples.map((example, j) => (
                                                                        <div key={j} className="pl-4">
                                                                            • {example}
                                                                        </div>
                                                                    ))}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}


                                    <Button variant="link" className="mt-4  p-0">
                                        Explore Word <ArrowRight className="ml-2 h-4 w-4"/>
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                </section>
            )}




            <section className="container mx-auto">
                <WordList entries={words} loading={loading} bookmarks={bookmarks} addBookmark={addBookmark}/>
            </section>




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