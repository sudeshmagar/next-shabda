"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";
import { useWordSuggestions } from "@/hooks/use-word-suggestions";

interface ThesaurusProps {
    synonyms?: string[];
    antonyms?: string[];
}

export function Thesaurus({ synonyms, antonyms }: ThesaurusProps) {
    // Ensure synonyms and antonyms are arrays
    const safeSynonyms = useMemo(() =>
        Array.isArray(synonyms) ? synonyms : [], [synonyms])
    const safeAntonyms = useMemo(() =>
        Array.isArray(antonyms) ? antonyms : [], [antonyms])
    
    const hasSynonyms = safeSynonyms.length > 0;
    const hasAntonyms = safeAntonyms.length > 0;

    // Memoize the word array to prevent infinite loops
    const allWords = useMemo(() => {
        const words = [
            ...safeSynonyms,
            ...safeAntonyms
        ].filter(word => word && word.trim() !== '');
        
        // Sort to ensure consistent array reference
        return words.sort();
    }, [safeSynonyms, safeAntonyms]);

    const { suggestions, loading } = useWordSuggestions(allWords);

    if (!hasSynonyms && !hasAntonyms) {
        return null;
    }

    const renderWordBadge = (word: string) => {
        const suggestion = suggestions[word];
        
        if (suggestion) {
            // Word exists in database - link to detail page
            return (
                <Link 
                    href={`/words/${suggestion.id}`}
                    className="inline-block"
                >
                    <Badge 
                        variant="secondary" 
                        className="hover:bg-primary/20 cursor-pointer transition-colors"
                        title={`${suggestion.word} - ${suggestion.english}`}
                    >
                        {word}
                    </Badge>
                </Link>
            );
        } else {
            // Word doesn't exist - show as plain text or link to search
            return (
                <Link 
                    href={`/?q=${encodeURIComponent(word)}`}
                    className="inline-block"
                >
                    <Badge 
                        variant="outline" 
                        className="hover:bg-muted cursor-pointer transition-colors opacity-60"
                        title="Word not found in database - search for similar words"
                    >
                        {word}
                    </Badge>
                </Link>
            );
        }
    };

    return (
        <Card className="border-border shadow-md">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-primary">समानार्थी र विपरीतार्थी (Synonyms & Antonyms)</span>
                    {loading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Synonyms */}
                {hasSynonyms && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <ArrowUpRight className="h-5 w-5 text-green-600" />
                            <h4 className="text-lg font-semibold text-green-600">समानार्थी (Synonyms)</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {safeSynonyms.map((synonym, index) => (
                                <div key={`syn-${index}`}>
                                    {renderWordBadge(synonym)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Separator if both synonyms and antonyms exist */}
                {hasSynonyms && hasAntonyms && <Separator className="my-4" />}

                {/* Antonyms */}
                {hasAntonyms && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <ArrowDownRight className="h-5 w-5 text-red-600" />
                            <h4 className="text-lg font-semibold text-red-600">विपरीतार्थी (Antonyms)</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {safeAntonyms.map((antonym, index) => (
                                <div key={`ant-${index}`}>
                                    {renderWordBadge(antonym)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 