import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import User from "@/models/User";

export async function PUT(req: NextRequest) {
    // Check authentication and role
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user has permission to edit words
    const user = await User.findOne({ email: session.user.email });
    if (!user || !['admin', 'editor', 'superadmin'].includes(user.role)) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    await dbConnect();
    const Word = (await import("@/models/Word")).default;
    const body = await req.json();
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: "Word ID is required" }, { status: 400 });
    }

    try {
        // Check if word exists and user has permission to edit it
        const existingWord = await Word.findById(id);
        if (!existingWord) {
            return NextResponse.json({ error: "Word not found" }, { status: 404 });
        }

        // Users can only edit their own words unless they're admin/superadmin
        if (user.role === 'editor' && existingWord.createdBy?.toString() !== user._id.toString()) {
            return NextResponse.json({ error: "You can only edit your own words" }, { status: 403 });
        }

        // Add update metadata
        const updateData = {
            ...body,
            updatedBy: user._id,
            // If status is being updated and user is admin/superadmin, allow approval
            ...(body.status && ['admin', 'superadmin'].includes(user.role) && {
                approvedBy: user._id,
                approvedAt: new Date()
            })
        };

        const word = await Word.findByIdAndUpdate(id, updateData, { new: true });
        if (!word) {
            return NextResponse.json({ error: "Word not found" }, { status: 404 });
        }

        // Update user's contribution count (only if it's not their own word or if they're admin)
        if (existingWord.createdBy?.toString() !== user._id.toString() || ['admin', 'superadmin'].includes(user.role)) {
            if (!user.contributions) {
                user.contributions = { wordsCreated: 0, wordsEdited: 0, wordsDeleted: 0 };
            }
            user.contributions.wordsEdited += 1;
            user.contributions.lastContribution = new Date();
            await user.save();
        }

        return NextResponse.json(word);
    } catch (error) {
        console.error("Error updating word:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
} 