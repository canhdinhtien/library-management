import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbConnect";
import bcrypt from "bcryptjs";

export async function POST(req) {
  let token, newPassword;
  try {
    // Lấy token và mật khẩu mới từ request body
    const body = await req.json();
    token = body.token;
    newPassword = body.newPassword;

    // Kiểm tra token và mật khẩu mới
    if (!token || typeof token !== "string" || token.length < 10) {
      return NextResponse.json(
        { message: "Invalid or missing token." },
        { status: 400 }
      );
    }
    if (
      !newPassword ||
      typeof newPassword !== "string" ||
      newPassword.length < 8
    ) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[Reset Password] Failed to parse request body:", error);
    return NextResponse.json(
      { message: "Invalid request format." },
      { status: 400 }
    );
  }

  try {
    // Kết nối tới cơ sở dữ liệu
    const { db } = await connectToDatabase();
    const accountsCollection = db.collection("accounts");

    console.log(
      `[Reset Password] Searching for user with token (first 10 chars): ${token.substring(
        0,
        10
      )}...`
    );
    // Tìm người dùng theo token
    const user = await accountsCollection.findOne({
      passwordResetToken: token,
      passwordResetTokenExpires: { $gt: new Date() },
    });

    // Kiểm tra xem có tìm thấy người dùng không
    if (!user) {
      console.warn(
        `[Reset Password] Invalid or expired token provided: ${token.substring(
          0,
          10
        )}...`
      );
      return NextResponse.json(
        { message: "Invalid or expired password reset token." },
        { status: 400 }
      );
    }
    console.log(
      `[Reset Password] Valid token found for user: ${user._id}. Hashing new password...`
    );

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    console.log(`[Reset Password] New password hashed for user: ${user._id}`);

    // Cập nhật mật khẩu và xóa token
    const result = await accountsCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
        $unset: {
          passwordResetToken: "",
          passwordResetTokenExpires: "",
        },
      }
    );

    // Kiểm tra xem có cập nhật được không
    if (result.modifiedCount === 1) {
      console.log(
        `[Reset Password] Password updated successfully for user: ${user._id}`
      );
      return NextResponse.json(
        { message: "Password has been reset successfully." },
        { status: 200 }
      );
    } else {
      console.error(
        `[Reset Password] Failed to update password in DB for user: ${user._id}. Result:`,
        result
      );
      return NextResponse.json(
        { message: "Failed to update password. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Reset Password] Server Error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
