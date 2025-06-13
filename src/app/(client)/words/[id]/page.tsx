"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";

export default function WordDetailPage() {
    const { id } = useParams();
    const [word, setWord] = useState<any>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchWordById = async () => {
            try {
                const res = await fetch(`/api/words/${id}`, { cache: "no-store" });
                if (!res.ok) throw new Error("Not found");
                const data = await res.json();
                setWord(data);
            } catch (err) {
                setError(true);
            }
        };

        fetchWordById();
    }, [id]);

    if (error) return notFound();
    if (!word) return <p className="p-6">Loading...</p>;

    return (
        <main className="p-6 max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">{word.word}</h1>
            <p className="text-gray-600">
                <span className="font-semibold">Romanized:</span> {word.romanized}
                <br />
                <span className="font-semibold">Phonetic:</span> /{word.phonetic}/
                <br />
                <span className="font-semibold">English:</span> {word.english}
            </p>

            <div className="space-y-6">
                {word.definitions.map((def: any, i: number) => (
                    <div key={i} className="border-l-4 border-blue-500 pl-4 py-2">
                        <p className="font-semibold">
                            {def.grammar}
                            {def.etymology ? ` · ${def.etymology}` : ""}
                        </p>

                        {def.senses.nepali?.length > 0 && (
                            <>
                                <h4 className="mt-2 font-medium">Senses (नेपाली):</h4>
                                <ul className="list-disc pl-6 text-gray-800">
                                    {def.senses.nepali.map((s: string, j: number) => (
                                        <li key={j}>{s}</li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {def.senses.english?.length > 0 && (
                            <>
                                <h4 className="mt-2 font-medium">Senses (English):</h4>
                                <ul className="list-disc pl-6 text-gray-800">
                                    {def.senses.english.map((s: string, j: number) => (
                                        <li key={j}>{s}</li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {def.examples.nepali?.length > 0 && (
                            <>
                                <h4 className="mt-2 font-medium">Examples (नेपाली):</h4>
                                <ul className="list-disc pl-6 text-gray-700 italic">
                                    {def.examples.nepali.map((ex: string, j: number) => (
                                        <li key={j}>{ex}</li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {def.examples.english?.length > 0 && (
                            <>
                                <h4 className="mt-2 font-medium">Examples (English):</h4>
                                <ul className="list-disc pl-6 text-gray-700 italic">
                                    {def.examples.english.map((ex: string, j: number) => (
                                        <li key={j}>{ex}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </main>
    );
}
