import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/dbConnect.js"; // Đường dẫn đến tệp kết nối cơ sở dữ liệu của bạn
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const updateData = await req.json();
    const { db } = await connectToDatabase();
    const membersCollection = db.collection("members");

    // Cập nhật thông tin thành viên
    const updateResult = await membersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (updateResult.modifiedCount === 0) {
      throw new Error("Failed to update member");
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const { db } = await connectToDatabase();

    const membersCollection = db.collection("members");
    const accountsCollection = db.collection("accounts");
    const memberToDelete = await membersCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!memberToDelete) {
      throw new Error("Member not found");
    }
    const accountId = memberToDelete.accountId;
    console.log("Account ID to delete:", accountId); // Log ID tài khoản để xóa

    // Xóa người dùng
    const memberResult = await membersCollection.deleteOne({
      _id: new ObjectId(id),
    });
    if (!memberResult.deletedCount) {
      throw new Error("Failed to delete member.");
    }

    // Xóa tài khoản liên quan
    const accountResult = await accountsCollection.deleteOne({
      _id: new ObjectId(accountId),
    });
    if (!accountResult.deletedCount) {
      throw new Error("Failed to delete account.");
    }
    console.log("Account deleted:", accountResult);

    return new Response(
      JSON.stringify({ message: "Member deleted successfully." }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed to delete member:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
