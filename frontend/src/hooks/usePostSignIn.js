import { useMutation } from "@tanstack/react-query";
import api from "../utils/axiosInstance";
import useAuthStore from "../stores/useAuthStore";
import { router } from "expo-router";
import { saveToken, saveUserInfo } from "../utils/secureStore";

export default function usePostSignIn() {
  return useMutation({
    mutationFn: async (payload) => {
      const { email, password } = payload;

      const response = await api.post("/api/users/sign-in", {
        email: email,
        password: password,
      });

      return response.data;
    },
    onSuccess: async (data) => {
      const { login } = useAuthStore.getState();

      if (data?.accessToken && data?.refreshToken && data?.userInfo) {
        // save tokens to expo-secure-storage

        await saveToken("accessToken", data.accessToken);
        await saveToken("refreshToken", data.refreshToken);
        await saveUserInfo("userInfo", data.userInfo);
        // save tokens and userInfo to the auth store
        login(data.accessToken, data.refreshToken, data.userInfo);
        return router.replace("/");
      }
    },
  });
}
