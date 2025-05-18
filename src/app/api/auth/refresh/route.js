import { NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Missing token" },
        { status: 400 }
      );
    }

    try {
      await jwtVerify(token, secret);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const payload = jwtDecode(token);

    const newAccessToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("2h")
      .sign(secret);

    return NextResponse.json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

function jwtDecode(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}
