import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { appointmentKeys } from "../utils/queryKeys";
import { socket } from "../utils/socket";

export const useSocketAppointmentListener = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleAppointmentData = (data) => {
      const newAppointment = data.appointment;

      if (!newAppointment || !newAppointment.id) return; // Guard clause

      // invalidate the list query to trigger a background refetch
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.list(),
      });

      //  update the single-appointment detail query (guaranteed instant update)
      queryClient.setQueryData(
        appointmentKeys.detail(newAppointment.id),
        newAppointment
      );

      // update the un-filtered list cache for instant display
      // This is necessary if you need the list to update instantly without waiting for refetch.
      queryClient.setQueryData(appointmentKeys.list(), (oldData) => {
        // If no existing data, just return an array with the new appointment
        if (!oldData || !Array.isArray(oldData)) {
          return [newAppointment];
        }

        const isExisting = oldData.some(
          (appt) => appt.id === newAppointment.id
        );

        if (isExisting) {
          // if it exists map and replace the old version with the new one
          return oldData.map((appt) =>
            appt.id === newAppointment.id ? newAppointment : appt
          );
        }

        // If it's a new item (less likely on an update event, but safe)
        // Prepend it to the list
        return [newAppointment, ...oldData];
      });
    };

    socket.on("appointment:created", handleAppointmentData);

    return () => {
      socket.off("appointment:created", handleAppointmentData);
    };
  }, [queryClient]);
  // ...
};
