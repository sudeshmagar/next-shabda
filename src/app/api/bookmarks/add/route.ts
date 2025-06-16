import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongoose";
import Bookmark from "@/models/Bookmark";
import { authOptions } from "@/lib/auth-options";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { wordId } = await request.json();
    if (!wordId) {
        return NextResponse.json({ error: "Word ID is required" }, { status: 400 });
    }

    try {
        await dbConnect();
        const existingBookmark = await Bookmark.findOne({ userId: session.user.id, wordId });
        if (existingBookmark) {
            return NextResponse.json({ message: "Bookmark already exists" }, { status: 400 });
        }
        await Bookmark.create({ userId: session.user.id, wordId });
        return NextResponse.json({ message: "Bookmark added" });
    } catch (error) {
        console.error("Error adding bookmark:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}