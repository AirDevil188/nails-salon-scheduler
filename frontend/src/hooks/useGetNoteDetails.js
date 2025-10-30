import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../stores/useAuthStore";
import api from "../utils/axiosInstance";
import { noteKeys } from "../utils/queryKeys";

export default function useGetNoteDetails(id) {
  const { userInfo } = useAuthStore.getState();
  const { role } = userInfo;

  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: async () => {
      if (role === "admin") {
        const response = await api.get(`/api/admin/notes/${id}`);
        return response.data.note;
      } else {
        throw Error("You are not authorized to do this");
      }
    },
    enabled: !!id && !!role, // the query should run only if the id and role is available
  });
}
