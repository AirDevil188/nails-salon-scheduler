import { create } from "zustand";

const useAuthStore = create((set) => ({
  // set the global state values
  accessToken: null,
  refreshToken: null,
  isLoggedIn: false,
  isLoading: false,

  // Signup flow
  invitationToken: null,
  isSigningUp: false,

  // ACTIONS
  setIsLoading: (loading) => set({ isLoading: loading }),

  startSignUp: (token) => {
    set({ isSigningUp: true, invitationToken: token });
  },

  login: (accessToken, refreshToken) => {
    set({
      isLoggedIn: true,
      accessToken: accessToken,
      refreshToken: refreshToken,
      isSigningUp: false,
      invitationToken: null,
    });
  },

  logout: () => {
    set({
      isLoggedIn: false,
      accessToken: null,
      referrerToken: null,
      isSigningUp: false,
      invitationToken: null,
    });
  },
}));

export default useAuthStore;
