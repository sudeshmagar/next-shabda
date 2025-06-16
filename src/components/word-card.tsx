"use client"


import {DictionaryEntry} from "@/lib/types";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Bookmark, BookmarkCheck, Volume2} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {useBookmarks} from "@/hooks/use-bookmarks";
import {useEffect, useState} from "react";
import Link from "next/link";

interface WordCardProps {
    entry: DictionaryEntry;
    onRemoveBookmark?: (wordId: string) => Promise<void>;
}

export function WordCard({entry, onRemoveBookmark}: WordCardProps) {


    const {isBookmarked, toggleBookmark, bookmarks} = useBookmarks();
    const [bookmarked, setBookmarked] = useState(false)


    //helper function to pair nepali and english senses
    const getPairedSenses = (definition: { senses: { nepali?: string[]; english?: string[] } }) => {
        const nepaliSenses = definition.senses.nepali || [];
        const englishSenses = definition.senses.english || [];
        const maxLength = Math.max(nepaliSenses.length, englishSenses.length)

        const paired = []
        for (let i = 0; i < maxLength; i++) {
            paired.push({
                nepali: nepaliSenses[i] || "",
                english: englishSenses[i] || "",
            })
        }
        return paired;
    }

    // Helper function to pair Nepali and English examples
    // const getPairedExamples = (definition: { examples?: { nepali?: string[]; english?: string[] } }) => {
    //     const nepaliExamples = definition.examples?.nepali || []
    //     const englishExamples = definition.examples?.english || []
    //     const maxLength = Math.max(nepaliExamples.length, englishExamples.length)

    //     const paired = []
    //     for (let i = 0; i < maxLength; i++) {
    //         paired.push({
    //             nepali: nepaliExamples[i] || "",
    //             english: englishExamples[i] || "",
    //         })
    //     }

    //     return paired
    // }

    useEffect(() => {
        const currentlyBookmarked = isBookmarked(entry._id);
        setBookmarked(currentlyBookmarked);
    }, [bookmarks, entry._id, isBookmarked]);

    const handleToggleBookmark = async () => {
        if (bookmarked && onRemoveBookmark) {
            await onRemoveBookmark(entry._id);
        } else {
            await toggleBookmark(entry._id);
        }
    }

    const speakWord = (phonetic?: string) => {
        const utterance = new SpeechSynthesisUtterance(phonetic);
        utterance.lang = "en-US"; // Set language to Nepali

        window.speechSynthesis.speak(utterance);
    }


    return (

            <Card className="w-full h-fit border-border">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-2xl font-bold">{entry.word}</h3>
                                <Button variant="ghost" size="sm" onClick={() => speakWord(entry?.phonetic || "")} title="Speak Word"
                                        className="p-1"
                                >
                                    <Volume2 className="h-4 w-4"/>
                                </Button>
                            </div>
                            <p className="text-lg text-muted-foreground">{entry.english}</p>
                            {entry.romanized && (
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">Romanized:</span> {entry.romanized}
                                </p>
                            )}
                        </div>
                        <Button variant="ghost" size="sm" className="shrink-0" onClick={handleToggleBookmark}>
                            {/* Check if the entry is bookmarked */}
                            {bookmarked ? (<BookmarkCheck className={"h-5 w-5 text-primary"}/>) : (
                                <Bookmark className={"h-5 w-5"}/>)}
                        </Button>
                    </div>
                </CardHeader>
                <Link href="/words/[id]" as={`/words/${entry._id}`} className="no-underline">
                <CardContent>
                    <div className="flex flex-col gap-6">
                        {entry.definitions?.map((definition, index) => (
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
                                    {definition.etymology &&
                                        <span className="text-xs text-muted-foreground">{definition.etymology}</span>}
                                </div>

                                <div className="flex flex-col gap-4">
                                    {/*paired senses*/}
                                    {getPairedSenses(definition).length > 0 && (
                                        <div>
                                            <h4 className="font-semibold mb-2 text-primary">अर्थ (Meanings)</h4>
                                            <ul className="space-y-3 list-disc list-outside pl-4">
                                                {getPairedSenses(definition).map((pair, idx) => (
                                                    <li key={idx} className="text-muted-foreground">
                                                        {pair.nepali &&
                                                            <div className="font-medium">{pair.nepali}</div>}
                                                        {pair.english && (
                                                            <div
                                                                className=" text-sm italic text-muted-foreground">{pair.english}</div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Paired Examples */}
                                    {/*{getPairedExamples(definition).length > 0 && (*/}
                                    {/*    <div>*/}
                                    {/*        <h4 className="font-semibold mb-2 text-primary">उदाहरण (Examples)</h4>*/}
                                    {/*        <ul className="space-y-4">*/}
                                    {/*            {getPairedExamples(definition).map((pair, idx) => (*/}
                                    {/*                <li key={idx} className="text-muted-foreground">*/}
                                    {/*                    {pair.nepali && <div className="text-sm">• {pair.nepali}</div>}*/}
                                    {/*                    {pair.english && (*/}
                                    {/*                        <div*/}
                                    {/*                            className="pl-4 text-sm italic text-muted-foreground">{pair.english}</div>*/}
                                    {/*                    )}*/}
                                    {/*                </li>*/}
                                    {/*            ))}*/}
                                    {/*        </ul>*/}
                                    {/*    </div>*/}
                                    {/*)}*/}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
                </Link>
            </Card>

    )
}