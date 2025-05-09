import { connectToDatabase } from "@/lib/dbConnect";
import bcrypt from "bcryptjs";

const OTP_EXPIRY_MINUTES = 1;
const OTP_COLLECTION = "otp_verifications";

export const generateOtp = () => {
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`[OTP Store DB - generateOtp] Generated OTP: ${generatedOtp}`);
  return generatedOtp;
};

/**

 * @param {string} email 
 * @param {string} otp 
 * @param {object} data 
 * @returns {Promise<boolean>} 
 */
export const storeOtpData = async (email, otp, data) => {
  console.log(
    `[OTP Store DB - storeOtpData] Attempting to store OTP for: ${email}`
  );
  if (!email || typeof otp !== "string" || otp.length !== 6 || !data) {
    console.error(
      `[OTP Store DB - storeOtpData] Invalid parameters. Aborting store.`
    );
    return false;
  }

  try {
    const { db } = await connectToDatabase();
    const otpCollection = db.collection(OTP_COLLECTION);

    const otpHash = await bcrypt.hash(otp, 10);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const result = await otpCollection.updateOne(
      { email: email },
      {
        $set: {
          otpHash: otpHash,
          userData: data,
          expiresAt: expiresAt,
          createdAt: now,
        },
        $setOnInsert: { email: email },
      },
      { upsert: true }
    );

    if (
      result.acknowledged &&
      (result.upsertedCount > 0 || result.modifiedCount > 0)
    ) {
      console.log(
        `[OTP Store DB - storeOtpData] Successfully stored/updated OTP info for ${email}. Expires: ${expiresAt.toLocaleTimeString()}`
      );
      return true;
    } else {
      console.error(
        `[OTP Store DB - storeOtpData] Failed to store OTP info for ${email}. Result:`,
        result
      );
      return false;
    }
  } catch (error) {
    console.error(
      `[OTP Store DB - storeOtpData] Error storing OTP for ${email}:`,
      error
    );
    return false;
  }
};

/**
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export const getOtpData = async (email) => {
  console.log(
    `[OTP Store DB - getOtpData] Attempting to get OTP data for: ${email}`
  );
  try {
    const { db } = await connectToDatabase();
    const otpCollection = db.collection(OTP_COLLECTION);

    const record = await otpCollection.findOne({
      email: email,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      console.log(
        `[OTP Store DB - getOtpData] No valid OTP record found for: ${email}`
      );

      return null;
    }

    console.log(
      `[OTP Store DB - getOtpData] Found valid OTP record for: ${email}. Returning data.`
    );
    return {
      otpHash: record.otpHash,
      userData: record.userData,
    };
  } catch (error) {
    console.error(
      `[OTP Store DB - getOtpData] Error getting OTP for ${email}:`,
      error
    );
    return null;
  }
};

/**

 * @param {string} email 
 * @returns {Promise<boolean>} 
 */
export const deleteOtpData = async (email) => {
  console.log(
    `[OTP Store DB - deleteOtpData] Attempting to delete OTP data for: ${email}`
  );
  try {
    const { db } = await connectToDatabase();
    const otpCollection = db.collection(OTP_COLLECTION);

    const result = await otpCollection.deleteOne({ email: email });

    if (result.acknowledged) {
      console.log(
        `[OTP Store DB - deleteOtpData] Delete operation acknowledged for ${email}. Deleted count: ${result.deletedCount}`
      );
      return true;
    } else {
      console.error(
        `[OTP Store DB - deleteOtpData] Delete operation failed for ${email}.`
      );
      return false;
    }
  } catch (error) {
    console.error(
      `[OTP Store DB - deleteOtpData] Error deleting OTP for ${email}:`,
      error
    );
    return false;
  }
};
