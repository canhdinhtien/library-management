import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbConnect";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/mailer";

export async function POST(req) {
  let email;
  try {
    // Lấy email từ request body
    const body = await req.json();
    email = body.email;

    // Kiểm tra định dạng email
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
    // Kết nối tới cơ sở dữ liệu
    const { db } = await connectToDatabase();
    const accountsCollection = db.collection("accounts");

    console.log(`[Forgot Password] Searching for user with email: ${email}`);
    // Tìm người dùng theo email
    const user = await accountsCollection.findOne(
      { email: email },
      { projection: { _id: 1, email: 1 } }
    );

    // Nếu tìm thấy người dùng
    if (user) {
      console.log(
        `[Forgot Password] User found: ${user._id}. Generating token...`
      );

      // Tạo token reset mật khẩu
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Thiết lập thời gian hết hạn của token
      const expires = new Date(Date.now() + 3600000);

      // Lưu token vào cơ sở dữ liệu
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
        // Gửi email reset mật khẩu
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

    // Trả về thông báo thành công (dù có tìm thấy người dùng hay không)
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
