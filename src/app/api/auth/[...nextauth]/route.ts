import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import dbConnect, { getMongoDbClient} from "@/lib/mongoose";
import User from "@/models/User"
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
    adapter: MongoDBAdapter(await getMongoDbClient()),
    providers: [
        CredentialsProvider({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                await dbConnect();
                const user = await User.findOne({ email: credentials.email });

                if (user && await bcrypt.compare(credentials.password, user.password)) {
                    return { id: user._id.toString(), name: user.name, email: user.email };
                }
                return null;
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async jwt({ token }) {
            if (token?.email){
                await dbConnect();
                const dbUser = await User.findOne({ email: token.email });
                if (dbUser) {
                    token.id = dbUser._id.toString();
                    token.picture = dbUser.image;
                    token.role = dbUser.role ?? "user"; // Default to "user" if role is not set
                }
            }

            return token;
        },

        async session({ session, token }) {
          if (session.user && token.id) {
              session.user.id = token.id as string;
              session.user.image = token.picture as string;
              session.user.role = token.role as string;
          }
          return session;
      }
    },
    pages: {
        signIn: "/signin",
    },
    session: {
        strategy: "jwt",
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };