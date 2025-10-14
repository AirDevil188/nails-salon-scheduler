import { create } from "zustand";
import * as Localization from "expo-localization";

const supportedLanguages = ["en", "sr", "hr"];
const resolveLanguage = () => {
  const locales = Localization.getLocales();
  const deviceCode = locales[0]?.languageCode;

  if (deviceCode && supportedLanguages.includes(deviceCode)) {
    return deviceCode;
  }

  return "sr";
};

const useAuthStore = create((set, get) => ({
  // set the global state values
  accessToken: null,
  refreshToken: null,
  isLoggedIn: false,
  isLoading: false,
  preferredLanguage: resolveLanguage(),
  userInfo: {},

  // Signup flow
  invitationToken: null,
  isSigningUp: false,

  // ACTIONS
  setIsLoading: (loading) => set({ isLoading: loading }),

  startSignUp: (token) => {
    set({ isSigningUp: true, invitationToken: token });
  },

  // language change user
  setLanguage: (newLang) => {
    if (supportedLanguages.includes(newLang)) {
      set({ preferredLanguage: newLang });
    }
  },

  login: (accessToken, refreshToken, userInfo) => {
    const preferredLanguageDB = userInfo.preferredLanguage;

    userInfo.preferredLanguage = preferredLanguageDB || get().preferredLanguage;

    set({
      isLoggedIn: true,
      preferredLanguage: preferredLanguageDB || get().preferredLanguage,
      accessToken: accessToken,
      refreshToken: refreshToken,
      isSigningUp: false,
      invitationToken: null,
      userInfo: userInfo,
    });
  },

  logout: () => {
    set({
      isLoggedIn: false,
      accessToken: null,
      referrerToken: null,
      isSigningUp: false,
      invitationToken: null,
      userInfo: {},
      preferredLanguage: resolveLanguage(),
    });
  },
}));

export default useAuthStore;
