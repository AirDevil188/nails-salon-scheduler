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

    // tabs navigation - main
    tabProfile: "Profile",
    tabCalendar: "Calendar",
    tabNotes: "Notes",
    tabNotifications: "Notifications",

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

    // appointment details
    appointmentDetailsTitle: "Title",
    appointmentDetailsStatus: "Status",
    appointmentDetailsStartDateTime: "Starting",
    appointmentDetailsEndDateTime: "Ending",
    appointmentDetailsUser: "Client",

    // appointment update
    appointmentModalUpdateTitle: "Update Appointment",
    appointmentStatusInvalid: "Appointment Status is invalid",
    appointmentUpdateBtn: "Update",

    // appointment delete
    appointmentAlert: "Are you sure that you want to delete the appointment?",

    // appointment creation
    appointmentModalTitle: "Schedule new appointment",
    appointmentDateTypeError: "Invalid date format",
    appointmentTitleRequired: "Appointment title is required",
    appointmentStartDateTimeRequired: "Appointment start date time is required",
    appointmentStartDateTimePast:
      "Appointment start time cannot be in the past. Please select a future time",
    appointmentDescriptionMax:
      "Appointment description cannot exceed 500 characters",
    appointmentOneClientRequired:
      "'An appointment must be linked to a registered user or include an external client name",

    appointmentTitleLabel: "Title",
    appointmentDescriptionLabel: "Description",
    appointmentStartDateLabel: "Start Date and Time",
    appointmentEndDateLabel: "End time",
    appointmentUserLabel: "Client",
    appointmentExternalClientLabel: "External Client",
    appointmentCloseBtn: "Close",
    appointmentScheduleBtn: "Schedule",
    selectUserPlaceholder: "Select the client",
    searchUserPlaceholder: "Search...",

    // Notes creation
    notesCreateHeaderTitle: "New note",
    notesTitlePlaceholder: "Note title",
    notesTextPlaceholder: "Content of the note...",
    notesType: "Type: ",
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

    // tabs navigation - main
    tabProfile: "Profil",
    tabCalendar: "Kalendar",
    tabNotes: "Beleške",
    tabNotifications: "Notifikacije",

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

    // appointment details
    appointmentDetailsTitle: "Naslov",
    appointmentDetailsStatus: "Status",
    appointmentDetailsStartDateTime: "Počinje",
    appointmentDetailsEndDateTime: "Završava",
    appointmentDetailsUser: "Klijent",

    // appointment update
    appointmentModalUpdateTitle: "Ažuriraj termin",
    appointmentStatusInvalid: "Status termina je nevažeći",
    appointmentUpdateBtn: "Ažuriraj",

    // appointment delete
    appointmentAlert: "Da li ste sigurni da želite da obrišete termin?",

    // appointment creation
    appointmentModalTitle: "Zakaži novi termin",
    appointmentDateTypeError: "Neispravan format datuma",
    appointmentTitleRequired: "Naziv termina je obavezan",
    appointmentStartDateTimeRequired: "Početak termina je obavezan",
    appointmentStartDateTimePast:
      " Početak termina ne može biti u prošlom vremenu. Molim Vas selektujte buduće vreme",
    appointmentDescriptionMax:
      "Opis termina ne može biti duži od 500 karaktera",
    appointmentOneClientRequired:
      "'Termin mora biti vezan za registrovanog korisnika ili mora sadržati eksterno ime klijenta.",

    appointmentTitleLabel: "Naslov",
    appointmentDescriptionLabel: "Opis",
    appointmentStartDateLabel: "Datum i Vreme",
    appointmentEndDateLabel: "Završetak",
    appointmentUserLabel: "Klijent",
    appointmentExternalClientLabel: "Eksterni Klijent",
    appointmentCloseBtn: "Zatvori",
    appointmentScheduleBtn: "Zakaži",
    selectUserPlaceholder: "Odaberi klijenta",
    searchUserPlaceholder: "Pretraži...",

    // Notes creation
    notesCreateHeaderTitle: "Nova beleška",
    notesTitlePlaceholder: "Naslov beleške",
    notesTextPlaceholder: "Sadržaj beleške...",
    notesType: "Tip: ",
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
