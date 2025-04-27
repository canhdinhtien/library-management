import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbConnect";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/mailer";

export async function POST(req) {
  let email;
  try {
    const body = await req.json();
    email = body.email;

    if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
      console.warn("[Forgot Password] Invalid email format received:", email);

      return NextResponse.json(
        { message: "Please provide a valid email address." },
        { status: 400 }
      );
    }
    email = email.toLowerCase();
  } catch (error) {
    console.error("[Forgot Password] Failed to parse request body:", error);
    return NextResponse.json(
      { message: "Invalid request format." },
      { status: 400 }
    );
  }

  try {
    const { db } = await connectToDatabase();
    const accountsCollection = db.collection("accounts");

    console.log(`[Forgot Password] Searching for user with email: ${email}`);
    const user = await accountsCollection.findOne(
      { email: email },
      { projection: { _id: 1, email: 1 } }
    );

    if (user) {
      console.log(
        `[Forgot Password] User found: ${user._id}. Generating token...`
      );

      const resetToken = crypto.randomBytes(32).toString("hex");

      const expires = new Date(Date.now() + 3600000);

      await accountsCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            passwordResetToken: resetToken,
            passwordResetTokenExpires: expires,
            updatedAt: new Date(),
          },
        }
      );
      console.log(`[Forgot Password] Token stored in DB for user: ${user._id}`);

      try {
        console.log(
          `[Forgot Password] Attempting to send reset email to: ${user.email}`
        );
        await sendPasswordResetEmail(user.email, resetToken);
        console.log(
          `[Forgot Password] Reset email sent successfully to: ${user.email}`
        );
      } catch (emailError) {
        console.error(
          "[Forgot Password] Failed to send password reset email:",
          emailError
        );
      }
    } else {
      console.log(
        `[Forgot Password] No user found for email: ${email}. Proceeding silently.`
      );
    }

    return NextResponse.json(
      {
        message:
          "If an account with that email exists, a password reset link has been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Forgot Password] Server Error:", error);

    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
