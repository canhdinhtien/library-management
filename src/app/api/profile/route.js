import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbConnect";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET;

// Hàm tính tiền phạt
function calculateFine(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  if (now <= due) return 0;
  const daysOverdue = Math.floor((now - due) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysOverdue * 10000);
}

// Hàm lấy thông tin profile người dùng
async function getUserProfileDataNative(db, userId) {
  try {
    // Tạo ObjectId từ userId
    const userIdObject = new ObjectId(userId);
    const now = new Date();

    // Lấy thông tin tài khoản
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

    // Kiểm tra xem có tài khoản không
    if (!account) {
      console.log(`Native Driver: User account not found for ID: ${userId}`);
      return null;
    }

    // Kiểm tra role của tài khoản
    if (account.role !== "member") {
      console.log(`Native Driver: User role is not 'member': ${account.role}`);
      return {
        profile: { email: account.email, username: account.username },
        stats: {},
        borrowedBooks: [],
        overdueBooks: [],
        pendingBooks: [],
        returnedBooks: [],
      };
    }

    // Lấy thông tin thành viên
    const membersCollection = db.collection("members");
    const member = await membersCollection.findOne({ accountId: userIdObject });

    // Kiểm tra xem có thông tin thành viên không
    if (!member) {
      console.log(
        `Native Driver: Member details not found for account ID: ${userId}`
      );
      return {
        profile: { email: account.email, username: account.username },
        stats: {},
        borrowedBooks: [],
        overdueBooks: [],
        pendingBooks: [],
        returnedBooks: [],
      };
    }

    const borrowsCollection = db.collection("borrows");

    const aggregationPipeline = [
      {
        $match: {
          member: member._id,
          status: { $in: ["Pending", "Borrowed", "Overdue", "Returned"] },
        },
      },
      {
        $lookup: {
          from: "books",
          localField: "bookId",
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
          bookId: "$bookDetails._id",
          title: "$bookDetails.title",
          authorName: "$authorDetails.name",
          coverImage: "$bookDetails.coverImage",
          borrowDate: "$borrowDate",
          dueDate: "$expectedReturnDate",
          returnDate: "$returnDate",
          renewalsLeft: { $subtract: [2, "$renewCount"] },
          isFinePaid: "$is_fine_paid",
          status: 1,
          userRating: "$userRating",
        },
      },
    ];

    // Lấy thông tin mượn sách
    const borrowDetails = await borrowsCollection
      .aggregate(aggregationPipeline)
      .toArray();

    const borrowedBooks = [];
    const overdueBooks = [];
    const pendingBooks = [];
    const returnedBooks = [];
    let currentFineTotal = 0;

    // Xử lý thông tin mượn sách
    borrowDetails.forEach((record) => {
      if (!record.title) {
        console.log(
          `Native Driver: Skipping record with missing book title (bookId: ${record.bookId})`
        );
        return;
      }

      const dayOverdue = Math.floor(
        (new Date() - new Date(record.dueDate)) / (1000 * 60 * 60 * 24)
      );
      const fineAmount = dayOverdue > 0 ? calculateFine(record.dueDate) : 0;

      const bookData = {
        _id: record.bookId.toString(),
        borrowRecordId: record.borrowRecordId.toString(),
        title: record.title || "Unknown Title",
        authorName: record.authorName || "Unknown Author",
        coverImage: record.coverImage || null,
        borrowDate: record.borrowDate,
        dueDate: record.dueDate,
        returnDate: record.returnDate,
        renewalsLeft: record.renewalsLeft,
        isFinePaid: record.isFinePaid || false,
        fineAmount,
        borrowStatus: record.status,
        userRating: record.userRating || false,
      };

      if (dayOverdue > 0 && record.returnDate === null) {
        const overdueData = {
          ...bookData,
          daysOverdue: Math.max(
            0,
            Math.floor((now - new Date(record.dueDate)) / (1000 * 60 * 60 * 24))
          ),
        };
        overdueBooks.push(overdueData);
      } else if (bookData.borrowStatus === "Pending") {
        pendingBooks.push(bookData);
      } else if (bookData.borrowStatus === "Borrowed") {
        borrowedBooks.push(bookData);
      } else if (bookData.borrowStatus === "Returned") {
        returnedBooks.push(bookData);
      }
    });

    // Tạo thông tin thống kê
    const stats = {
      totalBorrowed:
        member.totalBorrowedCount || borrowDetails.length - pendingBooks.length,
      currentlyBorrowed: borrowedBooks.length + overdueBooks.length,
      overdue: overdueBooks.length,
      totalFines: currentFineTotal,
      favoriteGenres: member.favoriteGenres || [],
    };

    // Tạo thông tin profile
    const profile = {
      firstName: member.firstName,
      lastName: member.lastName,
      email: account.email,
      memberSince: member.registeredAt || account.createdAt,
      membershipType: member.membershipType || "Standard",
      avatar: member.avatar || null,
      maxBooksAllowed: member.maxBooksAllowed || 5,
      address: member.address,
      phone: member.phone,
      birthDate: member.birthDate,
    };

    // Trả về thông tin người dùng
    return {
      profile,
      stats,
      borrowedBooks,
      overdueBooks,
      pendingBooks,
      returnedBooks,
    };
  } catch (error) {
    console.error("Native Driver: Error fetching user profile data:", error);
    throw error;
  }
}

export async function GET(request) {
  console.log("API Profile: GET request received");
  // Kiểm tra xem JWT_SECRET đã được định nghĩa chưa
  if (!JWT_SECRET) {
    console.error("API Error: JWT_SECRET is not defined.");
    return NextResponse.json(
      { success: false, message: "Server configuration error." },
      { status: 500 }
    );
  }

  // Lấy token từ header Authorization
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { success: false, message: "Authorization header missing or invalid." },
      { status: 401 }
    );
  }
  const token = authHeader.split(" ")[1];
  console.log("API Info: Received token.");

  try {
    // Xác thực token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // Kiểm tra xem có userId không
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Invalid token payload." },
        { status: 401 }
      );
    }

    // Kết nối đến cơ sở dữ liệu
    const { db } = await connectToDatabase();

    // Lấy thông tin người dùng
    const userData = await getUserProfileDataNative(db, userId);

    // Kiểm tra xem có thông tin người dùng không
    if (!userData) {
      console.log(`API Error: User data not found for userId: ${userId}`);
      return NextResponse.json(
        { success: false, message: "User profile not found." },
        { status: 404 }
      );
    }
    // Trả về thông tin người dùng
    return NextResponse.json(
      { success: true, data: userData },
      { status: 200 }
    );
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token." },
        { status: 401 }
      );
    }
    if (error.message.includes("Argument passed in must be a single String")) {
      return NextResponse.json(
        { success: false, message: "Invalid user identifier format." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  // Lấy token từ header Authorization
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("API Error: Authorization header missing or invalid.");
    return NextResponse.json(
      { success: false, message: "Authorization header missing or invalid." },
      { status: 401 }
    );
  }
  const token = authHeader.split(" ")[1];

  try {
    // Xác thực token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // Kiểm tra xem có userId không
    if (!userId) {
      console.log("API Error: Invalid token payload (missing userId).");
      return NextResponse.json(
        { success: false, message: "Invalid token payload." },
        { status: 401 }
      );
    }

    // Kết nối đến cơ sở dữ liệu
    const { db } = await connectToDatabase();

    // Lấy dữ liệu cập nhật từ request body
    const updatedData = await request.json();

    console.log("updatedData: ", updatedData);

    // Kiểm tra xem có dữ liệu cập nhật không
    if (!updatedData) {
      console.log("API Error: No data provided for update.");
      return NextResponse.json(
        { success: false, message: "No data provided for update." },
        { status: 400 }
      );
    }

    const membersCollection = db.collection("members");

    // Cập nhật thông tin thành viên
    const memberUpdateResult = await membersCollection.updateOne(
      { accountId: new ObjectId(userId.toString()) },
      {
        $set: {
          firstName: updatedData.firstName,
          lastName: updatedData.lastName,
          phone: updatedData.phone,
          address: updatedData.address,
          birthDate: updatedData.birthDate,
        },
      },
      { upsert: true }
    );

    // Kiểm tra xem có cập nhật được không
    if (memberUpdateResult.modifiedCount === 0) {
      console.log(`API Error: Member not found or no changes made.`);
      return NextResponse.json(
        { success: false, message: "Member not found or no changes made." },
        { status: 404 }
      );
    }

    console.log("API Info: User profile updated successfully.");
    // Trả về thông báo thành công
    return NextResponse.json(
      { success: true, message: "Profile updated successfully." },
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
    console.error("Profile API PUT Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  }
}
