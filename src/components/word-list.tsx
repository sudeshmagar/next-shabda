"use client"

import {DictionaryEntry} from "@/lib/types";
import {WordCard} from "@/components/word-card";
import {motion} from "framer-motion";
import dynamic from "next/dynamic";

interface WordListProps {
    entries: DictionaryEntry[];
    loading?: boolean;
}

export function WordList({entries, loading}: WordListProps) {
    const Masonry = dynamic(() => import('react-masonry-css'), { ssr: false})

    if (loading && entries.length === 0) {
        return (
            <div className="flex flex-col gap-4">
                {[...Array(3)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                        <div className="bg-muted rounded-lg h-32"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">No entries found. Try a different search term.</p>
            </div>
        );
    }

    return (
        <>
            <Masonry breakpointCols={3}
                     className="flex">
                {entries.map((entry, index) => (
                    <motion.div
                        key={entry._id || index}
                        initial={{opacity: 0, y: 20}}
                        whileInView={{opacity: 1, y: 0}}
                        viewport={{once: true}}
                        transition={{duration: 0.3}}
                    >
                        <div className="p-2">
                            <WordCard entry={entry}/>
                        </div>

                    </motion.div>
                ))}
            </Masonry>

            {/*<div ref={masonryContainer} className="grid items-start gap-4 sm:grid-cols-3 md:gap-6">*/}
            {/*    {entries.map((entry, index) => (*/}
            {/*        <motion.div*/}
            {/*            key={entry._id || index}*/}
            {/*            initial={{ opacity: 0, y: 20 }}*/}
            {/*            whileInView={{ opacity: 1, y: 0 }}*/}
            {/*            viewport={{ once: true }}*/}
            {/*            transition={{ duration: 0.3 }}*/}
            {/*        >*/}
            {/*            <WordCard entry={entry} />*/}
            {/*        </motion.div>*/}
            {/*    ))}*/}

            {/*</div>*/}

        </>

    );
}
