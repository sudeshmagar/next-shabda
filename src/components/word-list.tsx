"use client"

import { DictionaryEntry,} from "@/lib/types";
import {WordCard} from "@/components/word-card";
import {motion} from "framer-motion";



interface WordListProps {
    entries: DictionaryEntry[]
    loading?: boolean
}



export function WordList({entries, loading }: WordListProps){
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
                <div key={entry._id} className="break-inside mb-6">
                    <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: 0.5 }}
                    >
                        <WordCard entry={entry} />
                    </motion.div>
                </div>


            ))}
        </div>
    )
}