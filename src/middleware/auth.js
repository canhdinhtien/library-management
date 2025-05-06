import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1]; // Lấy token sau "Bearer"

  if (!token) {
    return res.status(401).json({ error: "Invalid token" });
  }

  try {
    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Sử dụng bí mật JWT của bạn
    req.user = decoded; // Lưu thông tin người dùng vào request
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

export default verifyToken;
