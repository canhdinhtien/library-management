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

  try {
    const connection = await connectToDatabase();
    const db = connection.db;
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập tên đăng nhập và mật khẩu." },
        { status: 400 }
      );
    }

    const account = await db.collection("accounts").findOne({ username });

    if (!account || !account.password) {
      return NextResponse.json(
        { success: false, message: "Username or password is incorrect." },
        { status: 401 }
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

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });

    const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

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
        accessToken: accessToken,
      },
      { status: 200 }
    );

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
    });

    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
