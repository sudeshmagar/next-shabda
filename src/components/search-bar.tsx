"use client"

import React, { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {useSearchSuggestions} from "@/hooks/use-search-suggestion";
import type { DictionaryEntry } from "@/lib/types"
import {SearchSuggestions} from "@/components/search-suggestion";

interface SearchBarProps {
    onSearch: (query: string) => void
    loading?: boolean
}

const filterLetters = ["क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ"];

export function SearchBar({ onSearch, loading }: SearchBarProps) {
    const [query, setQuery] = useState("")
    const [filter, setFilter] = useState<string | null>(null)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const { suggestions, getSuggestions, clearSuggestions } = useSearchSuggestions()

    // Handle input changes and get suggestions
    useEffect(() => {
        const cleanup = getSuggestions(query, filter)
        setShowSuggestions(isFocused && (query.trim().length > 0 || filter !== null))

        return cleanup
    }, [query, isFocused, filter, getSuggestions])

    // Handle clicks outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
                setIsFocused(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            onSearch(query.trim())
            setShowSuggestions(false)
            inputRef.current?.blur()
        }
    }

    const handleSuggestionSelect = (entry: DictionaryEntry) => {
        setQuery(entry.word)
        setFilter(null)
        onSearch(entry.word)
        setShowSuggestions(false)
        inputRef.current?.blur()
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value)
        setFilter(null)
    }

    const handleInputFocus = () => {
        setIsFocused(true)
        if (query.trim().length > 0) {
            setShowSuggestions(true)
        }
    }

    const handleClearSearch = () => {
        setQuery("")
        setFilter(null)
        setShowSuggestions(false)
        clearSuggestions()
        inputRef.current?.focus()
        onSearch("")
    }

    const handleCloseSuggestions = () => {
        setShowSuggestions(false)
    }

    return (
        <div ref={containerRef} className="relative">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder="Search Nepali or English words..."
                        value={query}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        className="pl-10 pr-10"
                        autoComplete="off"
                    />
                    {query && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                            onClick={handleClearSearch}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <Button type="submit" disabled={loading || !query.trim()}>
                    {loading ? "Searching..." : "Search"}
                </Button>
            </form>

            <SearchSuggestions
                suggestions={suggestions}
                onSelect={handleSuggestionSelect}
                onClose={handleCloseSuggestions}
                visible={showSuggestions}
            />
        </div>
    )
}
