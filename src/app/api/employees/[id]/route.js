import { connectToDatabase } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
  const { id } = params;
  try {
    // Kết nối đến cơ sở dữ liệu
    await dbConnect();
    const employee = await getEmployeeById(id);
    if (!employee) {
      return new Response(JSON.stringify({ error: "Employee not found" }), {
        status: 404,
      });
    }
    return new Response(JSON.stringify(employee), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  try {
    // Kết nối đến cơ sở dữ liệu
    const { db } = await connectToDatabase();
    const employeesCollection = db.collection("employees");
    const body = await req.json();
    const updatedEmployee = await employeesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: body }
    );
    return new Response(JSON.stringify(updatedEmployee), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const { db } = await connectToDatabase();

    const employeesCollection = db.collection("employees");
    const accountsCollection = db.collection("accounts");
    const employeeToDelete = await employeesCollection.findOne({
      _id: new ObjectId(id),
    });
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
