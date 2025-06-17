import dbConnect from "@/lib/mongoose";
import { NextResponse } from "next/server";
import { DictionaryEntry } from "@/lib/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(req: Request) {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (session.user.role !== "admin") {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await dbConnect();
    const Word = (await import("@/models/Word")).default;
    const body: Partial<DictionaryEntry> = await req.json();

    try {
        const newWord = await Word.create(body);
        return NextResponse.json(newWord, { status: 201 });
    } catch (error) {
        console.error("Error creating word", error);
        return NextResponse.json({ error: "Failed to create word." }, { status: 400 });
    }
} 