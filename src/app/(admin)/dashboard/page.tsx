"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [name, setName] = useState("");
    const [editId, setEditId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [words, setWords] = useState([])
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);


    useEffect(() => {
        if (session) {
            fetchItems();
        }
    }, [session, search, page, limit]);

    const fetchItems = async () => {
        const res = await fetch("/api/words", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({search,limit, page})
        });
        const data  = await res.json();
        setWords(data.results || [])
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const res = await fetch("/api/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        });
        if (res.ok) {
            setName("");
            fetchItems();
        } else {
            setError("Failed to create item");
        }
    };

    const handleUpdate = async (id: string, newName: string) => {
        setError(null);
        const res = await fetch(`/api/items/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName }),
        });
        if (res.ok) {
            setEditId(null);
            fetchItems();
        } else {
            setError("Failed to update item");
        }
    };

    const handleDelete = async (id: string) => {
        setError(null);
        const res = await fetch(`/api/words/${id}`, {
            method: "DELETE",
        });
        if (res.ok) {
            fetchItems();
        } else {
            setError("Failed to delete item");
        }
    };

    if (status === "loading") {
        return <p>Loading...</p>;
    }

    if (!session) {
        router.push("/signin");
        return null;
    }

    return (
        <div className="p-6 md:p-10">
            <h1 className="text-2xl font-bold mb-4">Welcome, {session?.user?.name}</h1>
            <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="mb-6"
            >
                Sign out
            </Button>
            {error && (
                <div className="text-sm text-red-500 text-center mb-4">{error}</div>
            )}
            <div className={cn("mb-6")}>
                <h2 className="text-xl font-semibold mb-2">Create Item</h2>
                <form onSubmit={handleCreate} className="flex flex-col gap-4 max-w-sm">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Item Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Item name"
                            required
                        />
                    </div>
                    <Button type="submit">Create</Button>
                </form>
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-2">Items</h2>
                <ul className="space-y-4">
                    {words.map((item: any) => (
                        <li key={item._id} className="flex items-center gap-4">
                            {editId === item._id ? (
                                <Input
                                    type="text"
                                    defaultValue={item.name}
                                    onBlur={(e) => handleUpdate(item._id, e.target.value)}
                                    autoFocus
                                    className="max-w-xs"
                                />
                            ) : (
                                <>
                                    <span>{item.word}</span>
                                    <Link href={`/src/app/(client)/edit/${item._id}`}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                    >
                                        Edit
                                    </Button>
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(item._id)}
                                    >
                                        Delete
                                    </Button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}