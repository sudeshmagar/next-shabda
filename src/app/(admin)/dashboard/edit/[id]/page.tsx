"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Definition = {
    grammar: string;
    etymology: string;
    senses: { nepali: string[]; english: string[] };
    examples: { nepali: string[]; english: string[] };
};

interface WordForm {
    word: string;
    romanized: string;
    phonetic?: string;
    english: string;
    definitions: Definition[];
}

export default function EditWordPage() {
    const { id } = useParams();
    const router = useRouter();
    const [form, setForm] = useState<WordForm | null>(null);

    useEffect(() => {
        if (!id) return;
        fetch(`/api/words/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setForm({
                    word: data.word || "",
                    romanized: data.romanized || "",
                    phonetic: data.phonetic || "",
                    english: data.english || "",
                    definitions: (data.definitions || []).map((def: any) => ({
                        grammar: def.grammar || "",
                        etymology: def.etymology || "",
                        senses: {
                            nepali: (def.senses?.nepali || [""]).map((s: string) => s || ""),
                            english: (def.senses?.english || [""]).map((s: string) => s || ""),
                        },
                        examples: {
                            nepali: (def.examples?.nepali || [""]).map((e: string) => e || ""),
                            english: (def.examples?.english || [""]).map((e: string) => e || ""),
                        },
                    })),
                });
            });
    }, [id]);

    const handleFieldChange = (field: keyof WordForm, value: string) => {
        setForm((prev) => prev ? { ...prev, [field]: value } : prev);
    };

    const handleDefinitionChange = (defIndex: number, field: keyof Definition, value: string) => {
        setForm((prev) => {
            if (!prev) return prev;
            const definitions = [...prev.definitions];
            if (field === "grammar" || field === "etymology") {
                (definitions[defIndex][field] as string) = value;
            }
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
        if (!form) return;
        const updated = [...form.definitions];
        updated[defIndex][field][lang][index] = value;
        setForm({
            word: form.word,
            romanized: form.romanized,
            phonetic: form.phonetic,
            english: form.english,
            definitions: updated,
        });
    };

    const addItem = (
        defIndex: number,
        field: "senses" | "examples",
        lang: "nepali" | "english"
    ) => {
        if (!form) return;
        const updated = [...form.definitions];
        updated[defIndex][field][lang].push("");
        setForm({
            word: form.word,
            romanized: form.romanized,
            phonetic: form.phonetic,
            english: form.english,
            definitions: updated,
        });
    };

    const removeItem = (
        defIndex: number,
        field: "senses" | "examples",
        lang: "nepali" | "english",
        index: number
    ) => {
        if (!form) return;
        const updated = [...form.definitions];
        updated[defIndex][field][lang].splice(index, 1);
        setForm({
            word: form.word,
            romanized: form.romanized,
            phonetic: form.phonetic,
            english: form.english,
            definitions: updated,
        });
    };

    const addNewDefinition = () => {
        const newDef = {
            grammar: "",
            etymology: "",
            senses: { nepali: [""], english: [""] },
            examples: { nepali: [""], english: [""] },
        };
        setForm((prev: any) => ({ ...prev, definitions: [...prev.definitions, newDef] }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        await fetch(`/api/words/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        router.push("/dashboard");
    };

    if (!form) return <p className="p-6">Loading...</p>;

    return (
        <main className="max-w-4xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Word</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nepali Word</label>
                            <Input
                                value={form.word}
                                onChange={(e) => handleFieldChange("word", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Romanized</label>
                            <Input
                                value={form.romanized}
                                onChange={(e) => handleFieldChange("romanized", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Phonetic</label>
                            <Input
                                value={form.phonetic}
                                onChange={(e) => handleFieldChange("phonetic", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">English Meaning</label>
                            <Input
                                value={form.english}
                                onChange={(e) => handleFieldChange("english", e.target.value)}
                            />
                        </div>

                        {form.definitions.map((def: any, defIndex: number) => (
                            <div key={defIndex} className="border p-4 rounded-md space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Grammar</label>
                                    <Input
                                        value={def.grammar}
                                        onChange={(e) => handleDefinitionChange(defIndex, "grammar", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Etymology</label>
                                    <Input
                                        value={def.etymology}
                                        onChange={(e) => handleDefinitionChange(defIndex, "etymology", e.target.value)}
                                    />
                                </div>

                                {(["nepali", "english"] as const).map((lang) => (
                                    <div key={lang}>
                                        <h4 className="font-semibold mb-2 capitalize">Senses ({lang})</h4>
                                        {def.senses[lang].map((sense: string, i: number) => (
                                            <div key={i} className="flex gap-2 mb-1">
                                                <Input
                                                    value={sense}
                                                    onChange={(e) =>
                                                        handleNestedArrayChange(defIndex, "senses", lang, e.target.value, i)
                                                    }
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => removeItem(defIndex, "senses", lang, i)}
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => addItem(defIndex, "senses", lang)}
                                        >
                                            + Add Sense
                                        </Button>
                                    </div>
                                ))}

                                {(["nepali", "english"] as const).map((lang) => (
                                    <div key={lang}>
                                        <h4 className="font-semibold mb-2 capitalize">Examples ({lang})</h4>
                                        {def.examples[lang].map((ex: string, i: number) => (
                                            <div key={i} className="flex gap-2 mb-1">
                                                <Input
                                                    value={ex}
                                                    onChange={(e) =>
                                                        handleNestedArrayChange(defIndex, "examples", lang, e.target.value, i)
                                                    }
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => removeItem(defIndex, "examples", lang, i)}
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => addItem(defIndex, "examples", lang)}
                                        >
                                            + Add Example
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ))}

                        <Button type="button" variant="secondary" onClick={addNewDefinition}>
                            + Add New Grammar Section
                        </Button>

                        <Button type="submit" className="w-full">
                            Update Word
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
