import crypto from "crypto";

export async function POST(req) {
  try {
    // Lấy IP từ headers hoặc socket
    const ipAddr =
      req.headers["x-forwarded-for"] ||
      (req.socket && req.socket.remoteAddress) ||
      "127.0.0.1";

    // Lấy fineAmount từ body
    const { fineAmount } = await req.json();
    if (!fineAmount || fineAmount <= 0) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid fine amount" }),
        { status: 400 }
      );
    }

    // Tạo các tham số
    const date = new Date();
    const createDate = date
      .toISOString()
      .replace(/[-:TZ.]/g, "")
      .slice(0, 14); // yyyyMMddHHmmss
    const orderId = `${Date.now()}`;
    const amount = fineAmount * 100; // VNPay yêu cầu số tiền là đơn vị đồng

    const tmnCode = process.env.VNP_TMNCODE; // Mã định danh của Merchant
    const secretKey = process.env.VNP_HASHSECRET; // Khóa bí mật của Merchant
    const vnpUrl =
      process.env.VNP_URL ||
      "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"; // Địa chỉ URL của VNPay
    const returnUrl =
      process.env.VNP_RETURNURL ||
      "http://localhost:3000/fines/payment-success"; // Địa chỉ URL trả về sau khi thanh toán

    // Tạo vnp_Params
    const vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan cho ma GD: ${orderId}`,
      vnp_OrderType: "other",
      vnp_Amount: amount.toString(),
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    // Sắp xếp tham số theo thứ tự bảng chữ cái
    const sortedParams = Object.entries(vnp_Params)
      .sort(([key1], [key2]) => key1.localeCompare(key2))
      .reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          acc[key] = value.toString();
        }
        return acc;
      }, {});

    // Tạo chuỗi query string
    const queryString = new URLSearchParams(sortedParams).toString();

    // Tạo chữ ký bảo mật
    const hmac = crypto.createHmac("sha512", secretKey);
    const secureHash = hmac
      .update(Buffer.from(queryString, "utf-8"))
      .digest("hex");

    // Thêm chữ ký vào tham số
    sortedParams["vnp_SecureHash"] = secureHash;

    // Tạo URL thanh toán
    const paymentUrl = `${vnpUrl}?${new URLSearchParams(
      sortedParams
    ).toString()}`;

    console.log("Payment URL:", paymentUrl);

    return new Response(JSON.stringify({ success: true, paymentUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating VNPay payment URL:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      { status: 500 }
    );
  }
}
