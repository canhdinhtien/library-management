import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbConnect";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET;

function calculateFine(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  if (now <= due) return 0;
  const daysOverdue = Math.floor((now - due) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysOverdue * 1000);
}

async function getUserProfileDataNative(db, userId) {
  try {
    const userIdObject = new ObjectId(userId);
    const now = new Date();

    const accountsCollection = db.collection("accounts");
    const account = await accountsCollection.findOne(
      { _id: userIdObject },
      {
        projection: {
          password: 0,
          verificationToken: 0,
          verificationTokenExpires: 0,
        },
      }
    );

    if (!account) {
      console.log(`Native Driver: User account not found for ID: ${userId}`);
      return null;
    }

    if (account.role !== "member") {
      console.log(`Native Driver: User role is not 'member': ${account.role}`);
      return {
        profile: { email: account.email, username: account.username },
        stats: {},
        borrowedBooks: [],
        overdueBooks: [],
      };
    }

    const membersCollection = db.collection("members");
    const member = await membersCollection.findOne({ accountId: userIdObject });

    if (!member) {
      console.log(
        `Native Driver: Member details not found for account ID: ${userId}`
      );
      return {
        profile: { email: account.email, username: account.username },
        stats: {},
        borrowedBooks: [],
        overdueBooks: [],
      };
    }

    const borrowsCollection = db.collection("borrows");
    const aggregationPipeline = [
      {
        $match: {
          member: member._id,
          returnDate: null,
        },
      },
      {
        $unwind: "$books",
      },
      {
        $lookup: {
          from: "books",
          localField: "books.book",
          foreignField: "_id",
          as: "bookDetails",
        },
      },

      {
        $unwind: { path: "$bookDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "authors",
          localField: "bookDetails.author",
          foreignField: "_id",
          as: "authorDetails",
        },
      },
      {
        $unwind: { path: "$authorDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 0,
          borrowRecordId: "$_id",
          bookId: "$books.book",
          title: "$bookDetails.title",
          authorName: "$authorDetails.name",
          coverImage: "$bookDetails.coverImage",
          borrowDate: "$borrowDate",
          dueDate: "$expectedReturnDate",
          renewalsLeft: "$renewalsLeft",
          finePaid: "$finePaid",
        },
      },
    ];

    const borrowDetails = await borrowsCollection
      .aggregate(aggregationPipeline)
      .toArray();
    console.log(
      `Native Driver: Found ${borrowDetails.length} active borrow details.`
    );

    const borrowedBooks = [];
    const overdueBooks = [];
    let currentFineTotal = 0;

    borrowDetails.forEach((record) => {
      if (!record.title) {
        console.log(
          `Native Driver: Skipping record with missing book title (bookId: ${record.bookId})`
        );
        return;
      }

      const isOverdue = record.dueDate < now;
      const fine = isOverdue ? calculateFine(record.dueDate) : 0;

      const bookData = {
        _id: record.bookId.toString(),
        borrowRecordId: record.borrowRecordId.toString(),
        title: record.title || "Unknown Title",
        authorName: record.authorName || "Unknown Author",
        coverImage: record.coverImage || null,
        borrowDate: record.borrowDate,
        dueDate: record.dueDate,
        renewalsLeft: record.renewalsLeft || 0,
      };

      if (isOverdue) {
        const overdueData = {
          ...bookData,
          daysOverdue: Math.max(
            0,
            Math.floor((now - new Date(record.dueDate)) / (1000 * 60 * 60 * 24))
          ),
          fineAmount: record.fine || fine,
          finePaid: record.finePaid || false,
        };
        overdueBooks.push(overdueData);
        if (!overdueData.finePaid) {
          currentFineTotal += overdueData.fineAmount;
        }
      } else {
        borrowedBooks.push(bookData);
      }
    });

    const stats = {
      totalBorrowed: member.totalBorrowedCount || borrowDetails.length,
      currentlyBorrowed: borrowedBooks.length,
      overdue: overdueBooks.length,
      totalFines: currentFineTotal,
      favoriteGenres: member.favoriteGenres || [],
    };

    const profile = {
      name:
        `${member.lastName || ""} ${member.firstName || ""}`.trim() ||
        account.username,
      email: account.email,
      memberSince: member.registeredAt || account.createdAt,
      membershipType: member.membershipType || "Standard",
      avatar: member.avatar || null,
      maxBooksAllowed: member.maxBooksAllowed || 5,
      address: member.address,
      phone: member.phone,
      birthDate: member.birthDate,
    };

    console.log("Native Driver: User profile data processed successfully.");
    return { profile, stats, borrowedBooks, overdueBooks };
  } catch (error) {
    console.error("Native Driver: Error fetching user profile data:", error);
    throw error;
  }
}

export async function GET(request) {
  if (!JWT_SECRET) {
    console.error("API Error: JWT_SECRET is not defined.");
    return NextResponse.json(
      { success: false, message: "Server configuration error." },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("API Error: Authorization header missing or invalid.");
    return NextResponse.json(
      { success: false, message: "Authorization header missing or invalid." },
      { status: 401 }
    );
  }
  const token = authHeader.split(" ")[1];
  console.log("API Info: Received token.");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    console.log(`API Info: Token verified for userId: ${userId}`);

    if (!userId) {
      console.log("API Error: Invalid token payload (missing userId).");
      return NextResponse.json(
        { success: false, message: "Invalid token payload." },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    console.log("API Info: Database connected (Native Driver).");

    const userData = await getUserProfileDataNative(db, userId);

    if (!userData) {
      console.log(`API Error: User data not found for userId: ${userId}`);
      return NextResponse.json(
        { success: false, message: "User profile not found." },
        { status: 404 }
      );
    }

    console.log("API Info: Returning successful profile data.");
    return NextResponse.json(
      { success: true, data: userData },
      { status: 200 }
    );
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      console.log("API Error: Invalid or expired token.");
      return NextResponse.json(
        { success: false, message: "Invalid or expired token." },
        { status: 401 }
      );
    }
    if (error.message.includes("Argument passed in must be a single String")) {
      console.log("API Error: Invalid ObjectId format for user ID.");
      return NextResponse.json(
        { success: false, message: "Invalid user identifier format." },
        { status: 400 }
      );
    }
    console.error("Profile API GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  }
}
