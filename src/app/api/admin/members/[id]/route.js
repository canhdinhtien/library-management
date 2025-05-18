import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/dbConnect.js";
export async function PUT(req, { params }) {
  try {
    // Lấy ID từ params
    const { id } = await params;
    // Lấy dữ liệu cập nhật từ request body
    const updateData = await req.json();
    // Kết nối tới cơ sở dữ liệu
    const { db } = await connectToDatabase();
    const membersCollection = db.collection("members");
    const accountsCollection = db.collection("accounts");

    // Kiểm tra xem thành viên có tồn tại không
    const memberToUpdate = await membersCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!memberToUpdate) {
      return Response.json(
        { success: false, message: "Member not found" },
        { status: 404 }
      );
    }

    // Kiểm tra xem email có bị trùng không
    const existingEmail = await accountsCollection.findOne({
      email: updateData.email,
      _id: { $ne: new ObjectId(memberToUpdate.accountId) }, // Không kiểm tra chính nó
    });
    if (existingEmail) {
      return Response.json(
        { success: false, message: "Email already exists" },
        { status: 400 }
      );
    }

    // Cập nhật thông tin thành viên
    const updateResult = await membersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          email: updateData.email,
          phone: updateData.phone,
          birthDate: updateData.birthDate,
          address: updateData.address,
        },
      }
    );

    // Kiểm tra xem có cập nhật được không
    if (updateResult.modifiedCount === 0) {
      throw new Error("Failed to update member");
    }

    // Cập nhật thông tin tài khoản
    const accountUpdateResult = await accountsCollection.updateOne(
      { _id: new ObjectId(memberToUpdate.accountId) },
      {
        $set: {
          email: updateData.email,
        },
      }
    );
    // Kiểm tra xem có cập nhật được không
    if (accountUpdateResult.modifiedCount === 0) {
      throw new Error("Failed to update account");
    }

    // Trả về kết quả thành công
    return Response.json(
      { success: true, message: "Member updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    // Lấy ID từ params
    const { id } = params;
    // Kết nối tới cơ sở dữ liệu
    const { db } = await connectToDatabase();

    const membersCollection = db.collection("members");
    const accountsCollection = db.collection("accounts");
    // Tìm thành viên để xóa
    const memberToDelete = await membersCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!memberToDelete) {
      throw new Error("Member not found");
    }
    const accountId = memberToDelete.accountId;
    console.log("Account ID to delete:", accountId);

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

    // Trả về kết quả thành công
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
