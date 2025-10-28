import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../stores/useAuthStore";
import { appointmentKeys } from "../utils/queryKeys";
import api from "../utils/axiosInstance";

export default function useGetAppointmentDetails(id) {
  const { userInfo } = useAuthStore.getState();
  const { role } = userInfo;

  const adminEndpoint = `/api/admin/appointments/${id}`;
  const userEndpoint = `/api/appointments/${id}`;
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: async () => {
      if (role === "admin") {
        console.warn("TRUE");
        const response = await api.get(adminEndpoint);
        console.log(response);
        return response.data.appointment;
      } else {
        const response = await api.get(userEndpoint);
        return response.data.appointment;
      }
    },
    enabled: !!id && !!role, // the query should run only if the id and role is available
  });
}
