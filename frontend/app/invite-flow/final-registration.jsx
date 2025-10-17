import { View, StyleSheet, ScrollView, StatusBar } from "react-native";
import Logo from "../../assets/logo.svg";
import AppButton from "../../src/components/AppButton";
import AppTextInput from "../../src/components/AppTextInput";
import AppText, { AppTextStyle } from "../../src/components/AppText";
import { theme } from "../../src/theme";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useTranslation } from "../../src/hooks/useTranslation";
import useAuthStore from "../../src/stores/useAuthStore";
import * as Yup from "yup";
import { Formik } from "formik";
import usePostSignUp from "../../src/hooks/usePostSignUp";
import DropdownSelect from "react-native-input-select";
import { SafeAreaView } from "react-native-safe-area-context";

// yup schema validator

export default function SignIn() {
  const { t, currentLanguage } = useTranslation();
  const { invitationEmail, setLanguage } = useAuthStore.getState();

  const { mutate, isPending, error } = usePostSignUp();

  const validationSchema = Yup.object({
    first_name: Yup.string().min(1).required(t("firstNameRequiredSignUp")),
    last_name: Yup.string().min(1).required(t("lastNameRequiredSignUp")),
    password: Yup.string()
      .min(8, t("passwordRequiredMinLengthSignUp"))
      .matches(/[A-Z]/, t("passwordRequiredUpperCaseSignUp"))
      .matches(/[a-z]/, t("passwordRequiredLowerCaseSignUp"))
      .matches(/\d/, t("passwordRequiredNumberSignUp"))
      .matches(/[!@#$%^&*]/, t("passwordRequiredSymbolSignUp"))
      .required(t("passwordRequiredSignUp")),
    confirm_password: Yup.string()
      .oneOf([Yup.ref("password"), null], t("confirmPasswordMatchSignUp"))
      .required(t("confirmPasswordRequiredSignUp")),
    preferred_language: Yup.string().required(t("languageRequiredSignUp")),
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        style={styles.container}
        keyboardShouldPersistTaps={"handled"}
      >
        <StatusBar barStyle="dark-content" />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Formik
            validationSchema={validationSchema}
            initialValues={{
              first_name: "",
              last_name: "",
              email: invitationEmail,
              password: "",
              confirm_password: "",
              preferred_language: "",
            }}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
              const { ...payload } = values;

              setSubmitting(true);

              mutate(payload, {
                onSuccess: (data) => {
                  // :TODO:
                  // display toast message on success
                  console.log("Sign-up and login successful!");
                },
                onError: (err) => {
                  console.error("Sign-up failed with error:", err);
                  // :TODO:
                },
                onSettled: () => {
                  setSubmitting(false);
                },
              });
            }}
          >
            {({
              setFieldValue,
              isSubmitting,
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.inputContainer}>
                <AppText style={[AppTextStyle.h1, styles.logoHeading]}>
                  {t("signUpHeading")}
                </AppText>
                <AppTextInput
                  value={invitationEmail}
                  editable={false}
                  style={styles.disabledInput}
                ></AppTextInput>
                <AppTextInput
                  placeholder={t("firstNamePlaceholder")}
                  style={[
                    styles.input,
                    touched.first_name && errors.first_name
                      ? styles.errorInputBorder
                      : null,
                  ]}
                  placeholderTextColor={
                    touched.first_name && errors.first_name
                      ? theme.colorBlack
                      : theme.colorLightGrey
                  }
                  keyboardType={"default"}
                  autoCapitalize="none"
                  onChangeText={handleChange("first_name")}
                  onBlur={handleBlur("first_name")}
                  value={values.first_name}
                ></AppTextInput>
                <AppTextInput
                  placeholder={t("lastNamePlaceholder")}
                  style={[
                    styles.input,
                    touched.last_name && errors.last_name
                      ? styles.errorInputBorder
                      : null,
                  ]}
                  placeholderTextColor={
                    touched.last_name && errors.last_name
                      ? theme.colorBlack
                      : theme.colorLightGrey
                  }
                  keyboardType={"default"}
                  autoCapitalize="none"
                  onChangeText={handleChange("last_name")}
                  onBlur={handleBlur("last_name")}
                  value={values.last_name}
                ></AppTextInput>
                <AppTextInput
                  placeholder={t("passwordPlaceholder")}
                  style={[
                    styles.input,
                    touched.password && errors.password
                      ? styles.errorInputBorder
                      : null,
                  ]}
                  inputMode={"password"}
                  placeholderTextColor={
                    touched.password && errors.password
                      ? theme.colorBlack
                      : theme.colorLightGrey
                  }
                  secureTextEntry={true}
                  autoCapitalize="none"
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  textContentType={"oneTimeCode"}
                  value={values.password}
                ></AppTextInput>
                <AppTextInput
                  placeholder={t("confirmPasswordPlaceholder")}
                  style={[
                    styles.input,
                    touched.confirm_password && errors.confirm_password
                      ? styles.errorInputBorder
                      : null,
                  ]}
                  inputMode={"password"}
                  placeholderTextColor={
                    touched.confirm_password && errors.confirm_password
                      ? theme.colorBlack
                      : theme.colorLightGrey
                  }
                  secureTextEntry={true}
                  autoCapitalize="none"
                  onChangeText={handleChange("confirm_password")}
                  onBlur={handleBlur("confirm_password")}
                  textContentType={"oneTimeCode"}
                  value={values.confirm_password}
                ></AppTextInput>
                <DropdownSelect
                  labelStyle={{ opacity: 0 }}
                  label={t("languageSelectLabel")}
                  placeholder={t("languageSelectPlaceholder")}
                  dropdownStyle={{ backgroundColor: "#fff", borderWidth: 0 }}
                  placeholderStyle={{ color: theme.colorLightGrey }}
                  selectedValue={values.preferred_language}
                  options={[
                    {
                      label: t("languageSelectLabelSerbian"),
                      value: "sr",
                    },
                    {
                      label: t("languageSelectLabelEnglish"),
                      value: "en",
                    },
                  ]}
                  onValueChange={(value) => {
                    setFieldValue("preferred_language", value);
                    setLanguage(value);
                  }}
                ></DropdownSelect>
                <View>
                  {touched.first_name && errors.first_name && (
                    <AppText style={styles.errorText}>
                      {errors.first_name}
                    </AppText>
                  )}
                  {touched.last_name && errors.last_name && (
                    <AppText style={styles.errorText}>
                      {errors.last_name}
                    </AppText>
                  )}
                  {touched.password && errors.password && (
                    <AppText style={styles.errorText}>
                      {errors.password}
                    </AppText>
                  )}
                  {touched.confirm_password && errors.confirm_password && (
                    <AppText style={styles.errorText}>
                      {errors.confirm_password}
                    </AppText>
                  )}
                  {touched.preferred_language && errors.preferred_language && (
                    <AppText style={styles.errorText}>
                      {errors.preferred_language}
                    </AppText>
                  )}
                </View>
                <AppButton
                  onPress={handleSubmit}
                  disabled={isSubmitting || isPending}
                >
                  {t("signUpButton")}
                </AppButton>
              </View>
            )}
          </Formik>

          <View style={styles.logoAndHeadingContainer}>
            <Logo width={300} height={300} />
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  logoAndHeadingContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  logoHeading: {
    fontSize: 24,
    fontFamily: "Inter-Bold",
  },
  inputContainer: {
    margin: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flex: 1,
    gap: 10,
  },
  errorText: {
    color: theme.colorRedError,
    fontSize: 12,
    marginTop: -5,
    marginBottom: 5,
  },
  disabledInput: {
    backgroundColor: "#E7E7E7",
  },
  errorInputBorder: {
    borderWidth: 1,
    borderColor: theme.colorRedError,
    backgroundColor: "#c25a5a",
  },
});
