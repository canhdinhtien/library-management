import { connectToDatabase } from "@/lib/dbConnect";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/mailer";

export const handleForgotPassword = async (email) => {
  const { db } = await connectToDatabase();
  const accountsCollection = db.collection("accounts");

  const user = await accountsCollection.findOne(
    { email },
    { projection: { _id: 1, email: 1 } }
  );

  if (user) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000);

    await accountsCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetToken: resetToken,
          passwordResetTokenExpires: expires,
          updatedAt: new Date(),
        },
      }
    );

    await sendPasswordResetEmail(user.email, resetToken);
  }
};
