import {NextResponse} from "next/server";

import WordModel from "@/models/Word"

export async function GET(){
    try {
        const count = await WordModel.countDocuments();
        const randomIndex = Math.floor(Math.random() * count);
        const randomWord = await WordModel.findOne().skip(randomIndex);
        return NextResponse.json({ word: randomWord });
    } catch (err){
        console.error("Error getting random words", err);
        return NextResponse.json({error: "Error getting random words"}, {status: 500});
    }
}