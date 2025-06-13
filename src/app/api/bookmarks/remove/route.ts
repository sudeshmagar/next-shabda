import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongoose";
import Bookmark from "@/models/Bookmark";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
        await Bookmark.deleteOne({ userId: session.user.id, wordId });
        return NextResponse.json({ message: "Bookmark removed" });
    } catch (error) {
        console.error("Error removing bookmark:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}