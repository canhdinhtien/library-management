import dbConnect from "../../../../../../lib/dbConnect.js";
import { renewBook } from "../../../../../../services/borrowService.js";

export async function POST(req, { params }) {
  const { borrowId, bookId } = params;
  const { newDueDate } = await req.json(); // Lấy newDueDate từ request body

  try {
    // Kết nối đến cơ sở dữ liệu
    await dbConnect();
    const result = await renewBook(borrowId, bookId, newDueDate);
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
