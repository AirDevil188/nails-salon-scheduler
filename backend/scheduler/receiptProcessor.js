const cron = require("node-cron");
const db = require("@db/query");
const { processReceipts } = require("@services/expoNotificationService");
// "Run this job at the 0th, 15th, 30th, and 45th minute of every hour, on every day of the week, on every day of the month, in every month."
const processReceiptsCron = "*/15 * * * *";

const runReceiptProcessor = async () => {
  try {
    // find all pending ticket ids from the db
    const pendingTickets = await db.pendingTickets();

    if (pendingTickets.length === 0) {
      console.log("No pending tickets were found. Job complete.");
      return;
    }

    const ticketIds = pendingTickets
      .map((ticket) => ticket.expoTicketId)
      .filter(Boolean);

    if (ticketIds.length > 0) {
      console.log(`Found ${ticketIds.length} pending ticket IDs to process.`);

      // run processTickets update ticket status and invalidate push token
      await processReceipts(ticketIds);
    }
  } catch (err) {
    console.error("CRITICAL ERROR in Receipt Processor Cron Job:", err);
  } finally {
    console.log("--- Receipt Processor Job Finished ---");
  }
};

const startReceiptScheduler = () => {
  cron.schedule(processReceiptsCron, runReceiptProcessor, {
    scheduled: true,
    timezone: "Europe/Belgrade",
  });

  console.log(
    `Receipt processing scheduler started, running every 15 minutes.`
  );
};

module.exports = {
  startReceiptScheduler,
};
