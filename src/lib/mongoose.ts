import * as mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error("MongoDB URI is missing");
}

declare global {
    // eslint-disable-next-line no-var
    var mongoose: {
        conn: mongoose.Mongoose | null;
        promise: Promise<mongoose.Mongoose> | null;
    };
}

global.mongoose ||= { conn: null, promise: null };

// Reset connection cache if URI changed
if (
    global.mongoose.conn &&
    global.mongoose.conn.connection.host !== new URL(MONGODB_URI).hostname
) {
    console.log("MongoDB URI has changed, resetting connection...");
    global.mongoose.conn = null;
    global.mongoose.promise = null;
}

const cached = global.mongoose;

async function dbConnect(attempts = 3, delay = 1000): Promise<mongoose.Mongoose> {
    if (cached.conn) {
        console.log("✅ Using cached MongoDB connection");
        return cached.conn;
    }

    for (let i = 1; i <= attempts; i++) {
        try {
            if (!cached.promise) {
                console.log("🔌 Establishing new MongoDB connection...");
                cached.promise = mongoose.connect(MONGODB_URI, {
                    bufferCommands: false,
                    maxPoolSize: 10,
                    serverSelectionTimeoutMS: 5000,
                    heartbeatFrequencyMS: 10000,
                });
            }

            cached.conn = await cached.promise;
            global.mongoose = cached;
            console.log("✅ MongoDB connection established");
            break; // success
        } catch (err) {
            console.error(`❌ Connection attempt ${i} failed`, err);
            cached.promise = null; // reset promise so next retry creates a new one
            if (i < attempts) {
                await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
                throw err;
            }
        }
    }

    return cached.conn!;
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
        console.log("🔌 MongoDB disconnected");
    }
}

export default dbConnect;
