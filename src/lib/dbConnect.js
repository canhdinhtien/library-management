// import { MongoClient } from 'mongodb';

// const uri = process.env.MONGODB_URI;
// const dbName = process.env.MONGODB_DB;

// let cachedClient = null;
// let cachedDb = null;

// if (!uri) {
//   console.error('Missing environment variable: MONGODB_URI');
// }

// if (!dbName) {
//   console.error('Missing environment variable: MONGODB_DB');
// }

// export async function connectToDatabase() {
//   // Sử dụng kết nối đã lưu trong bộ nhớ cache nếu có
//   if (cachedClient && cachedDb) {
//     return { client: cachedClient, db: cachedDb };
//   }

//   if (!uri || !dbName) {
//     throw new Error('MongoDB connection information is missing. Check your environment variables.');
//   }

//   try {
//     // Thử tạo kết nối mới
//     const client = new MongoClient(uri);
//     await client.connect();

//     const db = client.db(dbName);

//     // Kiểm tra kết nối bằng cách thực hiện một truy vấn đơn giản
//     await db.command({ ping: 1 });
//     console.log('Connected successfully to MongoDB server');

//     // Lưu kết nối vào bộ nhớ cache
//     cachedClient = client;
//     cachedDb = db;

//     return { client, db };
//   } catch (error) {
//     console.error('MongoDB connection error:', error);
//     throw new Error(`Unable to connect to MongoDB: ${error.message}`);
//   }
// }

// lib/dbConnect.js (Hoặc tên file bạn muốn)
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

// Kiểm tra biến môi trường ngay khi module được load
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

/**
 * Sử dụng biến toàn cục (global) để duy trì cache kết nối
 * qua các lần gọi hàm trong môi trường serverless và hot-reloads ở development.
 */
let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

export async function connectToDatabase() {
  // Nếu có kết nối đã cache, trả về nó ngay
  if (cached.conn) {
    // console.log('DB: Using cached connection'); // Bỏ comment nếu muốn debug
    return cached.conn;
  }

  // Nếu chưa có promise kết nối, tạo mới
  if (!cached.promise) {
    const opts = {
      // useNewUrlParser: true, // Không cần thiết từ driver v4+
      // useUnifiedTopology: true, // Không cần thiết từ driver v4+
    };

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
        cached.promise = null; // Reset promise nếu có lỗi để thử lại lần sau
        throw error; // Ném lỗi ra ngoài
      });
  }

  // Chờ promise kết nối hoàn thành và lưu kết quả vào cache
  try {
    // console.log('DB: Awaiting connection promise...'); // Bỏ comment nếu muốn debug
    cached.conn = await cached.promise;
  } catch (e) {
    // Nếu promise bị lỗi, cached.promise đã được reset ở trên,
    // nên lần gọi tiếp theo sẽ thử tạo lại promise.
    cached.promise = null; // Đảm bảo promise được reset
    throw new Error(`Unable to connect to MongoDB: ${e.message}`);
  }

  // Trả về kết nối đã cache
  return cached.conn;
}

// Optional: Hàm helper để đóng kết nối khi ứng dụng tắt (ít dùng trong serverless)
// export async function closeDatabaseConnection() {
//   if (cached.conn) {
//     await cached.conn.client.close();
//     console.log('MongoDB connection closed');
//     cached.conn = null;
//     cached.promise = null;
//     global.mongo = { conn: null, promise: null }; // Reset cache global
//   }
// }

// *** QUAN TRỌNG: Cách sử dụng trong API route ***
// import { connectToDatabase } from '@/lib/dbConnect'; // Hoặc đường dẫn đúng
//
// export async function POST(request) {
//   try {
//     // Lấy đối tượng db từ kết nối cache
//     const { db } = await connectToDatabase(); // Chỉ cần db thường là đủ
//     // Hoặc const { client, db } = await connectToDatabase(); nếu cần client
//
//     // Sử dụng db để tương tác với collections
//     const usersCollection = db.collection('users');
//     // await usersCollection.insertOne({ name: 'Test User' });
//
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('API Error:', error);
//     return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
//   }
// }
