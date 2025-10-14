import useAuthStore from "../stores/useAuthStore";
import { translations } from "../utils/translations";

const getTranslationKey = (lang) => {
  return translations[lang] || translations.sr;
};

export const useTranslation = () => {
  // access the language from zustand store
  const preferredLanguage = useAuthStore((state) => state.preferredLanguage);

  // get active translation key
  const tKey = getTranslationKey(preferredLanguage);
  console.log(tKey);

  const t = (key) => {
    return tKey[key] || key;
  };
  console.log(t, "hello");

  const setLanguage = useAuthStore((state) => state.setLanguage);

  return {
    t,
    setLanguage,
    currentLanguage: preferredLanguage,
  };
};
