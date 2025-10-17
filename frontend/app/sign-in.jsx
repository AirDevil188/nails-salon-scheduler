import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Pressable,
} from "react-native";
import Logo from "../assets/logo.svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import AppButton from "../src/components/AppButton";
import AppTextInput from "../src/components/AppTextInput";
import AppText, { AppTextStyle } from "../src/components/AppText";
import { theme } from "../src/theme";
import { useTranslation } from "../src/hooks/useTranslation";
import { router } from "expo-router";
import * as Yup from "yup";
import { Formik } from "formik";
import usePostSignIn from "../src/hooks/usePostSignIn";

export default function SignIn() {
  const { t, currentLanguage } = useTranslation();

  const { mutate, isPending, error } = usePostSignIn();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email(t("emailFormatSignIn"))
      .required(t("emailRequiredSignIn")),
    password: Yup.string().required(t("passwordRequiredSignIn")),
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        style={styles.container}
        keyboardShouldPersistTaps={"handled"}
      >
        <Pressable
          style={{
            width: 48,
            height: 32,
            borderRadius: 10,
            backgroundColor: "#000",
          }}
          onLongPress={() => router.push(__DEV__ ? "/_sitemap" : "/")}
        />
        <StatusBar barStyle="dark-content" />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Formik
            validationSchema={validationSchema}
            initialValues={{ email: "", password: "" }}
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
                  {t("signInHeading")}
                </AppText>
                <AppTextInput
                  placeholder={t("emailPlaceholder")}
                  style={[
                    styles.input,
                    errors.email && touched.email
                      ? styles.errorInputBorder
                      : null,
                  ]}
                  placeholderTextColor={theme.colorLightGrey}
                  keyboardType={"email-address"}
                  autoCapitalize="none"
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
                ></AppTextInput>
                <AppTextInput
                  placeholder={t("passwordPlaceholder")}
                  style={[
                    styles.input,
                    errors.password && touched.password
                      ? styles.errorInputBorder
                      : null,
                  ]}
                  inputMode={"password"}
                  placeholderTextColor={theme.colorLightGrey}
                  secureTextEntry={true}
                  autoCapitalize="none"
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                ></AppTextInput>
                <View>
                  {touched.email && errors.email && (
                    <AppText style={styles.errorText}>{errors.email}</AppText>
                  )}
                  {touched.password && errors.password && (
                    <AppText style={styles.errorText}>
                      {errors.password}
                    </AppText>
                  )}
                </View>
                <AppButton
                  onPress={handleSubmit}
                  disabled={isSubmitting || isPending}
                >
                  {t("singInButton")}
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
  errorInputBorder: {
    borderWidth: 1,
    borderColor: theme.colorRedError,
    backgroundColor: theme.colorRedBorderError,
  },
});
