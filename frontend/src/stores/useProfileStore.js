import { create } from "zustand";

export const useProfileStore = create((set) => ({
  profileData: null,
  isLoading: false,
  error: null,
  setProfileData: (data) =>
    set({ profileData: data, isLoading: false, error: null }),

  updateProfile: (values) => {
    set((state) => ({
      profileData: {
        ...state.profileData,
        values,
      },
    }));
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error: error }),
}));
