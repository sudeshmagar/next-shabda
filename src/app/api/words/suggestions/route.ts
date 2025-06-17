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

export async function POST(req: NextRequest) {
    await dbConnect();
    const Word = (await import("@/models/Word")).default;
    
    try {
        const { words } = await req.json();
        
        if (!Array.isArray(words) || words.length === 0) {
            return NextResponse.json({ error: "Words array is required" }, { status: 400 });
        }

        // Find words that match any of the provided words
        const query = {
            $or: [
                { word: { $in: words } },
                { romanized: { $in: words } },
                { english: { $in: words } }
            ]
        };

        const foundWords = await Word.find(query)
            .select('_id word romanized english')
            .limit(50)
            .exec();

        // Create a map for quick lookup
        const wordMap = new Map();
        foundWords.forEach(word => {
            // Check for exact matches in word, romanized, and english fields
            const wordLower = word.word?.toLowerCase();
            const romanizedLower = word.romanized?.toLowerCase();
            const englishLower = word.english?.toLowerCase();
            
            words.forEach(searchWord => {
                const searchLower = searchWord.toLowerCase();
                if (wordLower === searchLower || romanizedLower === searchLower || englishLower === searchLower) {
                    wordMap.set(searchWord, {
                        id: word._id,
                        word: word.word,
                        romanized: word.romanized,
                        english: word.english
                    });
                }
            });
        });

        return NextResponse.json({
            suggestions: Object.fromEntries(wordMap)
        });

    } catch (error) {
        console.error("Error fetching word suggestions:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
