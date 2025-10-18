import { format } from "date-fns";
import { enUS, srLatn } from "date-fns/locale";
import useAuthStore from "../stores/useAuthStore";

// month in serbian genitive
const genitiveMonthDates = [
  "Januara",
  "Februara",
  "Marta",
  "Aprila",
  "Maja",
  "Juna",
  "Jula",
  "Avgusta",
  "Septembra",
  "Oktobra",
  "Novembra",
  "Decembra",
];

// --- 3. Creating the Custom, Corrected Locale Object ---

// Create a new object by merging the base locale and overriding the month function
const srLatnCorrected = {
  ...srLatn, // Keep all other parts of the locale intact
  localize: {
    ...srLatn.localize, // Keep other localize functions
    // Override the month function to use the fixed genitive names
    month: (n) => genitiveMonthDates[n],
  },
};
console.log(srLatnCorrected);
export default function formatDate(date) {
  const { preferredLanguage } = useAuthStore.getState();
  const dateObj = new Date(date);
  let formattedDate;
  if (preferredLanguage === "sr") {
    formattedDate = format(dateObj, "PPP", { locale: enUS });
  }
  if (preferredLanguage === "en") {
    formattedDate = format(dateObj, "PPP", { locale: srLatnCorrected });
  }
  return formattedDate;
}
