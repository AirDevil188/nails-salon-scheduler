import { useQuery } from "@tanstack/react-query";
import api from "../utils/axiosInstance";

export default function useGetUserProfile() {
  return useQuery({
    queryKey: ["userProfile"],

    queryFn: async () => {
      try {
        const response = await api.get("/api/users/profile");
        console.log(response);
        return response.data;
      } catch (err) {
        const errors = err.response;
        console.log(err.response);
        console.log("Error inside a queryFn", err);
        throw err;
      }
    },
    staleTime: Infinity,
  });
}
