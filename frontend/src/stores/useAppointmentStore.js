import { create } from "zustand";

const useAppointmentStore = create((set, get) => ({
  monthlyAppointments: [],

  setMonthlyAppointments: (appointments) => {
    // Ensure we only store the raw array of appointments
    set({ monthlyAppointments: appointments });
  },

  getAppointmentById: (id) => {
    const { monthlyAppointments } = get(); // Get the current state

    return monthlyAppointments.find((appt) => String(appt.id) === String(id));
  },
}));

export default useAppointmentStore;
