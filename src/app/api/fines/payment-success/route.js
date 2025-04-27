import crypto from "crypto";

export async function GET(req) {
  try {
    // Lấy query string từ URL
    const url = new URL(req.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    // Lấy chữ ký từ query string
    const secureHash = queryParams.vnp_SecureHash;
    delete queryParams.vnp_SecureHash; // Loại bỏ chữ ký để xác minh

    // Sắp xếp tham số theo thứ tự bảng chữ cái
    const sortedParams = Object.entries(queryParams)
      .sort(([key1], [key2]) => key1.localeCompare(key2))
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    // Tạo chữ ký bảo mật từ tham số
    const secretKey = process.env.VNP_HASHSECRET;
    const signData = new URLSearchParams(sortedParams).toString();
    const hmac = crypto.createHmac("sha512", secretKey);
    const calculatedHash = hmac
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    // So sánh chữ ký
    if (secureHash !== calculatedHash) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid secure hash" }),
        { status: 400 }
      );
    }

    // Xử lý kết quả thanh toán
    const paymentStatus =
      queryParams.vnp_ResponseCode === "00" ? "success" : "failed";

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment processed",
        paymentStatus,
        data: queryParams,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing payment success:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      { status: 500 }
    );
  }
}
