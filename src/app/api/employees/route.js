import { connectToDatabase } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    // Kết nối đến cơ sở dữ liệu
    const body = await req.json();
    const { db } = await connectToDatabase();
    const {
      staffCode,
      username,
      password,
      firstName,
      lastName,
      email,
      phone,
      birthDate,
    } = body;
    const accountsCollection = db.collection("accounts");
    const employeesCollection = db.collection("employees");

    // Kiểm tra trùng lặp tài khoản
    const existingAccount = await accountsCollection.findOne({
      $or: [{ username }, { email }],
    });
    if (existingAccount) {
      throw new Error("Username or email already exists");
    }

    // Tạo tài khoản mới
    const newAccount = {
      username,
      password: await bcrypt.hash(password, 10),
      email,
      isVerified: true,
      role: "employee",
      createdAt: new Date(),
    };
    const accountResult = await accountsCollection.insertOne(newAccount);

    if (!accountResult.acknowledged) {
      throw new Error("Failed to create account");
    }
    const accountId = new ObjectId(accountResult.insertedId);
    // Tạo nhân viên mới
    const newEmployee = {
      employeeCode: staffCode,
      firstName,
      lastName,
      email,
      phone,
      birthDate: new Date(birthDate),
      accountId,
      createdAt: new Date(),
    };

    const employeeResult = await employeesCollection.insertOne(newEmployee);
    if (!employeeResult.acknowledged) {
      throw new Error("Failed to create employee");
    }

    return new Response(JSON.stringify(newEmployee), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Lấy danh sách members
    const employees = await db.collection("employees").find().toArray();
    const accounts = await db.collection("accounts").find().toArray();

    const employeesData = employees.map((employee) => {
      // Tìm tài khoản tương ứng với nhân viên
      const account = accounts.find(
        (acc) => acc._id.toString() === employee.accountId.toString()
      );
      if (!account) {
        console.error("Account not found for employee:", employee._id);
        return null; // Hoặc xử lý theo cách khác nếu không tìm thấy tài khoản
      }
      return {
        id: employee._id,
        firstName: employee.firstName,
        middleName: employee.middleName,
        lastName: employee.lastName,
        email: account.email,
        phone: employee.phone,
        role: account.role,
        joinDate: employee.createdAt,
        status: employee.status || "Active",
        isVerified: employee.isVerified || true,
        birthDate: new Date(employee.birthDate),
        address: employee.address || "",
      };
    });

    // Trả về dữ liệu
    return new Response(JSON.stringify(employeesData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch members" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
