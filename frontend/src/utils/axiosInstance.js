import axios from "axios";
import useAuthStore from "../stores/useAuthStore";
import { getToken } from "./secureStore";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  baseURL: "http://192.168.1.17:3000",
  //   baseURL: "192.168.1.248:3000",
  timeout: 10000, // delay of 10 seconds if the server for some reason becomes unresponsive
});

//  Sets the Authorization header globally
export const setAuthHeader = (accessToken) => {
  if (accessToken) {
    // Set the token for all future requests made by this 'api' instance
    api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  } else {
    // If the token is null (e.g., during logout), remove the header
    delete api.defaults.headers.common["Authorization"];
  }
  console.log(
    `Axios: Authorization header updated. Token present: ${!!accessToken}`
  );
};

// Sets the X-push Header
export const setExpoPushHeader = (token) => {
  if (token) {
    api.defaults.headers.common["x-push-token"] = token;
    console.log("Push token header temporarily set for registration.");
  } else {
    delete api.defaults.headers.common["x-push-token"];
    console.log("Push token header removed.");
  }
};

api.interceptors.request.use(
  (config) => {
    // get the preferred language and accessToken from zustand store
    const { preferredLanguage, accessToken } = useAuthStore.getState();
    if (preferredLanguage) {
      // set preferred language in header
      config.headers["x-app-language"] = preferredLanguage;
    }
    if (accessToken) {
      // set accessToken header
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// Token refresh function
let isRefreshing = false;
let failedQueue = [];

// helper function to process the queue of failed requests
const processQueue = (err, token = null) => {
  failedQueue.forEach((prom) => {
    if (err) {
      prom.reject(err);
    } else {
      prom.resolve(token);
    }
  });
  // when finished make failedQueue empty
  failedQueue = [];
};

const refreshTokenRetry = async (originalReq) => {
  try {
    const refreshToken = await getToken("refreshToken");

    if (!refreshToken) {
      throw new Error("Refresh token not found");
    }

    const response = await api.post("/api/token/refresh", {
      refreshToken: refreshToken,
    });

    // deconstruct
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      response.data;

    //userInfo
    const userInfo = useAuthStore.getState().userInfo;

    // save new tokens to the expo-secure store
    await SecureStore.setItemAsync("accessToken", newAccessToken);
    await SecureStore.setItemAsync("refreshToken", newRefreshToken);

    setAuthHeader(newAccessToken);

    // update zustand state
    useAuthStore.getState().login(newAccessToken, newRefreshToken, userInfo);

    // update the header of the failed request
    originalReq.headers.Authorization = `Bearer ${newAccessToken}`;

    return await api(originalReq);
  } catch (err) {
    // if the refreshing fails logout
    useAuthStore.getState().logout();
    return Promise.reject(err);
  }
};

api.interceptors.response.use(
  (response) => response, // success

  async (err) => {
    const originalReq = err.config;
    const status = err.response?.status;
    const isRefreshEndpoint = originalReq.url === "/api/token/refresh";

    // Check if error is 401 and it's not the refresh endpoint itself
    if (status === 401 && !isRefreshEndpoint) {
      if (isRefreshing) {
        // if the refreshing is in progress push to the  queue
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
          // once the refresh is complete return new refresh token and set the Bearer header
        })
          .then((token) => {
            originalReq.headers.Authorization = `Bearer ${token}`;
            return api(originalReq);
          })
          .catch((err) => {
            return new Promise.reject(err);
          });
      }
      isRefreshing = true; // refresh starting if no refresh is already in progress

      const newPromise = new Promise(async (resolve, reject) => {
        try {
          const result = await refreshTokenRetry(originalReq);
          const newToken = useAuthStore.getState().accessToken;
          processQueue(null, newToken);
          resolve(result);
        } catch (err) {
          processQueue(err, null); // push err to Queue if err
          reject(err);
        } finally {
          isRefreshing = false; // refresh finished
        }
      });
      console.log(newPromise, "promise");
      return newPromise;
    }
    return Promise.reject(err);
  }
);

export default api;
