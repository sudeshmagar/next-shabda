import {NextRequest, NextResponse} from "next/server";
import {MongoClient} from "mongodb";

export default async function handler(req: NextRequest, res: NextResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({error: "Method Not Allowed"});
    }

    const { query, limit = "8"} = req.query

    if (!query || typeof query !== "string") {
        return res.status(400).json({error: "Invalid query"});
    }

    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI as string);
        const db = client
    } catch (error) {
        console.error("Error fetching suggestion: ", error)
        res.status(500).json({error: "Server Error"});
    }
}