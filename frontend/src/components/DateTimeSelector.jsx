import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import React, { useState } from "react";
import {
  Platform,
  TouchableOpacity,
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback, // For tapping outside to dismiss
} from "react-native";
import AppText from "./AppText";
import { theme } from "../theme";
import { useTranslation } from "../hooks/useTranslation";

export default function DateTimeSelector({
  startDateTime, // The current Date object value from Formik
  onDateTimeChange, // The callback function to update Formik state
}) {
  const { t } = useTranslation();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // helper to check for valid date (prevents errs)
  const isDateValid = startDateTime && !isNaN(startDateTime.getTime());

  // enforces no past date/time selection in the UI
  const minimumDate = new Date();

  const onNativeChange = (event, selectedDate) => {
    // check the event type to ignore cancellation/dismissal actions
    if (event.type === "dismissed") {
      return;
    }

    // process the date only if a valid date was selected
    if (selectedDate) {
      onDateTimeChange(selectedDate);
    }
  };

  // handles the logic for closing the modal when tapping the backdrop
  const handleModalClose = () => {
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={styles.pickerButton}
      >
        <AppText style={styles.pickerText}>
          {format(startDateTime, "dd. MMMM yyyy")}
        </AppText>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setShowTimePicker(true)}
        style={styles.pickerButton}
        // disable time selection until a valid date has been set
        disabled={!isDateValid}
      >
        <AppText style={styles.pickerText}>
          {format(startDateTime, "HH:mm")}
        </AppText>
      </TouchableOpacity>

      {Platform.OS === "android" && showDatePicker && (
        <DateTimePicker
          value={startDateTime}
          mode="date"
          minimumDate={minimumDate}
          display="default"
          onChange={onNativeChange}
        />
      )}

      {Platform.OS === "android" && showTimePicker && (
        <DateTimePicker
          value={startDateTime}
          mode="time"
          minimumDate={minimumDate}
          is24Hour={true}
          locale={"en-GB"}
          display="default"
          onChange={onNativeChange}
        />
      )}

      {Platform.OS === "ios" && (showDatePicker || showTimePicker) && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={true}
          onRequestClose={handleModalClose}
        >
          <TouchableWithoutFeedback onPress={handleModalClose}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                {showDatePicker && (
                  <DateTimePicker
                    value={startDateTime}
                    mode="date"
                    minimumDate={minimumDate}
                    display="inline"
                    onChange={onNativeChange}
                    accentColor={theme.colorDarkPink}
                  />
                )}

                {showTimePicker && (
                  <DateTimePicker
                    value={startDateTime}
                    mode="time"
                    minimumDate={minimumDate}
                    is24Hour={true}
                    locale={"en-GB"}
                    display="spinner"
                    onChange={onNativeChange}
                  />
                )}

                <TouchableOpacity
                  onPress={handleModalClose}
                  style={styles.closeButton}
                >
                  <AppText style={styles.closeButtonText}>
                    {t("appointmentCloseBtn")}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  pickerButton: {
    shadowColor: theme.colorLightGrey,
    color: theme.colorBlack,
    backgroundColor: theme.colorWhite,
    borderRadius: 6,
    padding: 20,
    marginBottom: 10,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  pickerText: {},

  // Modal Styles
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: theme.colorDarkPink,
    borderRadius: 5,
  },
  closeButtonText: {
    fontWeight: "bold",
    color: theme.colorWhite,
  },
});
