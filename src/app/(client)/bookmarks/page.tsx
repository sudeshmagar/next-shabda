"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookmarkCheck, Search } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { WordList } from "@/components/word-list";
import { DictionaryEntry } from "@/lib/types";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

function BookmarksSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-8">
                {/* Header Section */}
                <Card className="border-border shadow-lg">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <BookmarkCheck className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Your Bookmarks</CardTitle>
                                    <Skeleton className="h-5 w-32 mt-1" /> {/* Bookmark count */}
                                </div>
                            </div>
                            <Button onClick={() => {}} variant="outline" className="gap-2" disabled>
                                <Search className="h-4 w-4" />
                                Browse Dictionary
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                {/* Search Section */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Skeleton className="h-10 w-full" /> {/* Search Input */}
                </div>

                {/* Bookmarks List */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-24" /> {/* Results count */}
                    </div>
                    <div className="space-y-6">
                        {[...Array(6)].map((_, index) => (
                            <Card key={index} className="border-border shadow-md">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-7 w-32" /> {/* Word */}
                                                <Skeleton className="h-6 w-24" /> {/* Grammar badge */}
                                            </div>
                                            <Skeleton className="h-5 w-48" /> {/* English */}
                                            <Skeleton className="h-4 w-36" /> {/* Romanized */}
                                        </div>
                                        <Skeleton className="h-10 w-10 rounded-full" /> {/* Bookmark button */}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Skeleton className="h-6 w-32 mb-3" /> {/* Meanings heading */}
                                        <div className="space-y-4">
                                            {[...Array(2)].map((_, senseIndex) => (
                                                <div key={senseIndex} className="space-y-2">
                                                    <Skeleton className="h-5 w-full" /> {/* Nepali meaning */}
                                                    <Skeleton className="h-4 w-3/4 ml-4" /> {/* English meaning */}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <Skeleton className="h-6 w-32 mb-3" /> {/* Examples heading */}
                                        <div className="space-y-4">
                                            {[...Array(1)].map((_, exampleIndex) => (
                                                <div key={exampleIndex} className="space-y-2">
                                                    <Skeleton className="h-5 w-full" /> {/* Nepali example */}
                                                    <Skeleton className="h-4 w-3/4 ml-4" /> {/* English example */}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BookmarksPage() {
    const router = useRouter();
    const { status } = useSession();
    const { bookmarks, removeBookmark } = useBookmarks();
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredBookmarks, setFilteredBookmarks] = useState<DictionaryEntry[]>([]);

    // Update the type of bookmarks from useBookmarks
    const typedBookmarks = bookmarks as unknown as DictionaryEntry[];

    // Redirect if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/signin");
        }
    }, [status, router]);

    // Filter bookmarks based on search query
    useEffect(() => {
        if (!typedBookmarks) return;

        const filtered = typedBookmarks.filter(bookmark => {
            const searchLower = searchQuery.toLowerCase();
            return (
                bookmark.word?.toLowerCase().includes(searchLower) ||
                bookmark.english?.toLowerCase().includes(searchLower) ||
                bookmark.romanized?.toLowerCase().includes(searchLower)
            );
        });

        setFilteredBookmarks(filtered);
    }, [typedBookmarks, searchQuery]);

    // Handle bookmark removal
    const handleRemoveBookmark = async (wordId: string) => {
        await removeBookmark(wordId);
        // Update filtered bookmarks immediately
        setFilteredBookmarks(prev => prev.filter(bookmark => bookmark._id !== wordId));
    };

    if (status === "loading") {
        return <BookmarksSkeleton />;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Toaster position="top-right" />
            <div className="space-y-8">
                {/* Header Section */}
                <Card className="border-border shadow-lg">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <BookmarkCheck className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Your Bookmarks</CardTitle>
                                    <p className="text-muted-foreground mt-1">
                                        {typedBookmarks.length} {typedBookmarks.length === 1 ? "bookmark" : "bookmarks"} saved
                                    </p>
                                </div>
                            </div>
                            <Button onClick={() => router.push("/")} variant="outline" className="gap-2">
                                <Search className="h-4 w-4" />
                                Browse Dictionary
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                {/* Search Section */}
                {typedBookmarks.length > 0 && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search your bookmarks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                )}

                {/* Bookmarks List */}
                {typedBookmarks.length === 0 ? (
                    <Card className="border-border shadow-md">
                        <CardContent className="py-12 text-center">
                            <BookmarkCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Bookmarks Yet</h3>
                            <p className="text-muted-foreground mb-6">
                                Start bookmarking your favorite words to see them here
                            </p>
                            <Button onClick={() => router.push("/")} className="gap-2">
                                <Search className="h-4 w-4" />
                                Browse Dictionary
                            </Button>
                        </CardContent>
                    </Card>
                ) : filteredBookmarks.length === 0 ? (
                    <Card className="border-border shadow-md">
                        <CardContent className="py-8 text-center">
                            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Matching Bookmarks</h3>
                            <p className="text-muted-foreground">
                                Try adjusting your search query
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-sm">
                                {filteredBookmarks.length} {filteredBookmarks.length === 1 ? "result" : "results"}
                            </Badge>
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchQuery("")}
                                    className="text-muted-foreground"
                                >
                                    Clear search
                                </Button>
                            )}
                        </div>
                        <div className="space-y-6">
                            <WordList 
                                entries={filteredBookmarks} 
                                loading={false} 
                                onRemoveBookmark={handleRemoveBookmark}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}