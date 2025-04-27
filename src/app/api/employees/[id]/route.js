import dbConnect from "../../../../../lib/dbConnect.js";
import {
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../../../../../services/employeeService.js";

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
    await dbConnect();
    const body = await req.json();
    const updatedEmployee = await updateEmployee(id, body);
    return new Response(JSON.stringify(updatedEmployee), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    await deleteEmployee(id);
    return new Response(
      JSON.stringify({ message: "Employee deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
