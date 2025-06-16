import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();

        // Find user by email and exclude password
        const user = await User.findOne(
            { email: session.user.email },
            { password: 0 } // Exclude password from the response
        ).lean();

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Update user profile
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { name } = body;

        // Validate input
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Update user
        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            { 
                $set: { 
                    name: name.trim(),
                    updatedAt: new Date()
                } 
            },
            { 
                new: true,
                select: "-password" // Exclude password from the response
            }
        ).lean();

        if (!updatedUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating user profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 