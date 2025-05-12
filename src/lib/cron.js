import fetch from "node-fetch";
import cron from "node-cron";

cron.schedule("0 8 * * *", async () => {
  console.log("Running daily reminder job...");

  try {
    const response = await fetch("http://localhost:3000/api/notifications", {
      method: "POST",
    });

    const result = await response.json();
    console.log("Reminder job result:", result);
  } catch (error) {
    console.error("Error running reminder job:", error);
  }
});

console.log("Cron job scheduled. Running every day at 8:00 AM.");
