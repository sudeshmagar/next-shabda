"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditWordPage() {
    const { id } = useParams();
    const router = useRouter();
    const [form, setForm] = useState<any>(null);

    useEffect(() => {
        if (!id) return;
        fetch(`/api/words/${id}`)
            .then((res) => res.json())
            .then((data) => setForm(data));
    }, [id]);

    const handleFieldChange = (field: string, value: any) => {
        setForm((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleDefinitionChange = (defIndex: number, field: string, value: any) => {
        setForm((prev: any) => {
            const definitions = [...prev.definitions];
            definitions[defIndex][field] = value;
            return { ...prev, definitions };
        });
    };

    const handleNestedArrayChange = (
        defIndex: number,
        field: "senses" | "examples",
        lang: "nepali" | "english",
        value: string,
        index: number
    ) => {
        const updated = [...form.definitions];
        updated[defIndex][field][lang][index] = value;
        setForm({ ...form, definitions: updated });
    };

    const addItem = (
        defIndex: number,
        field: "senses" | "examples",
        lang: "nepali" | "english"
    ) => {
        const updated = [...form.definitions];
        updated[defIndex][field][lang].push("");
        setForm({ ...form, definitions: updated });
    };

    const removeItem = (
        defIndex: number,
        field: "senses" | "examples",
        lang: "nepali" | "english",
        index: number
    ) => {
        const updated = [...form.definitions];
        updated[defIndex][field][lang].splice(index, 1);
        setForm({ ...form, definitions: updated });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        await fetch(`/api/words/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        router.push("/");
    };

    if (!form) return <p className="p-6">Loading...</p>;

    return (
        <main className="p-6 space-y-6">
            <h1 className="text-xl font-bold">Edit Word</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Word Fields */}
                <div>
                    <label className="block font-semibold">Nepali Word</label>
                    <input
                        className="border p-2 w-full"
                        value={form.word}
                        onChange={(e) => handleFieldChange("word", e.target.value)}
                    />
                </div>

                <div>
                    <label className="block font-semibold">Romanized</label>
                    <input
                        className="border p-2 w-full"
                        value={form.romanized}
                        onChange={(e) => handleFieldChange("romanized", e.target.value)}
                    />
                </div>

                <div>
                    <label className="block font-semibold">Phonetic</label>
                    <input
                        className="border p-2 w-full"
                        value={form.phonetic}
                        onChange={(e) => handleFieldChange("phonetic", e.target.value)}
                    />
                </div>

                <div>
                    <label className="block font-semibold">English</label>
                    <input
                        className="border p-2 w-full"
                        value={form.english}
                        onChange={(e) => handleFieldChange("english", e.target.value)}
                    />
                </div>

                {/* Definitions */}
                {form.definitions.map((def: any, defIndex: number) => (
                    <div key={defIndex} className="border p-4 rounded bg-gray-50 space-y-4">
                        <div>
                            <label className="block font-semibold">Grammar</label>
                            <input
                                className="border p-2 w-full"
                                value={def.grammar}
                                onChange={(e) => handleDefinitionChange(defIndex, "grammar", e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block font-semibold">Etymology</label>
                            <input
                                className="border p-2 w-full"
                                value={def.etymology}
                                onChange={(e) => handleDefinitionChange(defIndex, "etymology", e.target.value)}
                            />
                        </div>

                        {/* Senses */}
                        {["nepali", "english"].map((lang) => (
                            <div key={lang}>
                                <label className="block font-semibold capitalize">Senses ({lang})</label>
                                {def.senses[lang].map((sense: string, i: number) => (
                                    <div key={i} className="flex gap-2 mt-1">
                                        <input
                                            className="border p-2 w-full"
                                            value={sense}
                                            onChange={(e) =>
                                                handleNestedArrayChange(defIndex, "senses", lang as any, e.target.value, i)
                                            }
                                        />
                                        <button
                                            type="button"
                                            className="text-red-500"
                                            onClick={() => removeItem(defIndex, "senses", lang as any, i)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="text-blue-600 mt-1"
                                    onClick={() => addItem(defIndex, "senses", lang as any)}
                                >
                                    + Add {lang} Sense
                                </button>
                            </div>
                        ))}

                        {/* Examples */}
                        {["nepali", "english"].map((lang) => (
                            <div key={lang}>
                                <label className="block font-semibold capitalize">Examples ({lang})</label>
                                {def.examples[lang].map((ex: string, i: number) => (
                                    <div key={i} className="flex gap-2 mt-1">
                                        <input
                                            className="border p-2 w-full"
                                            value={ex}
                                            onChange={(e) =>
                                                handleNestedArrayChange(defIndex, "examples", lang as any, e.target.value, i)
                                            }
                                        />
                                        <button
                                            type="button"
                                            className="text-red-500"
                                            onClick={() => removeItem(defIndex, "examples", lang as any, i)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="text-blue-600 mt-1"
                                    onClick={() => addItem(defIndex, "examples", lang as any)}
                                >
                                    + Add {lang} Example
                                </button>
                            </div>
                        ))}
                    </div>
                ))}

                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    Update Word
                </button>
            </form>
        </main>
    );
}
