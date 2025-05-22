import { connectToDatabase } from "@/lib/dbConnect.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server.js";

export async function GET() {
  try {
    // Kết nối tới cơ sở dữ liệu
    const { db } = await connectToDatabase();
    const borrowsCollection = db.collection("borrows");
    const books = db.collection("books");
    const members = db.collection("members");

    const aggregatePipeline = [
      {
        $lookup: {
          from: "books",
          localField: "bookId",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "member",
          foreignField: "_id",
          as: "memberDetails",
        },
      },
      {
        $unwind: "$bookDetails",
      },
      {
        $unwind: "$memberDetails",
      },
      {
        $project: {
          _id: 1,
          borrowCode: 1,
          bookTitle: "$bookDetails.title",
          userName: {
            $concat: [
              "$memberDetails.firstName",
              " ",
              "$memberDetails.lastName",
            ],
          },
          borrowDate: 1,
          expectedReturnDate: 1,
          returnDate: 1,
          status: 1,
          is_fine_paid: 1,
          fine: 1,
        },
      },
    ];

    // Lấy danh sách borrows từ cơ sở dữ liệu
    const borrows = await borrowsCollection
      .aggregate(aggregatePipeline)
      .toArray();

    // Kiểm tra xem có borrows nào không
    if (!borrows || borrows.length === 0) {
      return NextResponse.json(
        { message: "No borrows found" },
        { status: 404 }
      );
    }

    // Trả về danh sách borrows
    return NextResponse.json(borrows);
  } catch (error) {
    console.error("Error fetching borrows:", error);
    return NextResponse.json(
      { error: "Failed to fetch borrows" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    // Lấy dữ liệu từ request body
    const body = await req.json();

    // Kết nối tới cơ sở dữ liệu
    const { db } = await connectToDatabase();
    const borrowsCollection = db.collection("borrows");
    const booksCollection = db.collection("books");
    const membersCollection = db.collection("members");

    // 1. Kiểm tra sách tồn tại
    const book = await booksCollection.findOne({
      _id: new ObjectId(body.bookId),
    });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // 2. Kiểm tra số lượng sách còn lại
    if (book.availableQuantity <= 0) {
      return NextResponse.json(
        { error: "Book is not available" },
        { status: 400 }
      );
    }

    // 3. Kiểm tra thành viên tồn tại
    const memberObj = await membersCollection.findOne({
      _id: new ObjectId(body.member),
    });
    if (!memberObj) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // 4. Không cho mượn lại sách nếu đã mượn (Pending/Borrowed)
    const existingBorrow = await borrowsCollection.findOne({
      member: new ObjectId(body.member),
      bookId: new ObjectId(body.bookId),
      status: { $in: ["Pending", "Borrowed"] },
    });
    if (existingBorrow) {
      return NextResponse.json(
        { error: "User has already borrowed this book" },
        { status: 400 }
      );
    }

    // 5. Không cho mượn nếu còn sách quá hạn
    const overdueBorrows = await borrowsCollection
      .find({
        member: new ObjectId(body.member),
        status: "Overdue",
      })
      .toArray();
    if (overdueBorrows.length > 0) {
      return NextResponse.json(
        { error: "User has overdue borrows" },
        { status: 400 }
      );
    }

    // 6. Cập nhật số lượng sách
    const updateResult = await booksCollection.updateOne(
      { _id: new ObjectId(body.bookId) },
      { $inc: { availableQuantity: -1, borrowedCount: 1 } }
    );
    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update book quantity" },
        { status: 500 }
      );
    }

    // 7. Sinh mã mượn tự động
    const lastBorrow = await borrowsCollection
      .find()
      .sort({ borrowCode: -1 })
      .limit(1)
      .toArray();
    let nextBorrowCode = "MUON001";
    if (lastBorrow.length > 0 && lastBorrow[0].borrowCode) {
      const lastCode = lastBorrow[0].borrowCode;
      const lastNumber = parseInt(lastCode.replace("MUON", ""), 10);
      nextBorrowCode = `MUON${String(lastNumber + 1).padStart(3, "0")}`;
    }

    // 8. Tạo bản ghi borrow mới
    const newBody = {
      ...body,
      member: new ObjectId(body.member),
      bookId: new ObjectId(body.bookId),
      borrowCode: nextBorrowCode,
      borrowDate: new Date(body.borrowDate || Date.now()),
      expectedReturnDate: new Date(
        body.expectedReturnDate || Date.now() + 60 * 24 * 60 * 60 * 1000
      ),
      status: "Borrowed",
      is_fine_paid: false,
      renewCount: 0,
    };

    // 9. Thêm borrow mới vào cơ sở dữ liệu
    const newBorrow = await borrowsCollection.insertOne(newBody);
    return NextResponse.json({ success: true, data: newBody });
  } catch (error) {
    console.error("Error adding borrow:", error);
    return NextResponse.json(
      { error: "Failed to add borrow" },
      { status: 500 }
    );
  }
}