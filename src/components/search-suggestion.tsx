"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DictionaryEntry } from "@/lib/types"

interface SearchSuggestionProps {
    suggestions: DictionaryEntry[]
    onSelect: (word: DictionaryEntry) => void
    visible: boolean
    position?: "top" | "bottom"
    maxHeight?: string
}

export function SearchSuggestion({ 
    suggestions, 
    onSelect, 
    visible, 
    position = "bottom",
    maxHeight = "200px"
}: SearchSuggestionProps) {
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setSelectedIndex(-1)
    }, [suggestions])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!visible || suggestions.length === 0) return

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault()
                    setSelectedIndex(prev => 
                        prev < suggestions.length - 1 ? prev + 1 : 0
                    )
                    break
                case "ArrowUp":
                    e.preventDefault()
                    setSelectedIndex(prev => 
                        prev > 0 ? prev - 1 : suggestions.length - 1
                    )
                    break
                case "Enter":
                    e.preventDefault()
                    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                        onSelect(suggestions[selectedIndex])
                    }
                    break
                case "Escape":
                    setSelectedIndex(-1)
                    break
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [visible, suggestions, selectedIndex, onSelect])

    if (!visible || suggestions.length === 0) return null

    return (
        <Card 
            ref={containerRef}
            className={`absolute z-50 w-full shadow-lg border-border ${
                position === "top" ? "bottom-full mb-1" : "top-full mt-1"
            }`}
        >
            <CardContent className="p-2">
                <div 
                    className="space-y-1 overflow-y-auto"
                    style={{ maxHeight }}
                >
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={suggestion._id}
                            className={`p-2 rounded cursor-pointer transition-colors ${
                                index === selectedIndex
                                    ? "bg-primary/10 border border-primary/20"
                                    : "hover:bg-muted"
                            }`}
                            onClick={() => onSelect(suggestion)}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{suggestion.word}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {suggestion.romanized}
                                    </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {suggestion.english}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
