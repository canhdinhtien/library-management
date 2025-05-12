import nodemailer from "nodemailer";

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn(
    "!!! Email environment variables (EMAIL_USER, EMAIL_PASS) not set. Mailer will likely fail. !!!"
  );
}

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("MAILER CONFIG ERROR:", error);
  } else {
    console.log("Mailer is ready to take messages:", success);
  }
});

export const sendOtpEmail = async (to, otp) => {
  if (typeof otp === "undefined") {
    console.error(
      `[Mailer] Attempted to send email to ${to} with undefined OTP. Aborting.`
    );
    throw new Error("Cannot send email with undefined OTP.");
  }

  console.log(`[Mailer] Preparing OTP email for ${to} with OTP: ${otp}`);

  const mailOptions = {
    from: `"Digital Library Hub" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: "Your One-Time Password (OTP) for Your App Name",
    text: `Your OTP for registering an account is: ${otp}\n\nThis code is valid for 1 minutes. If you didn't request this, please ignore this email.`,
    html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 400px; margin: auto;">
                 <h2 style="color: #333;">Your App Name - Email Verification</h2>
                 <p>Thank you for registering. Please use the following One-Time Password (OTP) to complete your registration:</p>
                 <p style="font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #111; background-color: #f0f0f0; padding: 12px 20px; border-radius: 5px; display: inline-block; margin: 15px 0;">
                   ${otp}
                 </p>
                 <p>This code is valid for <strong>1 minutes</strong>.</p>
                 <p style="color: #666; font-size: 0.9em;">If you did not request this registration, please ignore this email.</p>
               </div>`,
  };

  try {
    console.log(
      `Attempting to send OTP email via ${process.env.EMAIL_SERVICE} from ${process.env.EMAIL_USER} to ${to}`
    );
    let info = await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully: %s", info.messageId);
    return info;
  } catch (error) {
    console.error(">>> Original Nodemailer Error (OTP):", error);
    console.error(`Error sending OTP email to ${to}:`, error.message);
    throw new Error("Could not send OTP email.");
  }
};

export const sendPasswordResetEmail = async (to, token) => {
  const resetLink = `${
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  }/reset-password/${token}`;

  console.log(`[Mailer] Preparing password reset email for ${to}`);

  const mailOptions = {
    from: `"Your App Name" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: "Password Reset Request for Your App Name",
    text:
      `You are receiving this email because you (or someone else) requested a password reset for your account.\n\n` +
      `Please click the following link, or paste it into your browser, to complete the process:\n\n` +
      `${resetLink}\n\n` +
      `This link will expire in 1 hour.\n\n` +
      `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2>Password Reset Request - Your App Name</h2>
            <p>You received this email because you (or someone else) requested a password reset for your account.</p>
            <p>Please click the button below to reset your password:</p>
            <a href="${resetLink}" style="background-color: #FFA500; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0;">Reset Password</a>
            <p>This link will expire in <strong>1 hour</strong>.</p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <p style="font-size: 0.9em; color: #777;">If the button doesn't work, copy and paste the following link into your web browser:</p>
            <p style="font-size: 0.9em; color: #777; word-break: break-all;">${resetLink}</p>
          </div>`,
  };

  try {
    console.log(`Attempting to send password reset email to ${to}`);
    let info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully: %s", info.messageId);
    return info;
  } catch (error) {
    console.error(">>> Original Nodemailer Error (Password Reset):", error);
    console.error(
      `Error sending password reset email to ${to}:`,
      error.message
    );

    throw new Error("Could not send password reset email.");
  }
};
