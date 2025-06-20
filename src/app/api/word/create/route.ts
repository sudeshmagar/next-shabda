import dbConnect from "@/lib/mongoose";
import { NextResponse } from "next/server";
import { DictionaryEntry } from "@/lib/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import User from "@/models/User";

export async function POST(req: Request) {
    // Check authentication and role
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user has permission to create words
    const user = await User.findOne({ email: session.user.email });
    if (!user || !['admin', 'editor', 'superadmin'].includes(user.role)) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    await dbConnect();
    const Word = (await import("@/models/Word")).default;
    const body: Partial<DictionaryEntry> = await req.json();

    try {
        // Add creation metadata
        const wordData = {
            ...body,
            createdBy: user._id,
            updatedBy: user._id,
            status: user.role === 'admin' || user.role === 'superadmin' ? 'approved' : 'pending'
        };

        const newWord = await Word.create(wordData);

        // Update user's contribution count
        if (!user.contributions) {
            user.contributions = { wordsCreated: 0, wordsEdited: 0, wordsDeleted: 0 };
        }
        user.contributions.wordsCreated += 1;
        user.contributions.lastContribution = new Date();
        await user.save();

        return NextResponse.json(newWord, { status: 201 });
    } catch (error) {
        console.error("Error creating word", error);
        return NextResponse.json({ error: "Failed to create word." }, { status: 400 });
    }
} 