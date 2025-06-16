import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Word from "@/models/Word";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "8");

    if (!query || typeof query !== "string") {
        return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    try {
        await dbConnect();
        
        // Create a regex pattern that matches the query anywhere in the text
        const regex = new RegExp(query, "i");
        
        // Search across multiple fields
        const words = await Word.find({
            $or: [
                { word: { $regex: regex } },
                { english: { $regex: regex } },
                { romanized: { $regex: regex } }
            ]
        })
        .sort({ word: 1 })
        .limit(limit)
        .lean();

        return NextResponse.json(words);
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
