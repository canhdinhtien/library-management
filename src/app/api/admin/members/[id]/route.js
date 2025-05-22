import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/dbConnect.js";
export async function PUT(req, { params }) {
  try {
    // Lấy ID từ params
    const { id } = await params;
    // Lấy dữ liệu cập nhật từ request body
    const body = await req.json();
    // Kết nối tới cơ sở dữ liệu
    const { db } = await connectToDatabase();
    const membersCollection = db.collection("members");
    const accountsCollection = db.collection("accounts");

    // Lấy id account từ request body
    const memberToEdit = await membersCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!memberToEdit) {
      return new Response(JSON.stringify({ error: "Employee not found" }), {
        status: 404,
      });
    }
    const accountId = memberToEdit.accountId;

    const accountToEdit = await accountsCollection.findOne({
      _id: new ObjectId(accountId),
    });
    if (!accountToEdit) {
      return new Response(JSON.stringify({ error: "Account not found" }), {
        status: 404,
      });
    }

    // Nếu email bị thay đổi
    if (accountToEdit.email !== body.email) {
      // Kiểm tra email có bị trùng với các tài khoản khác không
      const existingAccount = await accountsCollection.findOne({
        email: body.email,
      });
      if (existingAccount) {
        return new Response(JSON.stringify({ error: "Email already exists" }), {
          status: 400,
        });
      } else {
        // Nếu email không bị trùng, cập nhật tài khoản
        const accountUpdateResult = await accountsCollection.updateOne(
          { _id: new ObjectId(accountId) },
          {
            $set: {
              email: body.email,
            },
          }
        );
        if (!accountUpdateResult.matchedCount) {
          return new Response(
            JSON.stringify({ error: "Failed to update account" }),
            {
              status: 400,
            }
          );
        }
      }
    }

    // Cập nhật thông tin nhân viên
    const updatedMember = await membersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          firstName: body.firstName,
          lastName: body.lastName,
          phone: body.phone,
          birthDate: new Date(body.birthDate),
          address: body.address,
        },
      }
    );

    if (!updatedMember.matchedCount) {
      return new Response(
        JSON.stringify({ error: "Failed to update employee" }),
        {
          status: 400,
        }
      );
    }

    // Trả về kết quả
    return new Response(JSON.stringify(updatedMember), {
      status: 200,
    });
  } catch (error) {
    console.error("Failed to update member:", error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// export async function DELETE(req, { params }) {
//   try {
//     // Lấy ID từ params
//     const { id } = params;
//     // Kết nối tới cơ sở dữ liệu
//     const { db } = await connectToDatabase();

//     const membersCollection = db.collection("members");
//     const accountsCollection = db.collection("accounts");
//     // Tìm thành viên để xóa
//     const memberToDelete = await membersCollection.findOne({
//       _id: new ObjectId(id),
//     });
//     if (!memberToDelete) {
//       throw new Error("Member not found");
//     }
//     const accountId = memberToDelete.accountId;
//     console.log("Account ID to delete:", accountId);

//     // Xóa người dùng
//     const memberResult = await membersCollection.deleteOne({
//       _id: new ObjectId(id),
//     });
//     if (!memberResult.deletedCount) {
//       throw new Error("Failed to delete member.");
//     }

//     // Xóa tài khoản liên quan
//     const accountResult = await accountsCollection.deleteOne({
//       _id: new ObjectId(accountId),
//     });
//     if (!accountResult.deletedCount) {
//       throw new Error("Failed to delete account.");
//     }
//     console.log("Account deleted:", accountResult);

//     // Trả về kết quả thành công
//     return new Response(
//       JSON.stringify({ message: "Member deleted successfully." }),
//       {
//         status: 200,
//       }
//     );
//   } catch (error) {
//     console.error("Failed to delete member:", error);
//     return new Response(JSON.stringify({ error: error.message }), {
//       status: 500,
//     });
//   }
// }
export async function DELETE(req, { params }) {
  try {
    // Lấy ID từ params
    const { id } = params;
    // Kết nối tới cơ sở dữ liệu
    const { db } = await connectToDatabase();

    const membersCollection = db.collection("members");
    const accountsCollection = db.collection("accounts");
    const borrowsCollection = db.collection("borrows");

    // Tìm thành viên để xóa
    const memberToDelete = await membersCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!memberToDelete) {
      throw new Error("Member not found");
    }
    const accountId = memberToDelete.accountId;

    // Kiểm tra thành viên có đang mượn sách chưa trả không
    const hasUnreturned = await borrowsCollection.findOne({
      member: new ObjectId(id),
      status: { $ne: "Returned" },
    });
    if (hasUnreturned) {
      return new Response(
        JSON.stringify({
          error: "Cannot delete member with unreturned books.",
        }),
        { status: 400 }
      );
    }

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