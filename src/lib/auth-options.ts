import { NextAuthOptions, DefaultUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import dbConnect, { getMongoDbClient } from "@/lib/mongoose";
import bcrypt from "bcryptjs";

type UserRole = "user" | "admin";

// Extend the built-in session types
declare module "next-auth" {
    interface User extends DefaultUser {
        role?: UserRole;
    }
    
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role?: UserRole;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: UserRole;
        id: string;
    }
}

export const authOptions: NextAuthOptions = {
    adapter: MongoDBAdapter(getMongoDbClient()),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Please enter an email and password");
                }

                await dbConnect();
                const UserModel = (await import("@/models/User")).default;

                const user = await UserModel.findOne({ email: credentials.email }).select("+password");
                if (!user) {
                    throw new Error("No user found with this email");
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                if (!isPasswordValid) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.image,
                };
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        })
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            
            // For Google sign-in, fetch or create user and set role
            if (account?.provider === "google" && token.email) {
                await dbConnect();
                const UserModel = (await import("@/models/User")).default;
                const dbUser = await UserModel.findOne({ email: token.email });
                
                if (dbUser) {
                    token.id = dbUser._id.toString();
                    token.role = dbUser.role;
                } else {
                    // Create new user if doesn't exist
                    const newUser = await UserModel.create({
                        email: token.email,
                        name: token.name,
                        image: token.picture,
                        role: "user", // Default role for Google sign-in
                        password: "", // Empty password for OAuth users
                    });
                    token.id = newUser._id.toString();
                    token.role = newUser.role;
                }
            }
            
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
}; 