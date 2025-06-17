import dbConnect from "@/lib/mongoose";
import { NextResponse } from "next/server";
import { DictionaryEntry } from "@/lib/types";
import { FilterQuery } from "mongoose";

// Types for request parameters
interface WordsRequestParams {
    search?: string;
    limit?: number;
    page?: number;
    ids?: string[];
}

// Type for MongoDB query
type WordsQuery = FilterQuery<DictionaryEntry>;

// search
export async function POST(req: Request) {
    await dbConnect();
    const Word = (await import("@/models/Word")).default;

    const { search = "", limit = 10, page = 1, ids }: WordsRequestParams = await req.json();
    console.log("Incoming request to /api/words with search:", search, "limit:", limit, "page:", page, "ids:", ids);

    try {
        let query: WordsQuery = {};

        if (ids && Array.isArray(ids) && ids.length > 0) {
            query = { _id: { $in: ids } };
        } else if (search.trim()) {
            const regex = new RegExp(`^${search}`, "i");
            query = {
                $or: [
                    { word: { $regex: regex } },
                    { romanized: { $regex: regex } },
                    { english: { $regex: regex } },
                ]
            };
        }

        const pageNum = Math.max(parseInt(String(page)), 1);
        const limitNum = Math.min(Math.max(parseInt(String(limit)), 1), 100); //max 100
        console.log(limitNum);

        const skip = (pageNum - 1) * limitNum;

        const words = await Word.find(query)
            .sort({ word: 1 })
            .skip(skip)
            .limit(limitNum)
            .exec();

        const total = await Word.countDocuments(query);

        console.log(`Fetching words with query: ${JSON.stringify(query)}, limit: ${limitNum}, page: ${pageNum}`);
        console.log(`Total words found: ${total}, returning page ${pageNum} with limit ${limitNum}`);

        return NextResponse.json({
            results: words,
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum),
        });

    } catch (error) {
        console.error("Error fetching words", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

