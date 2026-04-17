import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;



/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
    conn: any;
    promise: any;
}

declare global {
    var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
        console.log("Connected to MongoDB");
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

// Ensure all models are registered to prevent MissingSchemaError across server chunks
import '../models/Admin';
import '../models/CommunityMessage';
import '../models/CommunityTopic';
import '../models/Conversation';
import '../models/Deal';
import '../models/DocumentUpdate';
import '../models/Entrepreneur';
import '../models/Investor';
import '../models/Message';
import '../models/Newsletter';
import '../models/Notification';
import '../models/Pitch';
import '../models/PitchUpdate';
import '../models/Settings';

export default dbConnect;
