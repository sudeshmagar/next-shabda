"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewWordPage() {
    const [word, setWord] = useState("");
    const [romanized, setRomanized] = useState("");
    const [english, setEnglish] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        await fetch("/api/words", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word, romanized, english, phonetic: romanized, definitions: [] }),
        });

        router.push("/");
    };

    return (
        <main className="p-6">
            <h1 className="text-xl font-bold mb-4">Add New Word</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input placeholder="Word (Nepali)" value={word} onChange={(e) => setWord(e.target.value)} className="border p-2 rounded" />
                <input placeholder="Romanized" value={romanized} onChange={(e) => setRomanized(e.target.value)} className="border p-2 rounded" />
                <input placeholder="English" value={english} onChange={(e) => setEnglish(e.target.value)} className="border p-2 rounded" />
                <button className="bg-green-600 text-white p-2 rounded">Save</button>
            </form>
        </main>
    );
}
