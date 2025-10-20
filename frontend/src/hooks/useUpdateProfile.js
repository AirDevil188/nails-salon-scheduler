import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/axiosInstance";
import { userKeys } from "../utils/queryKeys";

export default function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { first_name, last_name, preferred_language } = payload;

      const response = await api.patch("/api/users/profile", {
        first_name,
        last_name,
        preferredLanguage: preferred_language,
      });
      return response.data;
    },

    onSuccess: async (data) => {
      // tell tanstack query that the data is stale and that it needs to be reached
      await queryClient.invalidateQueries({ queryKey: userKeys.profile });
      return data;
    },
    onError: (err) => {
      console.error("Profile update mutation failed:", err);
      throw err;
    },
  });
}
