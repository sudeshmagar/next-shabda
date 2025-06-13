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
import { signIn } from "next-auth/react";

export default function Page() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const email = (e.currentTarget.email as HTMLInputElement).value;
        const password = (e.currentTarget.password as HTMLInputElement).value;

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError("Invalid email or password");
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className={cn("flex flex-col gap-6")}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Login to your account</CardTitle>
                            <CardDescription>
                                Enter your email below to login to your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit}>
                                <div className="flex flex-col gap-6">
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
                                        <div className="flex items-center">
                                            <Label htmlFor="password">Password</Label>
                                            <a
                                                href="#"
                                                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                            >
                                                Forgot your password?
                                            </a>
                                        </div>
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
                                            Login
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            type="button"
                                            onClick={() =>
                                                signIn("google", { callbackUrl: "/dashboard" })
                                            }
                                        >
                                            Login with Google
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-4 text-center text-sm">
                                    Don&#39;t have an account?{" "}
                                    <a
                                        href="/signup"
                                        className="underline underline-offset-4"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            router.push("/signup");
                                        }}
                                    >
                                        Sign up
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