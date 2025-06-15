"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useBookmarks } from "@/hooks/use-bookmarks";

export default function WordDetailPage() {
    const { id } = useParams();
    const [word, setWord] = useState<any>(null);
    const [error, setError] = useState(false);
    const { isBookmarked, toggleBookmark, bookmarks } = useBookmarks();
    const [bookmarked, setBookmarked] = useState(false);

    useEffect(() => {
        const fetchWordById = async () => {
            try {
                const res = await fetch(`/api/words/${id}`, { cache: "no-store" });
                if (!res.ok) throw new Error("Not found");
                const data = await res.json();
                setWord(data);
            } catch (err) {
                setError(true);
            }
        };

        fetchWordById();
    }, [id]);

    useEffect(() => {
        if (word?._id) {
            setBookmarked(isBookmarked(word._id));
        }
    }, [bookmarks, word, isBookmarked]);

    const handleToggleBookmark = async () => {
        if (!word?._id) return;
        await toggleBookmark(word._id);
    };

    if (error) return notFound();
    if (!word) return <p className="p-6">Loading...</p>;

    return (
        <main className="p-6 max-w-4xl mx-auto">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-4xl font-bold mb-1">{word.word}</h1>
                    <p className="text-muted-foreground">
                        {word.romanized && (
                            <><span className="font-semibold">Romanized:</span> {word.romanized}<br /></>
                        )}
                        {word.phonetic && (
                            <><span className="font-semibold">Phonetic:</span> /{word.phonetic}/<br /></>
                        )}
                        {word.english && (
                            <><span className="font-semibold">English:</span> {word.english}</>
                        )}
                    </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleToggleBookmark}>
                    {bookmarked ? (
                        <BookmarkCheck className="h-5 w-5 text-yellow-500" />
                    ) : (
                        <Bookmark className="h-5 w-5" />
                    )}
                </Button>
            </div>

            <div className="space-y-8">
                {word.definitions.map((def: any, i: number) => (
                    <div key={i} className="bg-muted rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-semibold">{def.grammar}</h2>
                            {def.etymology && <span className="text-sm italic text-muted-foreground">{def.etymology}</span>}
                        </div>

                        {def.senses.nepali?.length > 0 && (
                            <div className="mb-4">
                                <h4 className="font-medium text-primary mb-1">Senses (नेपाली):</h4>
                                <ul className="list-disc pl-6 text-sm text-gray-800 space-y-1">
                                    {def.senses.nepali.map((s: string, j: number) => (
                                        <li key={j}>{s}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {def.senses.english?.length > 0 && (
                            <div className="mb-4">
                                <h4 className="font-medium text-primary mb-1">Senses (English):</h4>
                                <ul className="list-disc pl-6 text-sm text-gray-800 space-y-1">
                                    {def.senses.english.map((s: string, j: number) => (
                                        <li key={j}>{s}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {def.examples.nepali?.length > 0 && (
                            <div className="mb-4">
                                <h4 className="font-medium text-primary mb-1">Examples (नेपाली):</h4>
                                <ul className="list-disc pl-6 text-sm italic text-gray-700 space-y-1">
                                    {def.examples.nepali.map((ex: string, j: number) => (
                                        <li key={j}>{ex}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {def.examples.english?.length > 0 && (
                            <div className="mb-4">
                                <h4 className="font-medium text-primary mb-1">Examples (English):</h4>
                                <ul className="list-disc pl-6 text-sm italic text-gray-700 space-y-1">
                                    {def.examples.english.map((ex: string, j: number) => (
                                        <li key={j}>{ex}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </main>
    );
}
