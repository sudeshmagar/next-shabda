"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Definition, FormDefinition, WordForm, Language, DefinitionField } from "@/lib/types";
import { WordSuggestionInput } from "@/components/word-suggestion-input";


export default function EditWordPage() {
    const { id } = useParams();
    const router = useRouter();
    const [form, setForm] = useState<WordForm | null>(null);
    const [suggestionInputs, setSuggestionInputs] = useState<{
        [key: string]: string;
    }>({});

    useEffect(() => {
        if (!id) return;
        fetch(`/api/word/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setForm({
                    word: data.word || "",
                    romanized: data.romanized || "",
                    phonetic: data.phonetic || "",
                    english: data.english || "",
                    definitions: (data.definitions || []).map((def: Definition) => ({
                        grammar: def.grammar || "",
                        etymology: def.etymology || "",
                        senses: {
                            nepali: (def.senses?.nepali || [""]).map((s) => s || ""),
                            english: (def.senses?.english || [""]).map((s) => s || ""),
                        },
                        examples: {
                            nepali: (def.examples?.nepali || [""]).map((e) => e || ""),
                            english: (def.examples?.english || [""]).map((e) => e || ""),
                        },
                        synonyms: (def.synonyms || [""]).map((s) => s || ""),
                        antonyms: (def.antonyms || [""]).map((a) => a || ""),
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
        field: DefinitionField,
        lang: Language,
        value: string,
        index: number
    ) => {
        if (!form) return;
        const updated = [...form.definitions];
        if (!updated[defIndex][field]) {
            updated[defIndex][field] = { nepali: [""], english: [""] };
        }
        updated[defIndex][field][lang][index] = value;
        setForm({
            ...form,
            definitions: updated,
        });
    };

    const addItem = (
        defIndex: number,
        field: DefinitionField,
        lang: Language
    ) => {
        if (!form) return;
        const updated = [...form.definitions];
        if (!updated[defIndex][field]) {
            updated[defIndex][field] = { nepali: [""], english: [""] };
        }
        updated[defIndex][field][lang].push("");
        setForm({
            ...form,
            definitions: updated,
        });
    };

    const removeItem = (
        defIndex: number,
        field: DefinitionField,
        lang: Language,
        index: number
    ) => {
        if (!form) return;
        const updated = [...form.definitions];
        if (updated[defIndex][field]) {
            updated[defIndex][field][lang].splice(index, 1);
        }
        setForm({
            ...form,
            definitions: updated,
        });
    };

    const addNewDefinition = () => {
        const newDef: FormDefinition = {
            grammar: "",
            etymology: "",
            senses: { nepali: [""], english: [""] },
            examples: { nepali: [""], english: [""] },
            synonyms: [""],
            antonyms: [""],
        };
        setForm((prev) => prev ? { ...prev, definitions: [...prev.definitions, newDef] } : prev);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!form) return;
        
        // Clean up empty strings from arrays before submitting
        const cleanedForm = {
            ...form,
            definitions: form.definitions.map(def => ({
                ...def,
                senses: {
                    nepali: def.senses.nepali.filter(s => s.trim() !== ""),
                    english: def.senses.english.filter(s => s.trim() !== ""),
                },
                examples: {
                    nepali: def.examples.nepali.filter(e => e.trim() !== ""),
                    english: def.examples.english.filter(e => e.trim() !== ""),
                },
                synonyms: def.synonyms?.filter(s => s.trim() !== "") || [],
                antonyms: def.antonyms?.filter(a => a.trim() !== "") || [],
            }))
        };
        
        try {
            const response = await fetch(`/api/word/update?id=${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cleanedForm),
            });
            
            if (!response.ok) {
                throw new Error('Failed to update word');
            }
            
            router.push("/dashboard");
        } catch (error) {
            console.error('Error updating word:', error);
            // You might want to show a toast or error message here
        }
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

                                <div>
                                    <h4 className="font-semibold mb-2 capitalize text-green-600">Synonyms</h4>
                                    
                                    {/* Existing synonyms */}
                                    {def.synonyms?.map((synonym: string, i: number) => (
                                        <div key={i} className="flex gap-2 mb-1">
                                            <Input
                                                value={synonym}
                                                onChange={(e) => {
                                                    if (!form) return;
                                                    const updated = [...form.definitions];
                                                    updated[defIndex].synonyms![i] = e.target.value;
                                                    setForm({ ...form, definitions: updated });
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => {
                                                    if (!form) return;
                                                    const updated = [...form.definitions];
                                                    updated[defIndex].synonyms!.splice(i, 1);
                                                    setForm({ ...form, definitions: updated });
                                                }}
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    ))}

                                    {/* Suggestion input for new synonyms */}
                                    <div className="mb-2">
                                        <WordSuggestionInput
                                            value={suggestionInputs[`${defIndex}-synonyms`] || ""}
                                            onChange={(value) => {
                                                const key = `${defIndex}-synonyms`;
                                                setSuggestionInputs(prev => ({ ...prev, [key]: value }));
                                            }}
                                            onAdd={(word) => {
                                                if (!form) return;
                                                const updated = [...form.definitions];
                                                if (!updated[defIndex].synonyms) {
                                                    updated[defIndex].synonyms = [];
                                                }
                                                if (!updated[defIndex].synonyms!.includes(word)) {
                                                    updated[defIndex].synonyms!.push(word);
                                                }
                                                setForm({ ...form, definitions: updated });
                                                
                                                // Clear the suggestion input
                                                const key = `${defIndex}-synonyms`;
                                                setSuggestionInputs(prev => ({ ...prev, [key]: "" }));
                                            }}
                                            placeholder="Type to search for synonyms..."
                                        />
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            if (!form) return;
                                            const updated = [...form.definitions];
                                            if (!updated[defIndex].synonyms) {
                                                updated[defIndex].synonyms = [];
                                            }
                                            updated[defIndex].synonyms!.push("");
                                            setForm({ ...form, definitions: updated });
                                        }}
                                    >
                                        + Add Synonym
                                    </Button>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2 capitalize text-red-600">Antonyms</h4>
                                    
                                    {/* Existing antonyms */}
                                    {def.antonyms?.map((antonym: string, i: number) => (
                                        <div key={i} className="flex gap-2 mb-1">
                                            <Input
                                                value={antonym}
                                                onChange={(e) => {
                                                    if (!form) return;
                                                    const updated = [...form.definitions];
                                                    updated[defIndex].antonyms![i] = e.target.value;
                                                    setForm({ ...form, definitions: updated });
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => {
                                                    if (!form) return;
                                                    const updated = [...form.definitions];
                                                    updated[defIndex].antonyms!.splice(i, 1);
                                                    setForm({ ...form, definitions: updated });
                                                }}
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    ))}

                                    {/* Suggestion input for new antonyms */}
                                    <div className="mb-2">
                                        <WordSuggestionInput
                                            value={suggestionInputs[`${defIndex}-antonyms`] || ""}
                                            onChange={(value) => {
                                                const key = `${defIndex}-antonyms`;
                                                setSuggestionInputs(prev => ({ ...prev, [key]: value }));
                                            }}
                                            onAdd={(word) => {
                                                if (!form) return;
                                                const updated = [...form.definitions];
                                                if (!updated[defIndex].antonyms) {
                                                    updated[defIndex].antonyms = [];
                                                }
                                                if (!updated[defIndex].antonyms!.includes(word)) {
                                                    updated[defIndex].antonyms!.push(word);
                                                }
                                                setForm({ ...form, definitions: updated });
                                                
                                                // Clear the suggestion input
                                                const key = `${defIndex}-antonyms`;
                                                setSuggestionInputs(prev => ({ ...prev, [key]: "" }));
                                            }}
                                            placeholder="Type to search for antonyms..."
                                        />
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            if (!form) return;
                                            const updated = [...form.definitions];
                                            if (!updated[defIndex].antonyms) {
                                                updated[defIndex].antonyms = [];
                                            }
                                            updated[defIndex].antonyms!.push("");
                                            setForm({ ...form, definitions: updated });
                                        }}
                                    >
                                        + Add Antonym
                                    </Button>
                                </div>
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
