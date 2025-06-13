import dbConnect from "@/lib/mongoose";
import Word from "@/models/Word"
import { NextResponse} from "next/server";

// search
export async function POST(req: Request){
    await dbConnect();

    const { search = "", limit = 10, page = 1, ids} = await req.json();

    try {
        let query: any = {};

        if (ids && Array.isArray(ids) && ids.length > 0){
            query = { _id: { $in: ids } };
        } else if (search.trim()) {
            const regex = new RegExp("^" + search, "i");
            query.$or = [
                { word: { $regex: regex} },
                { romanized: { $regex: regex } },
                { english: { $regex: regex } },
            ]
        }

        const pageNum = Math.max(parseInt(page), 1);
        const limitNum = Math.min(Math.max(parseInt(limit), 1), 100); //max 100

        const skip = (pageNum - 1) * limitNum;

        const words = await Word.find(query).skip(skip).limit(limitNum).exec();

        const total = await Word.countDocuments(query);

        return NextResponse.json({
            results: words,
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum),
        });

    } catch (error){
        console.error("Error fetching words", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

//create
export async function PUT(req: Request) {
    await dbConnect();
    const body = await req.json();

    try {
        const newWord = await Word.create(body);
        return NextResponse.json(newWord, { status: 201 });
    } catch (error) {
        console.error("Error creating word", error);
        return NextResponse.json({ error: "Failed to create word."}, {status: 400});
    }
}
