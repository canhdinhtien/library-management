import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

if (!MONGODB_DB) {
  throw new Error(
    "Please define the MONGODB_DB environment variable inside .env.local"
  );
}

let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {};

    console.log("DB: Creating new connection promise...");
    cached.promise = MongoClient.connect(MONGODB_URI, opts)
      .then((client) => {
        console.log("DB: Connection established, returning client and db");
        return {
          client: client,
          db: client.db(MONGODB_DB),
        };
      })
      .catch((error) => {
        console.error("DB: Connection promise failed:", error);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw new Error(`Unable to connect to MongoDB: ${e.message}`);
  }

  return cached.conn;
}
