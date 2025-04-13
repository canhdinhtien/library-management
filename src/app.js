import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import employeeRoutes from "./routes/employeeRoutes.js";
import borrowRoutes from "./routes/borrowRoutes.js"; // Import borrowRoutes
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors()); // Sử dụng cors để cho phép truy cập từ các nguồn khác nhau

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

// Routes
app.use("/api/employees", employeeRoutes);
app.use("/api/borrows", borrowRoutes); // Thêm đường dẫn cho borrowRoutes

// Lắng nghe server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
