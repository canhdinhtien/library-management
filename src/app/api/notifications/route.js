import { connectToDatabase } from "@/lib/dbConnect";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    // Kết nối đến cơ sở dữ liệu
    const { db } = await connectToDatabase();
    const borrowsCollection = db.collection("borrows");
    const membersCollection = db.collection("members");
    const accountsCollection = db.collection("accounts");

    // Lấy danh sách các sách sắp đến hạn trả (trong vòng 1 ngày)
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    const booksDueSoon = await borrowsCollection
      .aggregate([
        {
          $match: {
            returnDate: null, // Chỉ lấy các bản ghi chưa trả sách
            expectedReturnDate: {
              $gte: now,
              $lt: tomorrow, // Sách sắp đến hạn trả trong vòng 1 ngày
            },
          },
        },
        {
          $lookup: {
            from: "books",
            localField: "bookId", // Liên kết với bảng books qua bookId
            foreignField: "_id",
            as: "bookDetails",
          },
        },
        {
          $lookup: {
            from: "members",
            localField: "member", // Liên kết với bảng members qua member
            foreignField: "_id",
            as: "memberDetails",
          },
        },
        {
          $lookup: {
            from: "accounts",
            localField: "memberDetails.accountId", // Liên kết với bảng accounts qua accountId
            foreignField: "_id",
            as: "accountDetails",
          },
        },
        {
          $unwind: "$bookDetails", // Giải nén thông tin sách
        },
        {
          $unwind: "$memberDetails", // Giải nén thông tin thành viên
        },
        {
          $unwind: "$accountDetails", // Giải nén thông tin tài khoản
        },
        {
          $project: {
            _id: 0,
            memberEmail: "$accountDetails.email", // Email của thành viên
            bookTitle: "$bookDetails.title", // Tên sách
            dueDate: "$expectedReturnDate", // Ngày trả dự kiến
          },
        },
      ])
      .toArray();

    console.log("Books due soon:", booksDueSoon);

    // Cấu hình Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Gửi email nhắc nhở
    for (const book of booksDueSoon) {
      const mailOptions = {
        from: `"Digital Library Hub" <${process.env.EMAIL_USER}>`,
        to: book.memberEmail,
        subject: "📚 Reminder: Your Book is Due Soon!",
        text: `Hello,
      
      We hope you're enjoying your book "${
        book.bookTitle
      }". This is a friendly reminder that it is due on ${new Date(
          book.dueDate
        ).toLocaleDateString()}.
      
      Please make sure to return it on time to avoid any late fees.
      
      Thank you for using Digital Library Hub!
      
      Best regards,
      The Digital Library Hub Team`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #4CAF50;">📚 Reminder: Your Book is Due Soon!</h2>
            <p>Hello,</p>
            <p>We hope you're enjoying your book <strong>"${
              book.bookTitle
            }"</strong>. This is a friendly reminder that it is due on <strong>${new Date(
          book.dueDate
        ).toLocaleDateString()}</strong>.</p>
            <p>Please make sure to return it on time to avoid any late fees.</p>
            <p>Thank you for using <strong>Digital Library Hub</strong>!</p>
            <br>
            <p style="font-size: 0.9em; color: #555;">Best regards,</p>
            <p style="font-size: 0.9em; color: #555;">The Digital Library Hub Team</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    // Trả về thông báo thành công
    return new Response(
      JSON.stringify({
        success: true,
        message: "Reminders sent successfully.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending reminders:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to send reminders." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
