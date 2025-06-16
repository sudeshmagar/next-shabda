import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";

// Helper to extract ID from the URL
const getIdFromParams = (req: NextRequest) => {
    const url = new URL(req.url);
    const segments = url.pathname.split("/");
    return segments[segments.length - 1];
}

//getById
export async function GET( request: NextRequest ) {
    const id = getIdFromParams(request)
    await dbConnect();
    const Word = (await import("@/models/Word")).default;

    try {
        const word = await Word.findById(id);
        if (!word) {
            return NextResponse.json({ error: "Word not found" }, { status: 404 });
        }
        return NextResponse.json(word);
    } catch (error) {
        console.error("Error fetching word:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

//updateById
export async function PUT(request: NextRequest) {
    const id = getIdFromParams(request)
    await dbConnect();
    const Word = (await import("@/models/Word")).default;
    const body = await request.json();

    try {
        const word = await Word.findByIdAndUpdate(id, body, { new: true });
        if (!word) {
            return NextResponse.json({ error: "Word not found" }, { status: 404 });
        }
        return NextResponse.json(word);
    } catch (error) {
        console.error("Error updating word:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

//deleteById
export async function DELETE(request: NextRequest) {
    const id = getIdFromParams(request)
    await dbConnect();
    const Word = (await import("@/models/Word")).default;

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