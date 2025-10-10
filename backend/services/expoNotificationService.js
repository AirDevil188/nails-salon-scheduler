const { Expo } = require("expo-server-sdk");

const expo = new Expo();

const db = require("@db/query");

const sendSingleNotification = async (notification, prisma) => {
  // We wrap the single notification in an array to use the existing batch function
  return sendNotificationBatch([notification], expo, prisma);
};

const sendNotificationBatch = async (notifications, expoClient, prisma) => {
  if (notifications.length === 0) {
    console.log("No notifications were sent");
    return;
  }
  const messages = [];
  const recipesToSave = [];

  for (const notification of notifications) {
    // if the current token is not valid expo push token skip it and display err
    if (!Expo.isExpoPushToken(notification.pushToken)) {
      console.error(
        `Token ${notification.pushToken} is not a valid Expo Push token. Skipping.`
      );
      continue;
    }
    messages.push({
      to: notification.pushToken,
      title: notification.title,
      sound: "default",
      body: notification.body,
      data: {
        userId: notification.userId,
        originalMessage: notification.message,
      },
      channelId: "default",
    });
  }
  // if there are no valid messages display err
  if (messages.length === 0) {
    console.error("There are no valid messages to send");
    return [];
  }
  // split into chunks max of 100
  const chunks = expoClient.chunkPushNotifications(messages);

  try {
    for (const chunk of chunks) {
      const ticketChunk = await expoClient.sendPushNotificationsAsync(chunk);

      for (let i = 0; i < ticketChunk.length; i++) {
        // Process the ticket results for logging
        const ticket = ticketChunk[i];
        const sentMessage = chunk[i];

        const userId = sentMessage.data?.userId;

        const receiptData = {
          pushToken: sentMessage.to,
          userId: userId,
          expoTicketId: ticket.id || null,
          status: ticket.status === "ok" ? "PENDING" : "ERROR",
          details: JSON.stringify(ticket.details || {}),
        };
        if (ticket.id || ticket.status === "error") {
          recipesToSave.push(receiptData);
        }

        if (ticket.status === "error") {
          console.error(
            `Immediate Error for user ${userId} (${sentMessage.to}): ${ticket.details?.error || ticket.message}`
          );
        }
      }
    }
    if (recipesToSave.length > 0) {
      console.log(
        `Saving ${recipesToSave.length} ticket receipts to database...`
      );
      const promises = recipesToSave.map((data) => {
        return db.createNotificationReceipt(data);
      });

      await prisma.$transaction(promises);
      console.log("Ticket receipts saved successfully.");
    }
  } catch (err) {
    console.error(`Error with the sending of the notification batch`);
  }
};

const processReceipts = async (ticketIds) => {
  // ticketIds will be returned value or collation from pendingTickets query
  if (ticketIds.length === 0) {
    console.error("No tickets to process");
    return [];
  }

  console.log(`Fetching recipes for ${ticketIds.length} tickets`);

  try {
    let recipes = await expo.getPushNotificationReceiptsAsync(ticketIds);
    for (const ticketId in recipes) {
      let receipt = recipes[ticketId]; // assigns id to recipes
      const receiptDetails = JSON.stringify(receipt);

      if (receipt.status === "ok") {
        // what should i do here
        await db.updateTicket(ticketId, receiptDetails, "DELIVERED");
        console.log(`Ticket ${ticketId} marked as DELIVERED.`);
      }

      if (receipt.status === "error") {
        const errorDetails = receipt.details?.error;
        let newStatus = "FAILED";

        if (errorDetails === "DeviceNotRegistered") {
          const pushToken = await db.findPushToken(ticketId);

          if (pushToken?.pushToken) {
            // delete the push token if inactive
            await db.deletePushToken(pushToken.pushToken);
          } else {
            console.error(
              `Could not find pushToken for dead ticket ${ticketId}`
            );
          }

          newStatus = "INVALID_TOKEN";
          await db.updateTicket(ticketId, receiptDetails, newStatus);

          // delete the dead token
        } else {
          await db.updateTicket(ticketId, receiptDetails, newStatus);
          console.error(
            `[ERROR] Notification error for ticket ${ticketId}. Details: ${errorDetails}`
          );
        }
      }
    }
  } catch (err) {
    console.error(`Error with processing of the ticket recipes`);
    return [];
  }
};

module.exports = {
  sendNotificationBatch,
  processReceipts,
  sendSingleNotification,
};
