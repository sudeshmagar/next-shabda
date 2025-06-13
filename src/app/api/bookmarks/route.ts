import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import dbConnect from "@/lib/mongoose";
import Bookmark from "@/models/Bookmark";
import Word from "@/models/Word";

export async function GET(){
    const session = await getServerSession();
    if (!session || !session.user){
        return NextResponse.json({error: "Unauthorized"}, { status: 401});
    }

    try {
        await dbConnect();
        const bookmarks = await Bookmark.find({ userId: session.user.id}).select("wordId");
        const wordIds = bookmarks.map((bookmark) => bookmark.wordId)
        const words = await Word.find({ _id: { $in: wordIds}});
        return NextResponse.json({results: words})

    } catch (error) {
        console.error("Error fetching bookmarks", error);
        return NextResponse.json({error: "Internal Server Error"}, { status: 500});
    }
}