"use client"

import {useCallback, useState} from "react"
import type {DictionaryEntry} from "@/lib/types"

export function useSearchSuggestions() {
    const [suggestions, setSuggestions] = useState<DictionaryEntry[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const getSuggestions = useCallback((query: string) => {
        if (!query.trim()) {
            setSuggestions([])
            return
        }

        setLoading(true)
        setError(null)

        // Debounce the search to avoid too many calls
        const timeoutId = setTimeout(() => {
            try {
                const response = await fetch(
                    `/api/words/suggestions?q=${encodeURIComponent(query)}&limit=8`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        }
                    }
                )

                if (!response.ok) {
                    throw new Error(`Failed to fetch Suggestions: ${response.statusText}`)
                }

                const result: DictionaryEntry[] = await response.json()
                setSuggestions(result)

            } catch (err) {
                console.error("Error while fetching Suggestions", err)
                setError("Failed to load suggestions. Please try again later")
                setSuggestions([])
            } finally {
                setLoading(false)
            }
        }, 150)

        return () => clearTimeout(timeoutId)
    }, [])

    const clearSuggestions = useCallback(() => {
        setSuggestions([])
        setError(null)
    }, [])

    return {
        suggestions,
        loading,
        error,
        getSuggestions,
        clearSuggestions,
    }
}
