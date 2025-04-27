import { generateOtp, storeOtpData, getOtpData } from "@/lib/otpStore";

export async function checkOtpExists(email) {
  const pendingData = await getOtpData(email);
  if (pendingData) {
    console.warn(
      `OTP request rejected: Valid OTP already exists in DB for ${email}`
    );
    throw new Error(
      "An OTP has already been sent and is still valid. Please check your inbox or wait 10 minutes."
    );
  }
}

export function generateOtpAndStore(email, formData, hashedPassword) {
  const otp = generateOtp();
  if (typeof otp === "undefined" || otp.length !== 6) {
    throw new Error("Failed to generate a valid OTP.");
  }

  const temporaryData = { ...formData };
  delete temporaryData.password;
  delete temporaryData.verifyPassword;
  temporaryData.hashedPassword = hashedPassword;

  return storeOtpData(email, otp, temporaryData);
}
