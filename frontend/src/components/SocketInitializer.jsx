import { useAdminSocketListener } from "../hooks/useAdminSocketListener";
import { useSocketAppointmentListener } from "../hooks/useSocketAppointmentListener";
import { useSocketProfileLister } from "../hooks/useSocketProfileListener";
import useAuthStore from "../stores/useAuthStore";

const SocketInitializer = () => {
  const userRole = useAuthStore((state) => state.userInfo?.role);
  const isAdmin = userRole === "admin";

  useSocketProfileLister();

  useAdminSocketListener(isAdmin);
  useSocketAppointmentListener(!isAdmin);

  return null;
};

export default SocketInitializer;
