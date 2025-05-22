// import dbConnect from "@/lib/dbConnect";
// import Account from "@/models/Account";
// import Author from "@/models/Author";
// import Book from "@/models/Book";
// import Borrow from "@/models/Borrow";
// import Member from "@/models/Member";
// import Employee from "@/models/Employee";
// import Publisher from "@/models/Publisher";

// export async function GET() {
//   try {
//     await dbConnect();

//     const sample = {
//       authors: await Author.find().limit(1),
//       publishers: await Publisher.find().limit(1),
//       books: await Book.find().limit(1),
//       members: await Member.find().limit(1),
//       employees: await Employee.find().limit(1),
//     };

//     return Response.json({
//       message: "Connected and models imported successfully",
//       sample,
//     });
//   } catch (error) {
//     console.error("Import failed:", error);
//     return new Response(JSON.stringify({ error: "Server Error" }), {
//       status: 500,
//     });
//   }
// }
