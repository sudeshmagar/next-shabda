import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import User from "@/models/User";

export async function DELETE(req: NextRequest) {
    // Check authentication and role
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user has permission to delete words
    const user = await User.findOne({ email: session.user.email });
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    await dbConnect();
    const Word = (await import("@/models/Word")).default;
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: "Word ID is required" }, { status: 400 });
    }

    try {
        // Check if word exists
        const word = await Word.findById(id);
        if (!word) {
            return NextResponse.json({ error: "Word not found" }, { status: 404 });
        }

        // Delete the word
        await Word.findByIdAndDelete(id);

        // Update user's contribution count
        if (!user.contributions) {
            user.contributions = { wordsCreated: 0, wordsEdited: 0, wordsDeleted: 0 };
        }
        user.contributions.wordsDeleted += 1;
        user.contributions.lastContribution = new Date();
        await user.save();

        return NextResponse.json({ message: "Word deleted successfully" });
    } catch (error) {
        console.error("Error deleting word:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
} 