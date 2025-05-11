import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

// Hàm lấy JWT secret key
function getJwtSecretKey() {
  if (!JWT_SECRET) throw new Error("JWT_SECRET not defined");
  return new TextEncoder().encode(JWT_SECRET);
}

export async function POST() {
  // Lấy refresh token từ cookie
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  // Kiểm tra xem có refresh token không
  if (!refreshToken) {
    return NextResponse.json(
      { success: false, message: "Missing refresh token." },
      { status: 401 }
    );
  }

  try {
    // Xác thực refresh token
    const { payload } = await jwtVerify(refreshToken, getJwtSecretKey());

    // Tạo access token mới
    const accessToken = await new SignJWT({
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("15m")
      .sign(getJwtSecretKey());

    // Trả về access token mới
    return NextResponse.json({ success: true, accessToken });
  } catch (err) {
    console.error("Refresh token invalid:", err.message);
    return NextResponse.json(
      { success: false, message: "Invalid refresh token." },
      { status: 401 }
    );
  }
}
