import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import AppText from "../src/components/AppText";
import { useTranslation } from "../src/hooks/useTranslation";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import * as Yup from "yup";
import { Formik } from "formik";
import useCreateNewAppointment from "../src/hooks/useCreateNewAppointment";
import { router } from "expo-router";
import { theme } from "../src/theme";
import AppTextInput from "../src/components/AppTextInput";
import DateTimeSelector from "../src/components/DateTimeSelector";
import { addMinutes } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import useGetUsers from "../src/hooks/useGetUsers";
import AppButton from "../src/components/AppButton";
import DropDownPicker from "react-native-dropdown-picker";

export default function NewAppointmentScreen() {
  const { t, currentLanguage } = useTranslation();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const { mutate, isPending } = useCreateNewAppointment();

  // destructure infinite query helpers
  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useGetUsers(searchQuery, "name_asc");

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    // only fetch if no search query is active AND there's a next page, AND we aren't already fetching.
    if (!searchQuery && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetching, fetchNextPage, searchQuery]);

  // Data mapping logic
  const allUsers = data?.pages.flatMap((page) => page.users) || [];
  const userOptions = useMemo(
    () =>
      allUsers.map((user) => ({
        label: user.first_name + " " + user.last_name,
        value: user.id,
      })),
    [allUsers]
  );

  const validationSchema = Yup.object({
    title: Yup.string().min(1).required(t("appointmentTitleRequired")),
    startDateTime: Yup.date()
      .required(t("appointmentStartDateTimeRequired"))
      .min(new Date(), t("appointmentStartDateTimePast")),

    description: Yup.string()
      .max(500, t("appointmentDescriptionMax"))
      .typeError(t("appointmentDateTypeError"))
      .optional()
      .nullable(),
    userId: Yup.string().nullable().optional(),
    external_client: Yup.string().nullable().optional(),
  }).test(
    "one-client-required",
    t("appointmentOneClientRequired"),
    function (values) {
      const { userId, external_client } = values;
      const hasUserId = !!userId;
      const hasExternalClient = !!external_client;

      const onlyOnePresent =
        (hasUserId && !hasExternalClient) || (!hasUserId && hasExternalClient);

      return onlyOnePresent;
    }
  );

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          Platform.OS === "android" ? "transparent" : theme.colorWhite
        }
        translucent={Platform.OS === "android"}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          style={styles.container}
          keyboardShouldPersistTaps={"handled"}
          enableAutomaticScroll={true}
        >
          <Formik
            validationSchema={validationSchema}
            initialValues={{
              title: "",
              description: "",
              userId: null,
              external_client: "",
              startDateTime: new Date(),
            }}
            onSubmit={async (values, { setSubmitting }) => {
              const payload = {
                ...values,
                userId: values.userId || null,
                external_client: values.external_client || null,
              };
              try {
                setSubmitting(true);
                mutate(payload, {
                  onSuccess: () => {
                    console.log("New appointment successfully created");
                    router.back();
                  },
                  onError: (error) => {
                    // :TODO: backend error handling
                    console.log(error);
                  },
                  onSettled: () => {
                    setSubmitting(false);
                  },
                });
              } catch (err) {
                console.log(err);
                setSubmitting(false);
              }
            }}
          >
            {({
              setFieldValue,
              isSubmitting,
              handleSubmit,
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
            }) => (
              <View style={styles.inputContainer}>
                <View style={styles.labelContainer}>
                  <AppText style={styles.labelText}>
                    {t("appointmentTitleLabel")}
                  </AppText>
                  <AppTextInput
                    style={[
                      styles.input,
                      touched.title && errors.title
                        ? styles.errorInputBorder
                        : null,
                    ]}
                    placeholderTextColor={
                      touched.first_name && errors.first_name
                        ? theme.colorBlack
                        : theme.colorLightGrey
                    }
                    placeholder={t("appointmentTitleLabel")}
                    onChangeText={handleChange("title")}
                    onBlur={handleBlur("title")}
                    value={values.title}
                  />

                  <AppText style={styles.labelText}>
                    {t("appointmentDescriptionLabel")}
                  </AppText>
                  <AppTextInput
                    style={[
                      styles.input,
                      touched.description && errors.description
                        ? styles.errorInputBorder
                        : null,
                    ]}
                    placeholderTextColor={
                      touched.description && errors.description
                        ? theme.colorBlack
                        : theme.colorLightGrey
                    }
                    placeholder={t("appointmentDescriptionLabel")}
                    onChangeText={handleChange("description")}
                    onBlur={handleBlur("description")}
                    value={values.description}
                  />

                  <AppText style={styles.labelText}>
                    {t("appointmentStartDateLabel")}
                  </AppText>
                  <DateTimeSelector
                    startDateTime={values.startDateTime}
                    onBlur={handleBlur("startDateTime")}
                    onDateTimeChange={(newStartTime) => {
                      const newEndTime = addMinutes(newStartTime, 45);
                      setFieldValue("startDateTime", newStartTime);
                      setFieldValue("endDateTime", newEndTime);
                    }}
                    error={errors.startDateTime}
                    touched={touched.startDateTime}
                    currentLanguage={currentLanguage}
                  />

                  {!values.external_client ? (
                    <>
                      <AppText style={styles.labelText}>
                        {t("appointmentUserLabel")}
                      </AppText>

                      {/* Secondary conditional: Show loading or DropDownPicker */}
                      {isLoading || (isFetching && !searchQuery) ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator
                            size="small"
                            color={theme.colorDarkGrey}
                          />
                          <AppText>
                            {t("loadingUsers") || "Učitavanje korisnika..."}
                          </AppText>
                        </View>
                      ) : (
                        <View style={styles.dropdownWrapper}>
                          <DropDownPicker
                            dropDownContainerStyle={
                              styles.dropDownContainerStyle
                            }
                            open={userDropdownOpen}
                            value={values.userId}
                            items={userOptions}
                            setOpen={setUserDropdownOpen}
                            setValue={(callback) => {
                              const newValue = callback(values.userId);
                              setFieldValue("userId", newValue);
                              setFieldValue("external_client", null);
                            }}
                            onBlur={handleBlur("userId")}
                            topBarContainerStyle={{
                              paddingTop:
                                Platform.OS === "android" ? insets.top : 0,
                              backgroundColor: theme.colorWhite,
                            }}
                            modalContentContainerStyle={
                              styles.modalContentContainer
                            }
                            searchable={true}
                            searchPlaceholder={t("searchUserPlaceholder")}
                            onChangeSearchText={(text) => setSearchQuery(text)}
                            listMode="MODAL"
                            zIndex={3000}
                            placeholder={t("selectUserPlaceholder")}
                            style={[
                              styles.dropdownStyle,
                              touched.userId && errors.userId
                                ? styles.errorInputBorder
                                : null,
                            ]}
                            searchContainerStyle={styles.searchContainerStyle}
                            searchTextInputStyle={styles.searchInputStyle}
                            modalAnimationType="fade"
                          />
                          {values.userId && (
                            <View style={styles.clearButtonContainer}>
                              <AppButton
                                style={styles.clearButton}
                                onPress={() => setFieldValue("userId", null)}
                              >
                                <AppText style={styles.clearButtonText}>
                                  ✕
                                </AppText>
                              </AppButton>
                            </View>
                          )}
                        </View>
                      )}
                    </>
                  ) : null}

                  {!values.userId ? (
                    <>
                      <AppText style={styles.labelText}>
                        {t("appointmentExternalClientLabel")}
                      </AppText>
                      <AppTextInput
                        style={[
                          styles.input,
                          touched.external_client && errors.external_client
                            ? styles.errorInputBorder
                            : null,
                        ]}
                        placeholderTextColor={
                          touched.external_client && errors.external_client
                            ? theme.colorBlack
                            : theme.colorLightGrey
                        }
                        placeholder={t("appointmentExternalClientLabel")}
                        onChangeText={(text) => {
                          setFieldValue("external_client", text);
                          // Clear registered user ID if typing an external client
                          if (text) setFieldValue("userId", null);
                        }}
                        onBlur={handleBlur("title")}
                        value={values.external_client}
                      />
                    </>
                  ) : null}
                  <View>
                    {touched.title && errors.title && (
                      <AppText style={styles.errorText}>{errors.title}</AppText>
                    )}
                    {touched.description && errors.description && (
                      <AppText style={styles.errorText}>
                        {errors.description}
                      </AppText>
                    )}
                    {touched.startDateTime && errors.startDateTime && (
                      <AppText style={styles.errorText}>
                        {errors.startDateTime}
                      </AppText>
                    )}
                    {touched.userId && errors.userId && (
                      <AppText style={styles.errorText}>
                        {errors.userId}
                      </AppText>
                    )}
                    {touched.external_client && errors.external_client && (
                      <AppText style={styles.errorText}>
                        {errors.external_client}
                      </AppText>
                    )}
                  </View>

                  <AppButton
                    onPress={handleSubmit}
                    disabled={isSubmitting || isPending}
                  >
                    {t("appointmentScheduleBtn")}
                  </AppButton>
                </View>
              </View>
            )}
          </Formik>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  inputContainer: {
    margin: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flex: 1,
    gap: 10,
  },
  labelContainer: {
    gap: 10,
    color: "#9A9BA7",
  },
  dropdownWrapper: {
    width: "85%",
    flexDirection: "row",
  },
  clearButtonContainer: {
    backgroundColor: "green",
    flex: 1,
  },
  labelText: {
    fontFamily: "Inter-Light",
    color: theme.colorLightGrey,
    fontSize: 13,
  },
  input: {
    minHeight: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: theme.colorDarkGrey,
    backgroundColor: theme.colorWhite,
  },
  dropdownStyle: {
    backgroundColor: theme.colorWhite,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    color: theme.colorDarkGrey,
    maxWidth: "95%",
  },

  dropDownContainerStyle: {
    backgroundColor: theme.colorWhite,
    borderColor: "#ccc",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 5,
  },

  modalContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flex: 1,
    backgroundColor: theme.colorWhite,
    zIndex: 3001,
  },
  searchContainerStyle: {
    borderBottomColor: "#ccc",
    padding: 10,
  },
  searchInputStyle: {
    borderColor: "#ccc",
    borderRadius: 5,
  },
  clearButton: {
    width: 40,
    height: 40,
    backgroundColor: theme.colorDarkPink,
    borderRadius: 8,
    paddingHorizontal: 0,
  },
  clearButtonText: {
    color: "#fff",
  },
  loadingContainer: {
    minHeight: 50,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: theme.colorWhite,
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
});
