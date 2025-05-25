import fetch from "node-fetch";
import cron from "node-cron";

if (typeof window === "undefined") {
  if (!global.cronJobScheduled) {
    cron.schedule("57 22 * * *", async () => {
      console.log("Running daily reminder job...");

      try {
        const borrowResponse = await fetch(
          "https://library-management-2bws.vercel.app/api/borrow/auto",
          {
            method: "POST",
          }
        );

        const response = await fetch(
          "https://library-management-2bws.vercel.app/api/notifications",
          {
            method: "POST",
          }
        );

        const result = await response.json();
        console.log("Reminder job result:", result);
        const borrowResult = await borrowResponse.json();
        console.log("Borrow job result:", borrowResult);
      } catch (error) {
        console.error("Error running reminder job:", error);
      }
    });

    console.log("Cron job scheduled. Running every day at 8:00 AM.");
    global.cronJobScheduled = true;
  }
}
