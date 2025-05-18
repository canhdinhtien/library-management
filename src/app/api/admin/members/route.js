import { connectToDatabase } from "@/lib/dbConnect.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server.js";

export async function GET() {
  try {
    // Kết nối đến cơ sở dữ liệu
    const { db } = await connectToDatabase();

    // Lấy danh sách members
    const members = await db.collection("members").find().toArray();

    // Lấy danh sách accounts
    const accounts = await db.collection("accounts").find().toArray();

    // Lấy danh sách borrows
    const borrows = await db.collection("borrows").find().toArray();
    // Lấy danh sách books
    const booksCollection = await db.collection("books").find().toArray();

    // Xử lý dữ liệu
    const membersData = members.map((member) => {
      // Lấy email từ accountId
      const account = accounts.find(
        (acc) => acc._id.toString() === member.accountId.toString()
      );
      const email = account ? account.email : "N/A";

      // Lấy danh sách sách từ borrows
      const memberBorrows = borrows.filter(
        (borrow) =>
          borrow.member.toString() === member._id.toString() &&
          !borrow.returnDate
      );
      const books = memberBorrows.flatMap((borrow) => {
        const bookDetails = booksCollection.find(
          (b) => b._id.toString() === borrow.bookId.toString()
        );
        return bookDetails ? bookDetails.title : "Unknown Title";
      });

      return {
        id: member._id,
        name: `${member.firstName} ${member.lastName}`,
        firstName: member.firstName,
        lastName: member.lastName,
        email,
        books,
        joinDate: member.registeredAt,
        status: member.status || "Active",
        phone: member.phone || "",
        address: member.address || "",
        birthDate: member.birthDate || "",
      };
    });
    // Trả về dữ liệu
    return new Response(JSON.stringify(membersData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error fetching members:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch members" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req) {
  try {
    // Lấy dữ liệu từ request
    const {
      userCode,
      username,
      password,
      firstName,
      lastName,
      email,
      phone,
      birthDate,
    } = await req.json();
    // Kết nối đến cơ sở dữ liệu
    const { db } = await connectToDatabase();
    const accountsCollection = db.collection("accounts");
    const membersCollection = db.collection("members");

    // Kiểm tra trùng lặp mã thành viên
    const existingMember = await membersCollection.findOne({
      memberCode: userCode,
    });
    if (existingMember) {
      return new Response(
        JSON.stringify({ error: "Member code already exists" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Kiểm tra trùng lặp tài khoản
    const existingAccount = await accountsCollection.findOne({
      $or: [{ username }, { email }],
    });
    if (existingAccount) {
      return new Response(
        JSON.stringify({ error: "Username or email already exists" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Tạo tài khoản mới
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAccount = {
      username,
      password: hashedPassword,
      email,
      role: "member",
      isVerified: true,
      createdAt: new Date(),
    };
    const insertAccountResult = await accountsCollection.insertOne(newAccount);
    if (!insertAccountResult.insertedId) {
      throw new Error("Failed to insert account");
    }
    const accountId = new ObjectId(insertAccountResult.insertedId);
    // Tạo thành viên mới
    const newMember = {
      memberCode: userCode,
      firstName,
      lastName,
      phone,
      birthDate: new Date(birthDate),
      accountId,
      registeredAt: new Date(),
    };
    const insertMemberResult = await membersCollection.insertOne(newMember);
    if (!insertMemberResult.insertedId) {
      throw new Error("Failed to insert member");
    }

    // Trả về dữ liệu thành viên mới
    const newMemberId = new ObjectId(insertMemberResult.insertedId);
    const member = await membersCollection.findOne({ _id: newMemberId });
    return Response.json(member, {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating member:", error);
    // Xử lý lỗi nếu có
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create member" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
