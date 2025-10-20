import { io } from "socket.io-client";
import useAuthStore from "../stores/useAuthStore";
import { clearSecureStorage } from "./secureStore";

const baseUrl = "http://192.168.1.17:3000";

let socket = null;

export const connectSocket = (token) => {
  try {
    if (!token) {
      console.log("Cannot connect the socket: Token is missing");
      return;
    }
    if (!socket || !socket.connected) {
      console.log("Attempting to connect socket...");

      socket = io(baseUrl, {
        auth: { token: token },
      });
    }

    socket.on("connect", () => {
      console.log(`Socket connected successfully: ${socket.id}`);
    });

    socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect" || reason === "transport close") {
        const { logout } = useAuthStore.getState();
        logout();
        console.warn(`Socket disconnected. Reason: ${reason}`);
      }
    });

    socket.on("connect_error", async (error) => {
      console.error("Socket connection error:", error.message);
      if (error.message.includes("Server failed to verify token")) {
        console.warn(
          "Authentication failed during socket connect. Forcing logout."
        );
        // clear invalid tokens from secure store
        await clearSecureStorage();
        // 1. Get the logout function from the store state
        const { logout } = useAuthStore.getState();

        // 2. Execute logout (clears state, tokens, and navigates)
        logout();

        // 3. Immediately disconnect the socket to prevent reconnect attempts
        if (socket && socket.connected) {
          socket.disconnect();
        }
      }
    });
  } catch (err) {
    console.log(err);
  }
};

export const disconnectSocket = () => {
  if (socket || socket.connected) {
    socket.disconnect();
    console.log("Socket manually disconnected.");
  }
  socket = null;
};

export { socket };
