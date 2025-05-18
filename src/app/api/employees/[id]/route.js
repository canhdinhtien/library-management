import { connectToDatabase } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
  // Lấy ID từ params
  const { id } = params;
  try {
    // Kết nối đến cơ sở dữ liệu
    await dbConnect();
    // Lấy thông tin nhân viên theo ID
    const employee = await getEmployeeById(id);
    // Kiểm tra xem có nhân viên không
    if (!employee) {
      return new Response(JSON.stringify({ error: "Employee not found" }), {
        status: 404,
      });
    }
    // Trả về thông tin nhân viên
    return new Response(JSON.stringify(employee), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function PUT(req, { params }) {
  // Lấy ID từ params
  const { id } = params;
  try {
    // Kết nối đến cơ sở dữ liệu
    const { db } = await connectToDatabase();
    const employeesCollection = db.collection("employees");
    const accountsCollection = db.collection("accounts");
    // Lấy dữ liệu từ request body
    const body = await req.json();

    // Lấy id account từ request body
    const employeeToEdit = await employeesCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!employeeToEdit) {
      return new Response(JSON.stringify({ error: "Employee not found" }), {
        status: 404,
      });
    }
    const accountId = employeeToEdit.accountId;

    // Kiểm tra xem email đã tồn tại chưa
    const existingAccount = await accountsCollection.findOne({
      email: body.email,
    });
    if (existingAccount && existingAccount._id.toString() !== accountId) {
      return new Response(JSON.stringify({ error: "Email already exists" }), {
        status: 400,
      });
    }

    // Cập nhật thông tin nhân viên
    const updatedEmployee = await employeesCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          firstName: body.firstName,
          lastName: body.lastName,
          phone: body.phone,
          birthDate: new Date(body.birthDate),
          address: body.address,
          email: body.email,
        },
      }
    );

    const updatedAccount = await accountsCollection.updateOne(
      { _id: new ObjectId(accountId) },
      {
        $set: {
          email: body.email,
        },
      }
    );

    if (!updatedEmployee.matchedCount) {
      return new Response(
        JSON.stringify({ error: "Failed to update employee" }),
        {
          status: 400,
        }
      );
    }
    if (!updatedAccount.matchedCount) {
      return new Response(
        JSON.stringify({ error: "Failed to update account" }),
        {
          status: 400,
        }
      );
    }
    // Trả về kết quả
    return new Response(JSON.stringify(updatedEmployee), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function DELETE(req, { params }) {
  try {
    // Lấy ID từ params
    const { id } = params;
    // Kết nối đến cơ sở dữ liệu
    const { db } = await connectToDatabase();

    const employeesCollection = db.collection("employees");
    const accountsCollection = db.collection("accounts");
    // Tìm nhân viên để xóa
    const employeeToDelete = await employeesCollection.findOne({
      _id: new ObjectId(id),
    });
    // Kiểm tra xem có nhân viên không
    if (!employeeToDelete) {
      throw new Error("Employee not found");
    }
    const accountId = employeeToDelete.accountId;
    console.log("Account ID to delete:", accountId); // Log ID tài khoản để xóa

    // Xóa nhân viên
    const employeeResult = await employeesCollection.deleteOne({
      _id: new ObjectId(id),
    });
    if (!employeeResult.deletedCount) {
      throw new Error("Failed to delete employee.");
    }

    // Xóa tài khoản liên quan
    const accountResult = await accountsCollection.deleteOne({
      _id: new ObjectId(accountId),
    });
    if (!accountResult.deletedCount) {
      throw new Error("Failed to delete account.");
    }
    console.log("Account deleted:", accountResult);

    // Trả về thông báo thành công
    return new Response(
      JSON.stringify({ message: "Employee deleted successfully." }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed to delete employee:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
