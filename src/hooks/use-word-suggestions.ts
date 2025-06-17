import { useState, useEffect, useMemo, useRef } from 'react';

interface WordSuggestion {
    id: string;
    word: string;
    romanized: string;
    english: string;
}

interface WordSuggestions {
    [key: string]: WordSuggestion;
}

export function useWordSuggestions(words: string[]) {
    const [suggestions, setSuggestions] = useState<WordSuggestions>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const prevWordsRef = useRef<string[]>([]);

    // Memoize the words array to prevent infinite loops
    const memoizedWords = useMemo(() => {
        const filteredWords = words.filter(word => word && word.trim() !== '');
        // Sort to ensure consistent array reference
        return filteredWords.sort();
    }, [words]);

    useEffect(() => {
        // Skip if words haven't changed
        if (JSON.stringify(memoizedWords) === JSON.stringify(prevWordsRef.current)) {
            return;
        }

        const fetchSuggestions = async () => {
            if (!memoizedWords || memoizedWords.length === 0) {
                setSuggestions({});
                prevWordsRef.current = memoizedWords;
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await fetch('/api/words/suggestions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ words: memoizedWords }),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch word suggestions');
                }

                const data = await response.json();
                setSuggestions(data.suggestions || {});
                prevWordsRef.current = memoizedWords;
            } catch (err) {
                console.error('Error fetching word suggestions:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
                setSuggestions({});
                prevWordsRef.current = memoizedWords;
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, [memoizedWords]);

    return { suggestions, loading, error };
} 