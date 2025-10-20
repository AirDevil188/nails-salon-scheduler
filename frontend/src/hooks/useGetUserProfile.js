import { useQuery } from "@tanstack/react-query";
import api from "../utils/axiosInstance";
import { userKeys } from "../utils/queryKeys";

export default function useGetUserProfile() {
  return useQuery({
    queryKey: userKeys.profile,

    queryFn: async () => {
      try {
        const response = await api.get("/api/users/profile");
        return response.data;
      } catch (err) {
        console.log("Error inside a queryFn", err);
        throw err;
      }
    },
    staleTime: Infinity,
    cacheTim: 10 * 60 * 1000,
  });
}
