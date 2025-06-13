import dbConnect from "@/lib/mongoose";
import Word from "@/models/Word";
import {NextResponse} from "next/server";

//getById
export async function GET(_: Request, { params }: { params: { id: string}}) {
    await dbConnect();
    const word = await Word.findById(params.id);
    if (!word) return NextResponse.json({ error: "Not found"}, { status: 404 });
    return NextResponse.json(word);
}

//updateById
export async function PUT( req: Request, {params} : { params: { id: string } }) {
    await dbConnect();
    const body = await req.json();

    try {
        const updated = await Word.findByIdAndUpdate(params.id, body, {new: true});
        if (!updated) return NextResponse.json({ error: "Not found"}, { status: 404 });
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({error: "Update failed"}, {status: 400});
    }
}

//deleteById
export async function DELETE(_: Request, { params }: { params: { id: string } } ) {
    await dbConnect();
    const deleted = await Word.findByIdAndDelete(params.id);
    if (!deleted) return NextResponse.json({error: "Not found"}, { status: 404 });
    return NextResponse.json({success: true});
}