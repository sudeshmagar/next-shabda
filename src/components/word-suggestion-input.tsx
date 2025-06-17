"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchSuggestion } from "@/components/search-suggestion";
import { DictionaryEntry } from "@/lib/types";
import { useDebounce } from "@/hooks/use-debounce";
import { X } from "lucide-react";

interface WordSuggestionInputProps {
    value: string;
    onChange: (value: string) => void;
    onAdd: (word: string) => void;
    placeholder?: string;
    className?: string;
}

export function WordSuggestionInput({ 
    value, 
    onChange, 
    onAdd, 
    placeholder = "Type a word...",
    className = ""
}: WordSuggestionInputProps) {
    const [suggestions, setSuggestions] = useState<DictionaryEntry[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debouncedValue = useDebounce(value, 300);

    // Fetch suggestions when debounced value changes
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!debouncedValue || debouncedValue.trim().length < 2) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch("/api/words", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        search: debouncedValue, 
                        limit: 10, 
                        page: 1 
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setSuggestions(data.results || []);
                    setShowSuggestions(true);
                }
            } catch (error) {
                console.error("Error fetching suggestions:", error);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, [debouncedValue]);

    const handleSelect = (suggestion: DictionaryEntry) => {
        onAdd(suggestion.word);
        onChange("");
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && value.trim()) {
            e.preventDefault();
            onAdd(value.trim());
            onChange("");
            setShowSuggestions(false);
        }
    };

    const handleFocus = () => {
        if (suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    const handleBlur = () => {
        // Delay hiding suggestions to allow for clicks
        setTimeout(() => setShowSuggestions(false), 200);
    };

    return (
        <div className={`relative ${className}`}>
            <div className="flex gap-2">
                <Input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    className="flex-1"
                />
                {value.trim() && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            onChange("");
                            setShowSuggestions(false);
                        }}
                        className="px-2"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
            
            <SearchSuggestion
                suggestions={suggestions}
                onSelect={handleSelect}
                visible={showSuggestions && !loading}
                position="bottom"
                maxHeight="200px"
            />
            
            {loading && (
                <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-background border border-border rounded-md shadow-lg">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                    </div>
                </div>
            )}
        </div>
    );
} 