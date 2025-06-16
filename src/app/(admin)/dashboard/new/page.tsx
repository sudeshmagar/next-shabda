"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function NewWordPage() {
    const [form, setForm] = useState<WordForm>({
        word: "",
        romanized: "",
        phonetic: "",
        english: "",
        definitions: [
            {
                grammar: "",
                etymology: "",
                senses: { nepali: [""], english: [""] },
                examples: { nepali: [""], english: [""] },
            },
        ],
    });
    const router = useRouter();

    const handleFieldChange = (field: keyof WordForm, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleDefinitionChange = (defIndex: number, field: keyof Definition, value: string) => {
        setForm((prev) => {
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
        const newDef: Definition = {
            grammar: "",
            etymology: "",
            senses: { nepali: [""], english: [""] },
            examples: { nepali: [""], english: [""] },
        };
        setForm((prev) => ({ ...prev, definitions: [...prev.definitions, newDef] }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await fetch("/api/words", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        router.push("/dashboard");
    };

    return (
        <main className="max-w-4xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Word</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nepali Word</label>
                            <Input value={form.word} onChange={(e) => handleFieldChange("word", e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Romanized</label>
                            <Input value={form.romanized} onChange={(e) => handleFieldChange("romanized", e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Phonetic</label>
                            <Input value={form.phonetic} onChange={(e) => handleFieldChange("phonetic", e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">English Meaning</label>
                            <Input value={form.english} onChange={(e) => handleFieldChange("english", e.target.value)} />
                        </div>

                        {form.definitions.map((def, defIndex) => (
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
                            Save Word
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
