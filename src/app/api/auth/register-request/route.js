import bcrypt from "bcryptjs";
import { sendOtpEmail } from "@/lib/mailer";
import { validateRegistrationData } from "@/utils/validation";
import { generateOtp, storeOtpData, getOtpData } from "@/lib/otpStore";
import { connectToDatabase } from "@/lib/dbConnect";

async function checkUserExists(email, username) {
  console.log(
    `[DB Check] Checking if email '${email}' or username '${username}' exists...`
  );
  try {
    const { db } = await connectToDatabase();
    const accountsCollection = db.collection("accounts");
    const existingUser = await accountsCollection.findOne(
      { $or: [{ email: email }, { username: username }] },
      { projection: { _id: 1, email: 1, username: 1 } }
    );
    if (existingUser) {
      console.log(
        `[DB Check] Found existing user: ${
          existingUser.email === email ? "Email match" : "Username match"
        }`
      );
    } else {
      console.log(`[DB Check] No existing user found.`);
    }
    return existingUser;
  } catch (error) {
    console.error("[DB Check] Error checking user existence:", error);
    throw new Error("Database error during user check.");
  }
}
export async function POST(req) {
  let formData;
  try {
    formData = await req.json();
  } catch (error) {
    console.error("Failed to parse request body:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Invalid request format." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { email, username, password /*, ... */ } = formData;

  const validationErrors = validateRegistrationData(formData);
  if (Object.keys(validationErrors).length > 0) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Validation failed.",
        errors: validationErrors,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const pendingData = await getOtpData(email);
    if (pendingData) {
      console.warn(
        `OTP request rejected: Valid OTP already exists in DB for ${email}`
      );
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "An OTP has already been sent and is still valid. Please check your inbox or wait 10 minutes.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const existingUser = await checkUserExists(email, username);
    if (existingUser) {
      const errors = {};
      if (existingUser.email === email)
        errors.email = "Email address is already registered.";
      if (existingUser.username === username)
        errors.username = "Username is already taken.";
      console.warn(
        `Registration rejected: User exists for ${email} or ${username}`
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: "User already exists.",
          errors,
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOtp();
    if (typeof otp === "undefined" || otp.length !== 6) {
      throw new Error("Failed to generate a valid OTP.");
    }

    const temporaryData = { ...formData };
    delete temporaryData.password;
    delete temporaryData.verifyPassword;
    temporaryData.hashedPassword = hashedPassword;

    const storedSuccessfully = await storeOtpData(email, otp, temporaryData);
    if (!storedSuccessfully) {
      throw new Error("Failed to save temporary registration data.");
    }

    console.log(
      `[Register Request] Calling sendOtpEmail with OTP:`,
      otp,
      typeof otp
    );
    await sendOtpEmail(email, otp);

    console.log(
      `Registration request initiated successfully for ${email}. OTP info stored in DB.`
    );
    return new Response(
      JSON.stringify({
        success: true,
        message: `An OTP has been sent to ${email}. Please check your inbox (and spam folder) and enter the code to complete registration.`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error during registration request processing:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "An unexpected server error occurred.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
