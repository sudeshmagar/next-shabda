"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";
import { ArrowRight, Calendar, RefreshCw, Star } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { WordList } from "@/components/word-list";
import { DictionaryEntry } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/search-bar";
import React from "react";

function HomePageContent() {
    const [words, setWords] = useState<DictionaryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [wordOfTheDay, setWordOfTheDay] = useState<DictionaryEntry | null>(null);
    const searchParams = useSearchParams();

    // Calculate total pages
    const totalPages = Math.ceil(total / 10);

    // Check for search query parameter on component mount
    useEffect(() => {
        const query = searchParams.get('q');
        if (query) {
            setSearch(query);
            setPage(1);
        }
    }, [searchParams]);

    const handleSearch = useCallback(async (query: string) => {
        setSearch(query);
        setPage(1);
        setWords([]);
    }, []);

    // Handle page change
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= Math.ceil(total / 10)) {
            setPage(newPage);
            setWords([]); // Clear words immediately when changing pages
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Fetch Words
    useEffect(() => {
        const fetchWords = async () => {
            try {
                setLoading(true);
                setWords([]); // Clear words at the start of each fetch
                const response = await fetch("/api/words", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ search, limit: 10, page }),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch words");
                }

                const data = await response.json();
                setWords(data.results || []);
                setTotal(data.total || 0);
            } catch (error) {
                console.error("Error fetching words:", error);
                toast.error("Failed to load words");
                setWords([]);
                setTotal(0);
            } finally {
                setLoading(false);
            }
        };

        fetchWords();
    }, [search, page]);

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

        fetchWordOfTheDay();
        const today = new Date().toDateString();
        const interval = setInterval(() => {
            if (new Date().toDateString() !== today) fetchWordOfTheDay();
        }, 60 * 60 * 1000); // Check every hour
        return () => clearInterval(interval);
    }, []);

    // Generate page numbers to display
    const generatePageNumbers = () => {
        const pages: number[] = [];

        if (totalPages <= 5) {
            // If 5 or fewer pages, show all
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Calculate the range of pages to show
            let startPage = Math.max(1, page - 2);
            const endPage = Math.min(startPage + 4, totalPages);

            // Adjust start page if we're near the end
            if (endPage === totalPages) {
                startPage = Math.max(1, endPage - 4);
            }

            // Add pages in range
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }

        return pages;
    };

    return (
        <main className="min-h-screen flex flex-col gap-8 py-8">
            <Toaster position="top-right" />

            {/* Hero Section */}
            <section className="container mx-auto flex flex-col gap-4 items-center text-center px-4 max-w-3xl">
                <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">शब्द</h1>
                <h3 className="text-2xl font-medium text-muted-foreground">Nepali Dictionary</h3>
                <p className="text-lg text-muted-foreground max-w-2xl">Search for Nepali and English words. Create an account to bookmark your favorite words and add new entries.</p>
            </section>

            {/* Search Section */}
            <section className="container mx-auto px-4 max-w-4xl">
                <SearchBar onSearch={handleSearch} loading={loading} />
            </section>

            {/* Word of the Day - Only show when not searching */}
            {!search.trim() && wordOfTheDay && (
                <section className="container mx-auto px-4 max-w-4xl">
                    <Card className="bg-card border-border shadow-lg">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-2xl">Word of the Day</CardTitle>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="border-border px-3 py-1">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        Today
                                    </Badge>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-border rounded-full hover:bg-primary/10"
                                        onClick={() => {
                                            setRefreshing(true);
                                            // Add your refresh logic here
                                            setTimeout(() => setRefreshing(false), 1000);
                                        }}
                                    >
                                        <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Link href={`/words/${wordOfTheDay._id}`} className="block group">
                                <div className="space-y-4">
                                    <div>
                                        <h2 className="text-4xl font-bold tracking-tight group-hover:text-primary transition-colors">
                                            {wordOfTheDay.word}
                                        </h2>
                                        <p className="text-xl text-muted-foreground mt-1">{wordOfTheDay.romanized}</p>
                                        <p className="text-lg text-muted-foreground mt-2">{wordOfTheDay.english}</p>
                                    </div>

                                    {wordOfTheDay.definitions?.map((definition, index) => (
                                        <div key={index} className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                {wordOfTheDay.definitions && wordOfTheDay.definitions.length > 1 && (
                                                    <Badge variant="outline" className="h-7 px-3">
                                                        {index + 1}
                                                    </Badge>
                                                )}

                                                {definition.grammar && (
                                                    <Badge variant="secondary" className="h-7 px-3">
                                                        {definition.grammar}
                                                    </Badge>
                                                )}
                                                {definition.etymology && (
                                                    <span className="text-sm text-muted-foreground italic">
                                                        {definition.etymology}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-3">
                                                {definition.senses && (
                                                    <div>
                                                        <h4 className="text-lg font-semibold text-primary mb-2">अर्थ (Meanings)</h4>
                                                        <ul className="space-y-2 list-none">
                                                            {definition.senses.nepali?.map((sense, idx) => (
                                                                <li key={idx} className="relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-primary">
                                                                    <div className="text-base">{sense}</div>
                                                                    {definition.senses.english?.[idx] && (
                                                                        <div className="text-sm text-muted-foreground italic pl-4 border-l-2 border-border">
                                                                            {definition.senses.english[idx]}
                                                                        </div>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {definition.examples && (
                                                    <div>
                                                        <h4 className="text-lg font-semibold text-primary mb-2">उदाहरण (Examples)</h4>
                                                        <ul className="space-y-2 list-none">
                                                            {definition.examples.nepali?.map((example, idx) => (
                                                                <li key={idx} className="relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-primary">
                                                                    <div className="text-base">{example}</div>
                                                                    {definition.examples.english?.[idx] && (
                                                                        <div className="text-sm text-muted-foreground italic pl-4 border-l-2 border-border">
                                                                            {definition.examples.english[idx]}
                                                                        </div>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    <Button
                                        variant="link"
                                        className="mt-4 p-0 text-primary hover:text-primary/80 group-hover:translate-x-1 transition-transform"
                                    >
                                        Explore Word <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>
                </section>
            )}

            {/* Search Results */}
            <section className="container mx-auto px-4 max-w-4xl">
                <WordList entries={words} loading={loading} />
            </section>

            {/* Pagination - Only show when we have results */}
            {total > 0 && (
                <section className="container mx-auto px-4 max-w-4xl">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => handlePageChange(page - 1)}
                                    className={page === 1 ? "pointer-events-none opacity-50" : "hover:bg-primary/10"}
                                />
                            </PaginationItem>

                            {generatePageNumbers().map((pageNum, index, array) => (
                                <React.Fragment key={pageNum}>
                                    {/* Add ellipsis at start if needed */}
                                    {index === 0 && pageNum > 1 && (
                                        <>
                                            <PaginationItem>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePageChange(1)}
                                                    className="hover:bg-primary/10"
                                                >
                                                    1
                                                </Button>
                                            </PaginationItem>
                                            {pageNum > 2 && (
                                                <PaginationItem>
                                                    <span className="px-4 py-2 text-muted-foreground">...</span>
                                                </PaginationItem>
                                            )}
                                        </>
                                    )}

                                    <PaginationItem>
                                        <Button
                                            variant={pageNum === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(pageNum)}
                                            className={pageNum === page ? "bg-primary" : "hover:bg-primary/10"}
                                        >
                                            {pageNum}
                                        </Button>
                                    </PaginationItem>

                                    {/* Add ellipsis at end if needed */}
                                    {index === array.length - 1 && pageNum < totalPages && (
                                        <>
                                            {pageNum < totalPages - 1 && (
                                                <PaginationItem>
                                                    <span className="px-4 py-2 text-muted-foreground">...</span>
                                                </PaginationItem>
                                            )}
                                            <PaginationItem>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePageChange(totalPages)}
                                                    className="hover:bg-primary/10"
                                                >
                                                    {totalPages}
                                                </Button>
                                            </PaginationItem>
                                        </>
                                    )}
                                </React.Fragment>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => handlePageChange(page + 1)}
                                    className={page === totalPages ? "pointer-events-none opacity-50" : "hover:bg-primary/10"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </section>
            )}
        </main>
    );
}

export default function HomePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        }>
            <HomePageContent />
        </Suspense>
    );
}