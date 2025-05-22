import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbConnect";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in .env.local");
    return NextResponse.json(
      { success: false, message: "Server configuration error." },
      { status: 500 }
    );
  }

  let db;

  try {
    const connection = await connectToDatabase();
    db = connection.db;

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập tên đăng nhập và mật khẩu." },
        { status: 400 }
      );
    }

    const accountsCollection = db.collection("accounts");
    const account = await accountsCollection.findOne({ username });

    if (!account) {
      return NextResponse.json(
        { success: false, message: "Username or password is incorrect." },
        { status: 401 }
      );
    }

    if (!account.password) {
      console.error(
        `Password field missing for user ${username}. Check database or projection.`
      );
      return NextResponse.json(
        { success: false, message: "Server configuration error." },
        { status: 500 }
      );
    }

    const isPasswordMatch = await bcrypt.compare(password, account.password);

    if (!isPasswordMatch) {
      return NextResponse.json(
        { success: false, message: "Username or password is incorrect." },
        { status: 401 }
      );
    }

    if (!account.isVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "Please verify your email address before logging in.",
        },
        { status: 403 }
      );
    }

    const payload = {
      userId: account._id.toString(),
      username: account.username,
      role: account.role,
      email: account.email,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    const response = NextResponse.json(
      {
        success: true,
        message: "Successfully logged in.",
        user: {
          id: account._id.toString(),
          username: account.username,
          email: account.email,
          role: account.role,
        },
        token: token,
      },
      { status: 200 }
    );

    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}
