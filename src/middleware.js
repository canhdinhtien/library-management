import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Danh sách các route công khai (public routes)
const publicRoutes = [
  "/api/login",
  "/api/auth/",
  "/api/books",
  "/api/genres",
  "/api/authors",
  "/api/notifications",
  "/api/borrows/auto",
];

// Kiểm tra xem route có phải là route công khai không
function isPublicRoute(path) {
  return publicRoutes.some((route) => path.startsWith(route));
}

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  // Bỏ qua middleware đối với các route công khai
  if (isPublicRoute(path)) {
    console.log("[Middleware] Public route accessed:", path);
    return NextResponse.next();
  }

  // Kiểm tra nếu không phải là route công khai, cần xác thực JWT
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error("[Middleware] FATAL ERROR: JWT_SECRET is not defined.");
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Server configuration error.",
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  // Kiểm tra Authorization header
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!authHeader || !authHeader.startsWith("Bearer ") || !token) {
    console.log(
      "[Middleware] Missing or invalid Authorization header for:",
      path
    );
    return new NextResponse(
      JSON.stringify({ success: false, message: "Authentication required." }),
      { status: 401, headers: { "content-type": "application/json" } }
    );
  }

  try {
    // Xác thực token
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secretKey);

    console.log("[Middleware] Token verified successfully for:", path);

    // Gắn thông tin user vào request headers để chuyển tiếp cho các handler tiếp theo
    const requestHeaders = new Headers(request.headers);
    if (payload.userId) requestHeaders.set("x-user-id", payload.userId);
    if (payload.role) requestHeaders.set("x-user-role", payload.role);
    if (payload.username)
      requestHeaders.set("x-user-username", payload.username);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error(
      "[Middleware] Token verification failed for:",
      path,
      "Error:",
      error.message
    );

    let message = "Invalid token.";
    if (error.code === "ERR_JWT_EXPIRED") {
      message = "Token has expired.";
    } else if (
      error.code === "ERR_JWS_INVALID" ||
      error.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED"
    ) {
      message = "Token signature is invalid.";
    }

    return new NextResponse(JSON.stringify({ success: false, message }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
}

// Cấu hình để chỉ chạy middleware cho các API routes
export const config = {
  matcher: ["/api/:path*"], // Chạy middleware cho tất cả các API
};
