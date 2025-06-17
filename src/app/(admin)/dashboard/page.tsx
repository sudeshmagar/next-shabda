"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { toast } from "sonner";
import { Trash, Pencil } from "lucide-react";
import { DictionaryEntry } from "@/lib/types";

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [words, setWords] = useState<DictionaryEntry[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (status === "authenticated" && session?.user.role !== "admin") {
            router.push("/");
        }
    }, [session, status, router]);

    const fetchWords = useCallback(async () => {
        try {
            const res = await fetch("/api/words", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ search, limit: 100, page: 1 }),
            });
            const data = await res.json();
            setWords(data.results || []);
        } catch {
            toast.error("Failed to load words");
        }
    }, [search]);

    useEffect(() => {
        fetchWords();
    }, [fetchWords]);

    const deleteWord = async (id: string) => {
        try {
            const confirmed = confirm("Are you sure you want to delete this word?");
            if (!confirmed) return;

            const res = await fetch(`/api/word/delete?id=${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error();
            toast.success("Word deleted successfully");
            fetchWords();
        } catch {
            toast.error("Failed to delete word");
        }
    };

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <Link href="/dashboard/new">
                    <Button>Add New Word</Button>
                </Link>
            </div>

            <div className="mb-4">
                <Input
                    placeholder="Search words..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Word</TableHead>
                        <TableHead>English</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {words.map((word: DictionaryEntry) => (
                        <TableRow key={word._id}>
                            <TableCell>{word.word}</TableCell>
                            <TableCell>{word.english}</TableCell>
                            <TableCell className="space-x-2">
                                <Link href={`/dashboard/edit/${word._id}`}>
                                    <Button size="icon" variant="outline">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    onClick={() => deleteWord(word._id)}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
