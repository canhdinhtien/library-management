import { getOtpData, deleteOtpData } from "@/lib/otpStore";
import { connectToDatabase } from "@/lib/dbConnect";
import bcrypt from "bcryptjs";

// Hàm tạo người dùng trong cơ sở dữ liệu
async function createUserInDatabase(userData) {
  console.log(
    `[DB Create Native] Attempting to create user: ${userData.email}`
  );
  const { client, db } = await connectToDatabase();
  const session = client.startSession();

  try {
    let newAccountId;
    let newMemberId;
    await session.withTransaction(async () => {
      const accountsCollection = db.collection("accounts");
      const membersCollection = db.collection("members");
      const memberCode = `MEM-${Date.now().toString().slice(-6)}`;

      const accountDoc = {
        username: userData.username,
        password: userData.hashedPassword,
        email: userData.email,
        role: "member",
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const insertAccountResult = await accountsCollection.insertOne(
        accountDoc,
        { session }
      );
      if (!insertAccountResult.insertedId)
        throw new Error("Failed to insert account.");
      newAccountId = insertAccountResult.insertedId;
      console.log(
        `[DB Create Native] Account inserted with ID: ${newAccountId}`
      );

      const memberDoc = {
        memberCode: memberCode,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.surname,
        birthDate: userData.dob ? new Date(userData.dob) : null,
        address: userData.address || null,
        phone: userData.phone || null,
        accountId: newAccountId,
        registeredAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const insertMemberResult = await membersCollection.insertOne(memberDoc, {
        session,
      });
      if (!insertMemberResult.insertedId)
        throw new Error("Failed to insert member.");
      newMemberId = insertMemberResult.insertedId;
      console.log(`[DB Create Native] Member inserted with ID: ${newMemberId}`);

      const updateAccountResult = await accountsCollection.updateOne(
        { _id: newAccountId },
        { $set: { ref: newMemberId, updatedAt: new Date() } },
        { session }
      );
      if (updateAccountResult.modifiedCount !== 1)
        throw new Error("Failed to update account ref.");
      console.log(
        `[DB Create Native] Account ${newAccountId} updated with Member ref: ${newMemberId}`
      );
      console.log(
        `[DB Create Native] Transaction successful for ${userData.email}`
      );
    });

    return {
      email: userData.email,
      accountId: newAccountId,
      memberId: newMemberId,
      status: "created",
    };
  } catch (dbError) {
    console.error("[DB Create Native] TRANSACTION FAILED. Error:", dbError);
    if (dbError.code === 11000) {
      if (dbError.message.includes("email_1"))
        throw new Error("Email already associated with an account.");
      else if (dbError.message.includes("username_1"))
        throw new Error("Username already taken.");
      else if (dbError.message.includes("memberCode_1"))
        throw new Error("Failed to generate unique member code.");
      else if (dbError.message.includes("accountId_1"))
        throw new Error("Account link error.");
      else throw new Error("Duplicate value error.");
    }
    throw new Error("Failed to save user information.");
  } finally {
    await session.endSession();
    console.log("[DB Create Native] Session ended.");
  }
}

export async function POST(req) {
  let body;
  try {
    // Lấy dữ liệu từ request body
    body = await req.json();
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: "Invalid request format." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { email, otp } = body;
  if (!email || !otp) {
    return new Response(
      JSON.stringify({ success: false, message: "Email and OTP required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Lấy dữ liệu OTP đã lưu
  const storedRecord = await getOtpData(email);

  // Kiểm tra xem có dữ liệu OTP không
  if (!storedRecord || !storedRecord.otpHash) {
    console.warn(
      `OTP Verification Failed: No valid OTP record or hash found in DB for ${email}`
    );
    return new Response(
      JSON.stringify({
        success: false,
        message: "Invalid or expired OTP. Please try registering again.",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  console.log(
    `[Verify Route] Comparing submitted OTP: '${otp}' with stored HASH for ${email}`
  );
  // So sánh OTP đã nhập với OTP đã lưu
  const isOtpValid = await bcrypt.compare(otp, storedRecord.otpHash);

  // Kiểm tra xem OTP có hợp lệ không
  if (!isOtpValid) {
    console.warn(
      `OTP Verification Failed: Incorrect OTP entered for ${email}.`
    );
    return new Response(
      JSON.stringify({ success: false, message: "Incorrect OTP entered." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  console.log(
    `OTP Verification Succeeded for ${email}. Proceeding to user creation.`
  );

  try {
    // Tạo người dùng
    const newUser = await createUserInDatabase(storedRecord.userData);

    // Xóa dữ liệu OTP
    const deleted = await deleteOtpData(email);
    if (!deleted) {
      console.warn(
        `[Verify Route] Failed to delete OTP data for ${email} after successful verification, but proceeding.`
      );
    }

    console.log(
      `User registration completed successfully for ${newUser.email}`
    );
    return new Response(
      JSON.stringify({
        success: true,
        message: "Account verified successfully! Welcome aboard.",
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error during final user creation/OTP cleanup:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message:
          error.message || "An error occurred while finalizing your account.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
