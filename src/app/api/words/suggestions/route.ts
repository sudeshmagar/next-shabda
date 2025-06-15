import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "8");

    if (!query || typeof query !== "string") {
        return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI as string);
        const db = client.db(); // uses default database from connection string
        const words = await db.collection("words")
            .find({ word: { $regex: `^${query}`, $options: "i" } })
            .limit(limit)
            .toArray();

        await client.close();

        return NextResponse.json(words);
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
