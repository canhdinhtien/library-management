import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbConnect";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  // Kiểm tra xem JWT_SECRET đã được định nghĩa chưa
  if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in .env.local");
    return NextResponse.json(
      { success: false, message: "Server configuration error." },
      { status: 500 }
    );
  }

  try {
    // Kết nối đến cơ sở dữ liệu
    const connection = await connectToDatabase();
    const db = connection.db;
    // Lấy username, password và rememberMe từ request body
    const { username, password, rememberMe } = await request.json();

    // Kiểm tra xem username và password đã được nhập chưa
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập tên đăng nhập và mật khẩu." },
        { status: 400 }
      );
    }

    // Tìm tài khoản theo username
    const account = await db.collection("accounts").findOne({ username });

    // Kiểm tra xem tài khoản có tồn tại không và có password không
    if (!account || !account.password) {
      return NextResponse.json(
        { success: false, message: "Username or password is incorrect." },
        { status: 401 }
      );
    }

    // So sánh password đã nhập với password trong cơ sở dữ liệu
    const isPasswordMatch = await bcrypt.compare(password, account.password);
    if (!isPasswordMatch) {
      return NextResponse.json(
        { success: false, message: "Username or password is incorrect." },
        { status: 401 }
      );
    }

    // Kiểm tra xem tài khoản đã được xác thực chưa
    if (!account.isVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "Please verify your email address before logging in.",
        },
        { status: 403 }
      );
    }

    // Tạo payload cho JWT
    const payload = {
      userId: account._id.toString(),
      username: account.username,
      role: account.role,
      email: account.email,
    };

    // Tạo access token
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    // Create a refresh token with a 7-day expiration time
    // Tạo refresh token với thời gian hết hạn là 7 ngày
    const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    // Xác định thời gian tồn tại tối đa cho cookie refresh token dựa trên tùy chọn "rememberMe"
    const maxAge = rememberMe
      ? 60 * 60 * 24 * 30 // 30 ngày nếu "rememberMe" là true
      : 60 * 60 * 24 * 7; // 7 ngày nếu "rememberMe" là false

    // Tạo response
    const response = NextResponse.json(
      {
        success: true,
        message: "Đăng nhập thành công.",
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

    // Thiết lập cookie refresh token trong response
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true, // Cookie không thể truy cập bởi JavaScript phía client
      secure: process.env.NODE_ENV === "production", // Cookie chỉ được gửi qua HTTPS trong môi trường production
      sameSite: "strict", // Cookie chỉ được gửi cho các request đến từ cùng một site
      path: "/", // Cookie hợp lệ cho tất cả các path
      maxAge: maxAge, // Thời gian tồn tại tối đa của cookie tính bằng giây
    });

    // Trả về response
    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
