"use client"

import {DictionaryEntry} from "@/lib/types";
import {WordCard} from "@/components/word-card";

interface WordListProps {
    entries: DictionaryEntry[]
    loading?: boolean
}

export function WordList({entries, loading}: WordListProps){
    if (loading){
        return (
            <div className="flex flex-col gap-4">
                {[...Array(3)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                        <div className="bg-muted rounded-lg h-32"></div>
                    </div>
                ))}
            </div>
        )
    }

    if (entries.length === 0){
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">No entries found. Try a different search term</p>
            </div>
        )
    }

    return (
        <div className="masonry sm:masonry-sm md:masonry-md">
            {entries.map((entry) => (
                <WordCard entry={entry} key={entry._id} />
            ))}
        </div>
    )
}