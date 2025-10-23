import { LocaleConfig } from "react-native-calendars";

export const translations = {
  en: {
    // public routes
    // sign-in.jsx
    signInHeading: "Login to your account",
    emailPlaceholder: "Email",
    singInButton: "Sign In",

    // Validator msgs
    emailFormatSignIn: "Invalid email format",
    emailRequiredSignIn: "Email is required",
    passwordRequiredSignIn: "Password is required",

    // Invite Flow

    // [token].jsx
    spinnerText: "Verifying Token",

    //otp-input.jsx
    mainHeading: "Check your Email",
    informationText: "Enter the verification code sent to",
    codeText: "Didn't get a code?",
    resendLink: "resend",
    verifyInvitationButton: "Verify Invitation",

    // final-registration.jsx
    signUpHeading: "Register your account",
    firstNamePlaceholder: "First Name",
    lastNamePlaceholder: "Last Name",
    passwordPlaceholder: "Password",
    confirmPasswordPlaceholder: "Confirm Password",
    signUpButton: "Sign Up",
    languageSelectLabel: "Jezik",
    languageSelectLabelSerbian: "🇷🇸 Serbian ",
    languageSelectLabelEnglish: "🇬🇧 English",
    languageSelectPlaceholder: "Select language",

    // Validator msgs
    firstNameRequiredSignUp: "First Name is required",
    lastNameRequiredSignUp: "Last Name is required",
    passwordRequiredMinLengthSignUp: "Password must be at least 8 characters",
    passwordRequiredLowerCaseSignUp:
      "Password must contain at least one lowercase letter",
    passwordRequiredUpperCaseSignUp:
      "Password must contain at least one uppercase letter",
    passwordRequiredNumberSignUp: "Password must contain at least one number",
    passwordRequiredSymbolSignUp:
      "Password must contain at least one special character",
    passwordRequiredSignUp: "Password is required",
    passwordMinRequiredSignUp:
      "Your password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one symbol",
    confirmPasswordRequiredSignUp: "Confirm password is required",
    confirmPasswordMatchSignUp: "Passwords must match",
    languageRequiredSignUp: "Language is required",
    languageInvalid: "Language that you have selected is invalid",

    // profile.jsx
    createdPlaceholder: "Created at: ",
    rolePlaceholder: "Role",
    changePasswordPlaceholder: "Change password",
    logutPlaceholder: "Logout",
    logoutAlert: "Are you sure that you want to logout?",
    deleteProfilePlaceholder: "Delete account",
    deleteProfileAlert: "Are you sure that you want to delete your account?",

    // profile-edit.jsx
    firstNameLabel: "First Name",
    lastNameLabel: "Last Name",
    languageLabel: "Language",
    editButtonProfileUpdate: "Update",

    // alert general
    yesPlaceholder: "Yes",
    noPlaceholder: "Cancel",

    // appointment cards
    scheduleStatus: "Scheduled",
    completeStatus: "Completed",
    cancelStatus: "Canceled",
    noShowStatus: "No-Show",
    noAppointments: "No appointments scheduled for",
  },
  sr: {
    // public routes
    // sign-in.jsx
    signInHeading: "Prijavite se na svoj nalog",
    emailPlaceholder: "Mejl",
    singInButton: "Prijavi se",

    // Validator msgs
    emailFormatSignIn: "Neispravan format mejl adrese",
    emailRequiredSignIn: "Mejl je obavezan",
    passwordRequiredSignIn: "Lozinka je obavezna",

    // Invite Flow

    // [token].jsx
    spinnerText: "Verifikacija Tokena",

    //otp-input.jsx
    mainHeading: "Proverite vašu mejl adresu",
    informationText: "Unesite verifikacioni kod koji je poslat na",
    codeText: "Niste dobili kod?",
    resendLink: "pošalji ponovo",
    verifyInvitationButton: "Potvrdi Pozivnicu",

    // final-registration.jsx
    signUpHeading: "Registrujte svoj nalog",
    firstNamePlaceholder: "Ime",
    lastNamePlaceholder: "Prezime",
    passwordPlaceholder: "Lozinka",
    confirmPasswordPlaceholder: "Potvrdi lozinku",
    signUpButton: "Registruj se",
    languageSelectLabel: "Jezik",
    languageSelectLabelSerbian: "🇷🇸 Srpski",
    languageSelectLabelEnglish: "🇬🇧 Englekski",
    languageSelectPlaceholder: "Odaberite jezik",

    // Validator msgs
    firstNameRequiredSignUp: "Ime je obavezno",
    lastNameRequiredSignUp: "Prezime je obavezno",
    passwordRequiredMinLengthSignUp: "Lozinka mora imati najmanje 8 karaktera",
    passwordRequiredLowerCaseSignUp:
      "Lozinka mora sadržati najmanje jedno malo slovo",
    passwordRequiredUpperCaseSignUp:
      "Lozinka mora sadržati najmanje jedno veliko slovo",
    passwordRequiredNumberSignUp: "Lozinka mora sadržati najmanje jedan broj",
    passwordRequiredSymbolSignUp:
      "Lozinka mora sadržati najmanje jedan specijalni karakter",
    passwordRequiredSignUp: "Lozinka je obavezna",
    confirmPasswordRequiredSignUp: "Potvrda lozinke je obavezna",
    confirmPasswordMatchSignUp: "Lozinke se moraju podudarati",
    languageRequiredSignUp: "Jezik je obavezan",
    languageInvalid: "Jezik koji ste odabrali nije podržan",

    // profile.jsx
    createdPlaceholder: "Kreiran: ",
    rolePlaceholder: "Uloga",
    changePasswordPlaceholder: "Promena lozinke",
    logutPlaceholder: "Odjavi se",
    logoutAlert: "Da li ste sigurni da želite da se odjavite?",
    deleteProfilePlaceholder: "Obriši nalog",
    deleteProfileAlert: "Da li ste sigurni da želite da obrišete vaš nalog?",

    // profile-edit.jsx
    firstNameLabel: "Ime",
    lastNameLabel: "Prezime",
    languageLabel: "Jezik",
    editButtonProfileUpdate: "Ažuriraj",

    // alert general
    yesPlaceholder: "Da",
    noPlaceholder: "Otkaži",

    // appointment cards
    scheduleStatus: "Zakazan",
    completeStatus: "Završen",
    cancelStatus: "Otkazan",
    noShowStatus: "Nije došao",
    noAppointments: "Nema termina za",
  },
};
LocaleConfig.locales["sr"] = {
  monthNames: [
    "Januar",
    "Februar",
    "Mart",
    "April",
    "Maj",
    "Jun",
    "Jul",
    "Avgust",
    "Septembar",
    "Oktobar",
    "Novembar",
    "Decembar",
  ],
  monthNamesShort: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Maj",
    "Jun",
    "Jul",
    "Avg",
    "Sep",
    "Okt",
    "Nov",
    "Dec",
  ],
  dayNames: [
    "Nedelja",
    "Ponedeljak",
    "Utorak",
    "Sreda",
    "Četvrtak",
    "Petak",
    "Subota",
  ],
  dayNamesShort: ["Ned", "Pon", "Uto", "Sre", "Čet", "Pet", "Sub"],
  today: "Danas",
};

// 2. Define English (en) - For completeness and to ensure it's available
LocaleConfig.locales["en"] = {
  monthNames: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  monthNamesShort: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  dayNames: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  today: "Today",
};

export const setCalendarLocale = (locale = "en") => {
  LocaleConfig.defaultLocale = locale;
};
