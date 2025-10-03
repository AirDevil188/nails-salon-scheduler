// testClient.js

require("module-alias/register");
const io = require("socket.io-client");

const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});
//

const { signToken } = require("@utils/utils");

// 1. Configuration: Match your server's URL and desired test role
const SERVER_URL = "http://localhost:3000";
const TEST_ROLE = "admin"; // Testing the admin joining logic
const EVENT_TO_LISTEN_FOR = "appointmentCreated";
const TEST_PAYLOAD = {
  id: "test-admin-234",
  email: "test@admin.com",
  role: "admin",
};

const token = signToken(TEST_PAYLOAD, "8h");

console.log(`Connecting to ${SERVER_URL} as role: '${TEST_ROLE}'...`);

// 2. Connection: Sending the auth payload
const socket = io(SERVER_URL, {
  auth: {
    token: token,
  },
});

// 3. Connect/Error Handlers
socket.on("connect", () => {
  console.log(`\n✅ Client connected! ID: ${socket.id}`);
});

socket.on("connect_error", (err) => {
  console.error(`\n❌ Connection failed: ${err.message}`);
});

// 4. Custom Event Listener (The core of the test)
// This is the event your Express route will broadcast to the 'admin-dashboard' room
socket.on(EVENT_TO_LISTEN_FOR, (data) => {
  console.log("\n--- REAL-TIME EVENT RECEIVED ---");
  console.log(`Event: ${EVENT_TO_LISTEN_FOR}`);
  console.log("Received Data:", data);
  console.log("--------------------------------");
});

socket.on("disconnect", (reason) => {
  console.log(`Client disconnected. Reason: ${reason}`);
});

// test client app is going to be so that it can be passed like that
