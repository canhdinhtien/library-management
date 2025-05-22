import { NextResponse } from "next/server";

export async function POST() {
  // Tạo response để trả về
  const response = NextResponse.json({ success: true, message: "Logged out." });
  // Xóa cookie refreshToken
  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(0), // Xóa cookie
  });
  // Trả về response
  return response;
}