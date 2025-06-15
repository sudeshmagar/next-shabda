"use client"

import React from "react"
import type { DictionaryEntry } from "@/lib/types"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
    suggestions: DictionaryEntry[]
    visible: boolean
    onSelect: (entry: DictionaryEntry) => void
    onClose: () => void
}

export function SearchSuggestions({ suggestions, visible, onSelect, onClose }: Props) {
    if (!visible || suggestions.length === 0) return null

    return (
        <div className="absolute z-50 mt-1 w-full rounded-md bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
            <div className="flex justify-between items-center px-3 py-2 border-b">
                <span className="text-sm font-medium text-gray-600">Suggestions</span>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-6 w-6 p-0"
                >
                    <X className="h-4 w-4 text-gray-500" />
                </Button>
            </div>
            <ul>
                {suggestions.map((entry) => (
                    <li
                        key={entry._id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-800"
                        onClick={() => onSelect(entry)}
                    >
                        <div className="font-semibold">{entry.word}</div>
                        <div className="text-xs text-muted-foreground">{entry.english}</div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
