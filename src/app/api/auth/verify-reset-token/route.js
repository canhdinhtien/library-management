import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbConnect";

export async function GET(req) {
  // Lấy token từ search params
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  // Kiểm tra xem có token không
  if (!token) {
    return NextResponse.json(
      { isValid: false, message: "Token is missing." },
      { status: 400 }
    );
  }

  try {
    // Kết nối tới cơ sở dữ liệu
    const { db } = await connectToDatabase();
    const accountsCollection = db.collection("accounts");

    // Tìm người dùng theo token
    const user = await accountsCollection.findOne(
      {
        passwordResetToken: token,
        passwordResetTokenExpires: { $gt: new Date() },
      },
      { projection: { _id: 1 } }
    );

    // Kiểm tra xem có tìm thấy người dùng không
    if (user) {
      return NextResponse.json({ isValid: true });
    } else {
      return NextResponse.json({
        isValid: false,
        message: "This password reset link is invalid or has expired.",
      });
    }
  } catch (error) {
    console.error("[Verify Token API] Server Error:", error);
    return NextResponse.json(
      {
        isValid: false,
        message: "An internal server error occurred while verifying the token.",
      },
      { status: 500 }
    );
  }
}
