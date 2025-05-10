import { connectToDatabase } from "@/lib/dbConnect.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server.js";

export async function GET() {
  try {
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
    const borrows = await borrowsCollection
      .aggregate(aggregatePipeline)
      .toArray();
    if (!borrows || borrows.length === 0) {
      return NextResponse.json(
        { message: "No borrows found" },
        { status: 404 }
      );
    }
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
    const body = await req.json();
    const { db } = await connectToDatabase();
    const borrowsCollection = db.collection("borrows");
    const newBody = {
      ...body,
      member: new ObjectId(body.member),
      bookId: new ObjectId(body.bookId),
      borrowDate: new Date(body.borrowDate),
      expectedReturnDate: new Date(body.expectedReturnDate),
      returnDate: body.returnDate ? new Date(body.returnDate) : null,
    };
    // Thay đổi số lượng sách trong kho
    const booksCollection = db.collection("books");
    const updateResult = await booksCollection.updateOne(
      { _id: new ObjectId(body.bookId) },
      { $inc: { availableQuantity: -1 } }
    );
    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update book quantity" },
        { status: 500 }
      );
    }
    const newBorrow = await borrowsCollection.insertOne(newBody);
    return NextResponse.json(newBorrow);
  } catch (error) {
    console.error("Error adding borrow:", error);
    return NextResponse.json(
      { error: "Failed to add borrow" },
      { status: 500 }
    );
  }
}
