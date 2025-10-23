import { useQuery } from "@tanstack/react-query";
import api from "../utils/axiosInstance";
import { appointmentKeys } from "../utils/queryKeys";
import useAuthStore from "../stores/useAuthStore";
import { format } from "date-fns";

export default function useGetCalendarView(date, isListView) {
  const { userInfo } = useAuthStore.getState();
  const { role } = userInfo;
  const adminEndpoint = "/api/admin/appointments/calendar?";
  const userEndpoint = "/api/users/calendar?";

  return useQuery({
    queryKey: appointmentKeys.list({
      date: date,
      isListView: isListView ? true : false,
    }),
    queryFn: async () => {
      if (!date) {
        return [];
      }

      if (role === "admin") {
        const response = await api.get(adminEndpoint, {
          params: {
            date: date,
            view: "month",
          },
        });
        return response.data;
      } else {
        const response = await api.get(userEndpoint, {
          view: "month",
        });
        return response.data;
      }
    },
    enabled: !!date,
  });
}
