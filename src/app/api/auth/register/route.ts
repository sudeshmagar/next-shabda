import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password || !name) {
            return NextResponse.json({ error: "Missing required field" }, { status: 400 });
        }

        await dbConnect();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, {status: 400});
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = new User({
            email,
            password: hashedPassword,
            name,
            role: "user",
        })
        await user.save();

        return NextResponse.json({ message: "User successfully registered" }, {status: 201});
    } catch (error) {
        console.error("Request failed with error", error);
        return NextResponse.json({ error: error });
    }
}