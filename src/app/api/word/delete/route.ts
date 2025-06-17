import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function DELETE(req: NextRequest) {
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
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: "Word ID is required" }, { status: 400 });
    }

    try {
        const word = await Word.findByIdAndDelete(id);
        if (!word) {
            return NextResponse.json({ error: "Word not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Word deleted successfully" });
    } catch (error) {
        console.error("Error deleting word:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
} 