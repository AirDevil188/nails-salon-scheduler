import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import api from "../utils/axiosInstance";
import { appointmentKeys } from "../utils/queryKeys";

export default function useCreateNewAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: appointmentKeys.new,
    mutationFn: async (payload) => {
      const {
        title,
        description,
        userId,
        external_client,
        startDateTime,
        endDateTime,
      } = payload;

      const response = await api.post("api/admin/appointments/new", {
        title,
        description,
        userId,
        external_client,
        startDateTime,
        endDateTime,
      });
      return response.data;
    },
    onSuccess: async (data) => {
      // tell tanstack query that the data is stale and that it needs to be reached
      await queryClient.invalidateQueries({ queryKey: appointmentKeys.list() });
    },
  });
}
