import dbConnect from "@/lib/mongoose";
import { NextResponse } from "next/server";
import { DictionaryEntry } from "@/lib/types";
import { FilterQuery } from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import User from "@/models/User";

// Types for request parameters
interface WordsRequestParams {
    search?: string;
    limit?: number;
    page?: number;
    ids?: string[];
    status?: string;
}

// Type for MongoDB query
type WordsQuery = FilterQuery<DictionaryEntry>;

// search
export async function POST(req: Request) {
    await dbConnect();
    const Word = (await import("@/models/Word")).default;

    const { search = "", limit = 10, page = 1, ids, status }: WordsRequestParams = await req.json();
    console.log("Incoming request to /api/words with search:", search, "limit:", limit, "page:", page, "ids:", ids, "status:", status);

    try {
        let query: WordsQuery = {};

        // Check user session for role-based filtering
        const session = await getServerSession(authOptions);
        const user = session?.user ? await User.findOne({ email: session.user.email }) : null;

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

        // Add status filter if provided
        if (status && status !== 'all') {
            query.status = status;
        } else if (!user || !['admin', 'editor', 'superadmin'].includes(user.role)) {
            // Regular users only see approved words
            query.status = 'approved';
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

