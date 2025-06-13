import * as mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

declare global {
    // eslint-disable-next-line no-var
    var mongoose: { conn: mongoose.Mongoose | null; promise: Promise<mongoose.Mongoose> | null };
}


if (!MONGODB_URI) {
    throw new Error("MongoDB URI is missing");
}

const cached = global.mongoose || {conn: null, promise: null};


async function dbConnect(attempts = 3, delay = 1000) {
    if (cached.conn) {
        console.log("Using cached connection...");
        return cached.conn
    }

    if (!cached.promise) {
        console.log("Establishing new Mongoose connection...");
        for (let i = 1; i <= attempts; i++) {
            try {
                cached.promise = mongoose.connect(MONGODB_URI, {
                    bufferCommands: false,
                    maxPoolSize: 10,
                    serverSelectionTimeoutMS: 5000,
                    heartbeatFrequencyMS: 10000,
                });
                cached.conn = await cached.promise;
                console.log("MongoDB connection established");
                break;
            } catch (err){
                console.error(`Connection attempt ${i} failed.`, err);
                if (i === attempts) {
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }
    }

    cached.conn = await cached.promise;
    global.mongoose = cached;
    return cached.conn;
}

export async function getMongoDbClient() {
    const conn = await dbConnect();
    if (!conn) {
        throw new Error("MongoDB connection is not established");
    }
    return conn.connection.getClient();
}

export async function dbDisconnect() {
    if (cached.conn) {
        await mongoose.disconnect();
        cached.conn = null;
        cached.promise = null;
        console.log("MongoDB disconnected");
    }
}

export default dbConnect;