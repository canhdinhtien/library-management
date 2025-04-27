import { connectToDatabase } from "@/lib/dbConnect";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
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
            returnDate: null,
            "books.expectedReturnDate": {
              $gte: now,
              $lt: tomorrow,
            },
          },
        },
        {
          $unwind: "$books",
        },
        {
          $match: {
            "books.expectedReturnDate": {
              $gte: now,
              $lt: tomorrow,
            },
          },
        },
        {
          $lookup: {
            from: "books",
            localField: "books.book",
            foreignField: "_id",
            as: "bookDetails",
          },
        },
        {
          $lookup: {
            from: "members",
            localField: "member",
            foreignField: "_id",
            as: "memberDetails",
          },
        },
        {
          $lookup: {
            from: "members",
            localField: "member",
            foreignField: "_id",
            as: "memberDetails",
          },
        },
        {
          $lookup: {
            from: "accounts",
            localField: "memberDetails.accountId",
            foreignField: "_id",
            as: "accountDetails",
          },
        },
        {
          $unwind: "$memberDetails",
        },
        {
          $project: {
            memberEmail: "$accountDetails.email",
            bookTitle: "$bookDetails.title",
            dueDate: "$books.expectedReturnDate",
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
