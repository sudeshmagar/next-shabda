"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";

export default function Page() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const email = (e.currentTarget.email as HTMLInputElement).value;
        const password = (e.currentTarget.password as HTMLInputElement).value;
        const name = (e.currentTarget.name as HTMLInputElement).value;

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
        });

        if (res.ok) {
            router.push("/signin");
        } else {
            const data = await res.json();
            setError(data.error || "Registration failed");
        }
    };

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className={cn("flex flex-col gap-6")}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Create an account</CardTitle>
                            <CardDescription>
                                Enter your details below to register
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit}>
                                <div className="flex flex-col gap-6">
                                    <div className="grid gap-3">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            placeholder="Your name"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="m@example.com"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                        />
                                    </div>
                                    {error && (
                                        <div className="text-sm text-red-500 text-center">
                                            {error}
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-3">
                                        <Button type="submit" className="w-full">
                                            Register
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-4 text-center text-sm">
                                    Already have an account?{" "}
                                    <a
                                        href="/signin"
                                        className="underline underline-offset-4"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            router.push("/signin");
                                        }}
                                    >
                                        Login
                                    </a>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}