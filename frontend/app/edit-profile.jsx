import { View, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import AppTextInput from "../src/components/AppTextInput";
import * as Yup from "yup";
import { Formik } from "formik";
import { useTranslation } from "../src/hooks/useTranslation";
import DropdownSelect from "react-native-input-select";
import { theme } from "../src/theme";
import AppText from "../src/components/AppText";
import { useProfileStore } from "../src/stores/useProfileStore";
import useUpdateProfile from "../src/hooks/useUpdateProfile";
import useAuthStore from "../src/stores/useAuthStore";
import AppButton from "../src/components/AppButton";
export default function EditProfileScreen() {
  const { t, currentLanguage } = useTranslation();
  const { profileData } = useProfileStore.getState();
  const { mutate, isPending } = useUpdateProfile();

  const validationSchema = Yup.object({
    first_name: Yup.string()
      .nullable()
      .min(1, t("firstNameRequiredSignUp"))
      .optional(),
    last_name: Yup.string()
      .nullable()
      .min(1, t("lastNameRequiredSignUp"))
      .optional(),
    preferred_language: Yup.string()
      .nullable()
      .optional()
      .oneOf(["sr", "en"], t("languageInvalid")),
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={styles.container}
        keyboardShouldPersistTaps={"handled"}
      >
        <ScrollView style={styles.scrollContent}>
          <Formik
            validationSchema={validationSchema}
            initialValues={{
              first_name: profileData.first_name || "",
              last_name: profileData.last_name || "",
              preferred_language: profileData.preferredLanguage || "sr",
            }}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
              const { ...payload } = values;

              setSubmitting(true);

              mutate(payload, {
                onSuccess: (data) => {
                  const profile = data.profile || data;

                  const { setLanguage } = useAuthStore.getState();
                  setLanguage(data.preferredLanguage);

                  router.back();

                  // :TODO: display toast message on success
                  console.log("Profile update successful! (UI Feedback)");
                },
                onError: (err) => {
                  console.error("Profile update failed with error:", err);
                  setSubmitting(false);
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
                <View style={styles.labelContainer}>
                  <AppText style={styles.labelText}>
                    {t("firstNameLabel")}
                  </AppText>
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
                </View>
                <View style={styles.labelContainer}>
                  <AppText style={styles.labelText}>
                    {t("lastNameLabel")}
                  </AppText>
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
                </View>
                <DropdownSelect
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
                  {t("editButtonProfileUpdate")}
                </AppButton>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    backgroundColor: "#c25a5a",
  },
  labelContainer: {
    gap: 10,
    color: "#9A9BA7",
  },
  labelText: {
    fontFamily: "Inter-Light",
    color: theme.colorLightGrey,
    fontSize: 13,
  },
});
