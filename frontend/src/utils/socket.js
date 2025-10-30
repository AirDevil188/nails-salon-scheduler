import { io } from "socket.io-client";
import useAuthStore from "../stores/useAuthStore";
import { clearSecureStorage } from "./secureStore";
import api from "../utils/axiosInstance";

const baseUrl = "http://192.168.1.20:3000";

let socket = null;

const refreshAccessToken = async () => {
  const { refreshToken } = useAuthStore.getState();

  const response = await api.post("/api/token/refresh", {
    refreshToken: refreshToken,
  });

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
    response.data;

  // Update state/storage with the new tokens
  const { login } = useAuthStore.getState();
  login(newAccessToken, newRefreshToken, null);

  return newAccessToken;
};

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
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      socket.on("reconnect_attempt", async () => {
        try {
          console.log("Reconnection attempt initiated. Refreshing token...");

          const newAccessToken = await refreshAccessToken();

          // Update the token that socket.io will use for the next connection attempt
          socket.auth.token = newAccessToken;

          console.log("Socket token updated for reconnection.");
        } catch (error) {
          console.error(
            "Failed to renew socket token on reconnect. Forcing logout.",
            error
          );

          // If the refresh token exchange fails
          // the user session is over
          useAuthStore.getState().logout();
          socket.disconnect();
        }
      });
    }

    socket.on("connect", () => {
      console.log(`Socket connected successfully: ${socket.id}`);
    });

    socket.on("disconnect", (reason) => {
      // Allow io server disconnect to trigger logout, as it's a server-side decision
      if (reason === "io server disconnect") {
        const { logout } = useAuthStore.getState();
        logout();
        console.warn(`Socket disconnected. Reason: ${reason}. Forcing logout.`);
      } else {
        console.warn(
          `Socket disconnected. Reason: ${reason}. Will attempt reconnect.`
        );
      }
    });

    // Handle initial connection errors or server-side auth rejection
    socket.on("connect_error", async (error) => {
      console.error("Socket connection error:", error.message);

      // This is the error thrown by your backend when the access token is invalid/expired
      if (error.message.includes("Token is invalid or expired")) {
        console.warn(
          "Socket authentication failed. Attempting to refresh token."
        );

        try {
          // Attempt to refresh the token and retry connection
          const newAccessToken = await refreshAccessToken();

          // Update token and reconnect
          socket.auth.token = newAccessToken;
          socket.connect();
        } catch (refreshError) {
          console.error("Token refresh failed. Forcing full cleanup.");
          // If refresh fails, it's a full session expiry
          await clearSecureStorage();
          useAuthStore.getState().logout();
          socket.disconnect();
        }
      } else if (
        error.message.includes("No authentication token was provided")
      ) {
        // Handle missing token on initial connect
        console.error("Missing token. Forcing full cleanup.");
        await clearSecureStorage();
        useAuthStore.getState().logout();
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
