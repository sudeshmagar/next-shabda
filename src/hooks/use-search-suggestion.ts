"use client"

import {useCallback, useState} from "react"
import type {DictionaryEntry} from "@/lib/types"
import {toast} from "sonner"

export function useSearchSuggestions() {
    const [suggestions, setSuggestions] = useState<DictionaryEntry[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const getSuggestions = useCallback((query: string, filter?: string) => {
        if (!query.trim() && !filter) {
            setSuggestions([])
            return () => {}
        }

        setLoading(true)
        setError(null)

        // Debounce the search to avoid too many calls
        const timeoutId = setTimeout(async () => {
            try {
                const params = new URLSearchParams({
                    q: query.trim(),
                    limit: "8",
                })

                if (filter) {
                    params.append("startsWith", filter)
                }

                const response = await fetch(
                    `/api/words/suggestions?${params.toString()}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        }
                    }
                )

                if (!response.ok) {
                    throw new Error(`Failed to fetch suggestions: ${response.statusText}`)
                }

                const result: DictionaryEntry[] = await response.json()
                setSuggestions(result)

            } catch (err) {
                console.error("Error while fetching suggestions:", err)
                setError("Failed to load suggestions. Please try again later")
                setSuggestions([])
                toast.error("Failed to load suggestions")
            } finally {
                setLoading(false)
            }
        }, 300) // Increased debounce time to 300ms for better performance

        return () => clearTimeout(timeoutId)
    }, [])

    const clearSuggestions = useCallback(() => {
        setSuggestions([])
        setError(null)
        setLoading(false)
    }, [])

    return {
        suggestions,
        loading,
        error,
        getSuggestions,
        clearSuggestions,
    }
}
