import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/axiosInstance";
import { noteKeys } from "../utils/queryKeys";

export default function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: noteKeys.new,

    mutationFn: async (payload) => {
      const { title, content, type } = payload;
      console.log(payload);

      const response = await api.post("/api/admin/notes/new", payload);

      console.log(response);

      return response.data;
    },
    onSuccess: async () => {
      // tell tanstack query that the data is stale and that it needs to be reloaded
      await queryClient.invalidateQueries({ queryKey: noteKeys.list() });
    },
    onError: (err) => {
      console.log(err);
    },
  });
}
