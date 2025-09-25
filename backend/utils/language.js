const languages = {
  en: {
    // General errs
    general_server_err: "An unexpected error occurred on the server",
    conflict_server_err: "There was a conflict with your request",
    request_server_err: "The request was not found",
    authenticate_err: "You must be logged in to access this page",
    authorization_err: "You don't have permission to perform this action",

    // Validation errs
    validator_email_invalid: "Please provide a valid email address",
    validator_password_required: "Password is required",
    validator_confirm_password: "Confirm Password doesn't match",
    validator_password_min: "Password must contain at least six characters",
    validator_first_name: "First Name is required",
    validator_last_name: "Last Name is required",
    validator_email_password_incorrect: "Login credentials are incorrect",
    validator_email: "User already exists",
  },

  sr: {
    // General errs
    general_server_err: "Došlo je do neočeivane greške na serveru",
    conflict_server_err: "Došlo je do konflikta sa vašim zapisom",
    request_server_err: "Traženi zapis nije pronađen",
    authenticate_err:
      "Morate biti prijavljeni da bi ste mogli pristupiti ovoj stranici",
    authorization_err: "Nemate dozvolu za izvršenje ove radnje",

    // Validation errs
    validator_email_invalid: "Molimo vas da unesete ispravnu email adresu",
    validator_password_required: "Lozinka je obavezna",
    validator_confirm_password: "Potvrda Lozinke se ne pododura",
    validator_password_min: "Lozinka mora sadržati minimum šest karaktera",
    validator_first_name: "Ime je obavezno",
    validator_last_name: "Prezime je obavezno",
    validator_email_password_incorrect: "Email ili Lozinka nisu tačni",
    validator_email: "Korisnik već postoji",
  },
};
module.exports = {
  languages,
};
