import { useMutation } from "@tanstack/react-query";
import api, { setExpoPushHeader } from "../utils/axiosInstance";
import useAuthStore from "../stores/useAuthStore";
import { router } from "expo-router";
import { saveToken, saveUserInfo } from "../utils/secureStore";
import { getDevicePushToken } from "../utils/notifications";

export default function usePostSignUp() {
  const { invitationToken, invitationEmail } = useAuthStore.getState();

  // use tanstack query to send the data

  return useMutation({
    mutationFn: async (payload) => {
      if (!invitationToken) {
        throw new Error("Missing Invitation Token");
      }
      const {
        first_name,
        last_name,
        password,
        confirm_password,
        preferred_language,
      } = payload;

      const response = await api.post("api/users/sign-up", {
        first_name: first_name,
        last_name: last_name,
        password: password,
        language: preferred_language,
        invitationToken: invitationToken,
        confirm_password: confirm_password,
        email: invitationEmail,
      });

      return response.data;
    },
    onSuccess: async (data) => {
      const { login } = useAuthStore.getState();
      {
        if (data?.accessToken && data?.refreshToken && data?.userInfo) {
          // save accessToken and the refreshToken to the expo-secure storage
          await saveToken("accessToken", data.accessToken);
          await saveToken("refreshToken", data.refreshToken);
          await saveUserInfo("userInfo", data.userInfo);

          // generate the expo device push token
          const expoPushToken = await getDevicePushToken();

          // set expo push header
          setExpoPushHeader(expoPushToken);
          // set isLoggedIn to true isSigningUp to false and initialize tokens in the store
          login(data.accessToken, data.refreshToken, data.userInfo);
          // navigate to the root of the project
          return router.replace("/");
        }
      }
    },
    onError: (err) => {},
  });
}
