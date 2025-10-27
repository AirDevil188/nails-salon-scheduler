import { create } from "zustand";

const useAppointmentStore = create((set, get) => ({
  monthlyAppointments: [],

  setMonthlyAppointments: (appointments) => {
    // Ensure we only store the raw array of appointments
    set({ monthlyAppointments: appointments });
  },
}));

export default useAppointmentStore;
