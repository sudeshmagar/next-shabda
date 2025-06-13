import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import dbConnect, { getMongoDbClient} from "@/lib/mongoose";
import User from "@/models/User"
import bcrypt from "bcryptjs";
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
    adapter: MongoDBAdapter(getMongoDbClient()),
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

                if (user && bcrypt.compareSync(credentials.password, user.password)) {
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
      session({session, user}){
          if (session.user){
              session.user.id = user.id;
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