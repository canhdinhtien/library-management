import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbConnect";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { isValid: false, message: "Token is missing." },
      { status: 400 }
    );
  }

  try {
    const { db } = await connectToDatabase();
    const accountsCollection = db.collection("accounts");

    const user = await accountsCollection.findOne(
      {
        passwordResetToken: token,
        passwordResetTokenExpires: { $gt: new Date() },
      },
      { projection: { _id: 1 } }
    );

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
