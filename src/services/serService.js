import { connectToDatabase } from "@/lib/dbConnect";

export async function checkUserExists(email, username) {
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
