const languages = {
  en: {
    // General errs
    general_server_err: "An unexpected error occurred on the server",
    conflict_server_err: "There was a conflict with your request",
    request_server_err: "The request was not found",
    authenticate_err: "You must be logged in to access this page",
    authorization_err: "You don't have permission to perform this action",
    authenticate_code_err: "Invalid code, please try again",

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

    // Success messages

    // User Controller
    success_sign_up: "User successfully registered",
    success_sign_in: "User successfully logged in",

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
    validator_appointment_status_not_empty: "Status termina je obezan",

    // Success messages

    // User Controller
    success_sign_up: "Korisnik je uspešno registrovan",
    success_sign_in: "Korisnik je uspešno prijavljen",

    // Invitation Controller
    success_invitation_link: "Link sa pozivnicom uspešno generisan",
    success_invitation_verification_code_sent:
      "Verifikacioni kod za pozvnicu uspešno poslat. Molimo vas proverite vaš mejl",
    success_invitation_verification_code:
      "Verifikacioni kod uspešno verifikovan",
    success_invitation_verification_code_resend: "Kod uspešno reizdat",
    success_invitation_and_code_already_verified:
      "Pozivnica i verifikacioni kod su već verifikovani",
  },
};
module.exports = {
  languages,
};
