const languages = {
  en: {
    // General errs
    general_server_err: "An unexpected error occurred on the server",
    conflict_server_err: "There was a conflict with your request",
    request_server_err: "The request was not found",
    authenticate_err: "You must be logged in to access this page",
    authorization_err: "You don't have permission to perform this action",
    authenticate_code_err: "Invalid code, please try again",
    general_validator_err:
      "Error with the provided data. Please check the details",

    // Refresh token errs
    refresh_token_session_expired: "Session expired token not found",
    refresh_token_stale_or_invalid:
      "Authenticate token is stale or invalid. Please login again.",
    refresh_token_user_not_found: "User associated with token not found",

    // JWT general errs
    jwt_invalid_or_expired: "JWT token is expired or it is invalid",

    // Validation errs
    // Sign-up errs
    validator_email_invalid: "Please provide a valid email address",
    validator_password_required: "Password is required",
    validator_confirm_password: "Confirm Password doesn't match",
    validator_password_min: "Password must contain at least six characters",
    validator_first_name: "First Name is required",
    validator_last_name: "Last Name is required",
    validator_email_password_incorrect: "Login credentials are incorrect",
    validator_email: "User already exists",

    // Change password errs
    validator_old_password_no_match: "Password is incorrect",

    // Appointment errs
    validator_appointment_title: "Appointment title is required",
    validator_appointment_startDateTime_not_empty:
      "Appointment time is required",
    validator_appointment_startDateTime_not_in_future:
      "Appointment time must be in the future",
    validator_appointment_endDateTime_not_in_past:
      "Appointment time cannot be in the past",
    validator_appointment_duration_invalid: "Appointment time is invalid",
    validator_appointment_userId_required:
      "The client ID (userId) is required to book the appointment",
    validator_appointment_userId_invalid:
      "Provided client ID (userId) is invalid",
    validator_appointment_status_invalid: "Appointment status is invalid",
    validator_appointment_status_not_empty: "Appointment status is required",
    validator_external_client_userId_not_allowed:
      "Provided client ID can't be present if the external client is already defined",

    // Avatar upload
    validator_public_id_avatar: "Public ID is required",

    // Notes errs
    validator_notes_title: "Note title is required",
    validator_notes_content: "Note content is required",

    // Success messages

    // User Controller
    success_sign_up: "User successfully registered",
    success_sign_in: "User successfully logged in",
    profile_update_no_values_provided:
      "No valid fields were provided for update. Profile remains unchanged",

    // Invitation Controller
    success_invitation_link: "Invitation link generated successfully",
    success_invitation_verification_code_sent:
      "Invitation verification code successfully sent. Please check your email",
    success_invitation_verification_code:
      "Invitation code verified successfully",
    success_invitation_verification_code_resend:
      "Invitation code resented successfully",
    success_invitation_and_code_already_verified:
      "Invitation and the code has already been verified",

    // Admin Controller
    // appointments
    appointment_created_notification_title: "Appointment Confirmed!",
    appointment_created_notification_body: "Your appointment is scheduled for ",
    appointment_created_notification_message:
      "New appointment created with ID ",
    appointment_updated_notification_message:
      "New appointment updated with ID ",
    appointment_updated_notification_body:
      "Your appointment is rescheduled for ",
    appointment_updated_notification_title: "Appointment Updated!",
  },

  sr: {
    // General errs
    general_server_err: "Došlo je do neočekivane greške na serveru",
    conflict_server_err: "Došlo je do konflikta sa vašim zapisom",
    request_server_err: "Traženi zapis nije pronađen",
    authenticate_err:
      "Morate biti prijavljeni da bi ste mogli pristupiti ovoj stranici",
    authorization_err: "Nemate dozvolu za izvršenje ove radnje",
    authenticate_code_err: "Nepostojeći kod, molimm vas probajte ponovo",
    general_validator_err: "Greška u podacima. Proverite detalje",

    // Refresh token errs
    refresh_token_session_expired: "Sesija je istekla. Token nije pronađen",
    refresh_token_stale_or_invalid:
      "Token je ustajao ili nije validan. Molimo Vas prijavite se ponovo",
    refresh_token_user_not_found: "Korisnik čije je token nije pronađen",

    // JWT general errs
    jwt_invalid_or_expired: "JWT Token je nevažeći ili je istekao",

    // Validation errs
    // Sign-up errs
    validator_email_invalid: "Molimo vas da unesete ispravnu email adresu",
    validator_password_required: "Lozinka je obavezna",
    validator_confirm_password: "Potvrda Lozinke se ne pododura",
    validator_password_min: "Lozinka mora sadržati minimum šest karaktera",
    validator_first_name: "Ime je obavezno",
    validator_last_name: "Prezime je obavezno",
    validator_email_password_incorrect: "Email ili Lozinka nisu tačni",
    validator_email: "Korisnik već postoji",

    // Change password errs
    validator_old_password_no_match: "Lozinka nije tacna",

    // Appointment errs
    validator_appointment_title: "Naziv termina je obavezan",
    validator_appointment_startDateTime_not_empty: "Termin je obavezan",
    validator_appointment_startDateTime_not_in_future:
      "Vreme početka termina mora biti u budućnosti",
    validator_appointment_endDateTime_not_in_past:
      "Vreme završetka termina ne može biti u prošlosti",
    validator_appointment_duration_invalid: "Vreme termina nije ispravno",
    validator_appointment_userId_required:
      "ID klijenta (userId) je obavezan za zakazivanje termina",
    validator_appointment_userId_invalid:
      "Dati ID klijenta (userId) nije ispravan",
    validator_appointment_status_invalid: "Status termina nije ispravan",
    validator_appointment_status_not_empty: "Status termina je obavezan",
    validator_external_client_userId_not_allowed:
      "ID klijenta ne može biti prisutan, ako je eksterni klijent zadat",

    // Avatar upload
    validator_public_id_avatar: "ID avatara je obavezan",

    // Notes errs
    validator_notes_title: "Naziv beleške je obavezan",
    validator_notes_content: "Sadržaj beleške je obavezan",

    // Success messages

    // User Controller
    success_sign_up: "Korisnik je uspešno registrovan",
    success_sign_in: "Korisnik je uspešno prijavljen",
    profile_update_no_values_provided:
      "Nije uneto nijedno važeće polje za ažuriranje. Profil ostaje nepromenjen",

    // Invitation Controller
    success_invitation_link: "Link sa pozivnicom uspešno generisan",
    success_invitation_verification_code_sent:
      "Verifikacioni kod za pozvnicu uspešno poslat. Molimo vas proverite vaš mejl",
    success_invitation_verification_code:
      "Verifikacioni kod uspešno verifikovan",
    success_invitation_verification_code_resend: "Kod uspešno reizdat",
    success_invitation_and_code_already_verified:
      "Pozivnica i verifikacioni kod su već verifikovani",

    // Admin Controller
    // appointments
    appointment_created_notification_title: "Termin Potvrđen!",
    appointment_created_notification_body: "Vaš termin je zakazan za  ",
    appointment_created_notification_message: "Novi termin kreiran sa ID ",
  },
};

const getLocalizedNotificationText = (language, type) => {
  // check the type of the notification
  if (type === "appoitment_new") {
    const notificationKeys = {
      title: "appointment_created_notification_title:",
      body: "appointment_created_notification_body",
      message: "appointment_created_notification_message",
    };
    const resolvedLanguage = languages[language];

    return {
      title: resolvedLanguage[notificationKeys.title],
      body: resolvedLanguage[notificationKeys.body],
      message: resolvedLanguage[notificationKeys.message],
    };
  }
  if (type === "appoitment_update") {
    const notificationKeys = {
      title: "appointment_updated_notification_title:",
      body: "appointment_updated_notification_body",
      message: "appointment_updated_notification_message",
    };
    const resolvedLanguage = languages[language];

    return {
      title: resolvedLanguage[notificationKeys.title],
      body: resolvedLanguage[notificationKeys.body],
      message: resolvedLanguage[notificationKeys.message],
    };
  }
  return;
};
module.exports = {
  languages,
  getLocalizedNotificationText,
};
