"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Volume2 } from "lucide-react";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { DictionaryEntry } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

function WordDetailSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-8">
                {/* Word Header Skeleton */}
                <Card className="border-border shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-48" /> {/* Word */}
                            <Skeleton className="h-6 w-32" /> {/* Phonetic */}
                            <Skeleton className="h-6 w-40" /> {/* Romanized */}
                        </div>
                        <div className="flex items-center space-x-3">
                            <Skeleton className="h-10 w-10 rounded-full" /> {/* Speak button */}
                            <Skeleton className="h-10 w-10 rounded-full" /> {/* Bookmark button */}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-6 w-64" /> {/* English translation */}
                    </CardContent>
                </Card>

                {/* Definitions Skeleton */}
                <div className="space-y-6">
                    {[...Array(2)].map((_, index) => (
                        <Card key={index} className="border-border shadow-md">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-7 w-7" /> {/* Definition number */}
                                    <Skeleton className="h-7 w-24" /> {/* Grammar badge */}
                                    <Skeleton className="h-4 w-32" /> {/* Etymology */}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Skeleton className="h-6 w-32 mb-3" /> {/* Meanings heading */}
                                    <div className="space-y-4">
                                        {[...Array(3)].map((_, senseIndex) => (
                                            <div key={senseIndex} className="space-y-2">
                                                <Skeleton className="h-5 w-full" /> {/* Nepali meaning */}
                                                <Skeleton className="h-4 w-3/4 ml-4" /> {/* English meaning */}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Separator className="my-4" />
                                <div>
                                    <Skeleton className="h-6 w-32 mb-3" /> {/* Examples heading */}
                                    <div className="space-y-4">
                                        {[...Array(2)].map((_, exampleIndex) => (
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
    );
}

export default function WordDetailPage() {
    const { id } = useParams();
    const { data: session } = useSession();
    const [word, setWord] = useState<DictionaryEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isBookmarked, bookmarks } = useBookmarks();
    const [bookmarked, setBookmarked] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        const fetchWord = async () => {
            try {
                const response = await fetch(`/api/words/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch word');
                }
                const data = await response.json();
                setWord(data);
                setBookmarked(data.bookmarked);
            } catch (error) {
                setError('Failed to load word');
                console.error('Error fetching word:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWord();
    }, [id]);

    useEffect(() => {
        if (word?._id) {
            setBookmarked(isBookmarked(word._id));
        }
    }, [bookmarks, word, isBookmarked]);

    const handleSpeak = async (text: string) => {
        try {
            setIsSpeaking(true);
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ne-NP';
            utterance.rate = 0.8;
            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('Error speaking text:', error);
        } finally {
            setIsSpeaking(false);
        }
    };

    const handleBookmark = async () => {
        if (!session) {
            toast.error("Please sign in to bookmark words");
            return;
        }

        try {
            const response = await fetch(`/api/bookmarks/${id}`, {
                method: bookmarked ? 'DELETE' : 'POST',
            });

            if (!response.ok) {
                throw new Error(bookmarked ? 'Failed to remove bookmark' : 'Failed to add bookmark');
            }

            setBookmarked(!bookmarked);
            toast.success(bookmarked ? "Removed from bookmarks" : "Added to bookmarks");
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An error occurred';
            toast.error(errorMessage);
        }
    };

    if (error) return notFound();
    if (loading) return <WordDetailSkeleton />;
    if (!word) return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-red-500">{error}</p>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Toaster />
            <div className="space-y-8">
                {/* Word Header */}
                <Card className="border-border shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-4xl font-bold tracking-tight">{word.word}</CardTitle>
                            {word.phonetic && (
                                <p className="text-lg text-muted-foreground font-mono">{word.phonetic}</p>
                            )}
                            <p className="text-lg text-muted-foreground">{word.romanized}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => word.word && handleSpeak(word.word)}
                                className="h-10 w-10 rounded-full hover:bg-primary/10"
                                disabled={isSpeaking || !word.word}
                            >
                                <Volume2 className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleBookmark}
                                className="h-10 w-10 rounded-full hover:bg-primary/10"
                            >
                                {bookmarked ? (
                                    <BookmarkCheck className="h-5 w-5 text-primary" />
                                ) : (
                                    <Bookmark className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl text-muted-foreground">{word.english}</p>
                    </CardContent>
                </Card>

                {/* Definitions */}
                <div className="space-y-6">
                    {word?.definitions?.map((definition, index) => (
                        <Card key={index} className="border-border shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="h-7 px-3 text-base">{index + 1}</Badge>
                                        {definition.grammar && (
                                            <Badge variant="secondary" className="h-7 px-3">{definition.grammar}</Badge>
                                        )}
                                        {definition.etymology && (
                                            <span className="text-sm text-muted-foreground italic">{definition.etymology}</span>
                                        )}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="text-lg font-semibold mb-3 text-primary">अर्थ (Meanings)</h4>
                                    <ul className="space-y-4 list-none">
                                        {definition.senses.nepali?.map((sense, index) => (
                                            <li key={`nepali-${index}`} className="relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-primary">
                                                <div className="space-y-1">
                                                    <p className="text-base">{sense}</p>
                                                    {definition.senses.english?.[index] && (
                                                        <p className="text-sm text-muted-foreground italic pl-4 border-l-2 border-border">
                                                            {definition.senses.english[index]}
                                                        </p>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {definition.examples?.nepali && definition.examples.nepali.length > 0 && (
                                    <>
                                        <Separator className="my-4" />
                                        <div>
                                            <h4 className="text-lg font-semibold mb-3 text-primary">उदाहरण (Examples)</h4>
                                            <ul className="space-y-4 list-none">
                                                {definition.examples.nepali.map((example, index) => (
                                                    <li key={`example-${index}`} className="relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-primary">
                                                        <div className="space-y-1">
                                                            <p className="text-base">{example}</p>
                                                            {definition.examples?.english?.[index] && (
                                                                <p className="text-sm text-muted-foreground italic pl-4 border-l-2 border-border">
                                                                    {definition.examples.english[index]}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
