import dbConnect from "../../../../lib/dbConnect.js";
import {
  createEmployee,
  getEmployees,
} from "../../../../services/employeeService.js";

export async function POST(req) {
  try {
    // Kết nối đến cơ sở dữ liệu
    await dbConnect();
    const body = await req.json();
    const newEmployee = await createEmployee(body);
    return new Response(JSON.stringify(newEmployee), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function GET() {
  try {
    // Kết nối đến cơ sở dữ liệu
    await dbConnect();
    const employees = await getEmployees();
    return new Response(JSON.stringify(employees), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
