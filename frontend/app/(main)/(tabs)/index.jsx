import { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  ActivityIndicator,
  SectionList,
} from "react-native";
import { Calendar, CalendarProvider } from "react-native-calendars";
import { theme } from "../../../src/theme";
import { format, startOfMonth } from "date-fns";
import { setCalendarLocale } from "../../../src/utils/translations";
import useAuthStore from "../../../src/stores/useAuthStore";
import useGetCalendarView from "../../../src/hooks/useGetCalendarView";
import AppointmentCard from "../../../src/components/AppointmentCard";
import useLayoutStore from "../../../src/stores/useLayoutStore";
import formatDate from "../../../src/utils/formatDate";
import { useTranslation } from "../../../src/hooks/useTranslation";
import AppText from "../../../src/components/AppText";
import { srLatn } from "date-fns/locale";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import useAppointmentStore from "../../../src/stores/useAppointmentStore";
import React, { useEffect } from "react";

const CalendarView = () => {
  const router = useRouter();
  const { preferredLanguage } = useAuthStore.getState();
  const { t } = useTranslation();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(
    format(new Date(), "yyyy-MM-dd")
  );

  const isListView = useLayoutStore((state) => state.isListView);

  setCalendarLocale(preferredLanguage === "en" ? "en" : "sr");

  const calendarProviderTheme = useMemo(
    () => ({
      selectedDotColor: theme.colorDarkPink,
      todayTextColor: theme.colorDarkPink,
    }),
    []
  );

  const calendarComponentTheme = useMemo(
    () => ({
      todayTextColor: theme.colorBlue,
      selectedDotColor: theme.colorDarkPink,
      arrowColor: theme.colorDarkPink,
      selectedDayBackgroundColor: theme.colorDarkPink,
      monthTextColor: theme.colorDarkPink,
      dayTextColor: theme.colorDarkPink,
    }),
    []
  );

  const calendarDate = useMemo(() => {
    if (currentMonth instanceof Date && !isNaN(currentMonth)) {
      return format(currentMonth, "yyyy-MM-dd");
    }
    return format(new Date(), "yyyy-MM-dd");
  }, [currentMonth]);

  const { data: fetchedData, isLoading } = useGetCalendarView(
    calendarDate,
    true
  );

  const stableDataToProcess = fetchedData; // Use the raw fetchedData now

  const setMonthlyAppointments = useAppointmentStore(
    (state) => state.setMonthlyAppointments
  ); // Get setter

  // 💡 NEW: Push the data into Zustand when it successfully loads
  useEffect(() => {
    if (fetchedData?.appointments) {
      setMonthlyAppointments(fetchedData.appointments);
    }
  }, [fetchedData, setMonthlyAppointments]);

  function processMarkDates(data) {
    if (!data || !data.appointments || data.appointments.length === 0) {
      return {};
    }
    const markedDates = {};
    data.appointments.forEach((date) => {
      const dateKey = format(new Date(date.startDateTime), "yyyy-MM-dd");
      // check if the marked dates have the date key if not then we add the dots
      if (!markedDates[dateKey]) {
        markedDates[dateKey] = { dots: [] };
      }
      // the dots will be added only if the length is smaller than thgee
      if (markedDates[dateKey].dots.length < 3) {
        markedDates[dateKey].dots.push({
          key: date.appNumber,
          color:
            date.status === "scheduled" ? theme.scheduled : theme.completed,
          selectedDotColor: "white",
        });
      }
    });
    // Add selected day styling to the markedDates object
    if (markedDates[selectedDay]) {
      markedDates[selectedDay].selected = true;
      markedDates[selectedDay].selectedColor = theme.colorDarkPink;
    } else {
      // Handle case where selected day has no appointments
      markedDates[selectedDay] = {
        selected: true,
        selectedColor: theme.colorDarkPink,
      };
    }
    return markedDates;
  }

  function processAppointmentsForAgenda(data) {
    // This function returns data grouped by date (title: 'yyyy-MM-dd')
    if (!data || !data.appointments || data.appointments.length === 0)
      return [];

    const grouped = {};
    data.appointments.forEach((appt) => {
      const dateKey = format(new Date(appt.startDateTime), "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(appt);
    });
    return Object.keys(grouped).map((date) => ({
      title: date,
      data: grouped[date],
    }));
  }

  const calculatedMarkedDates = useMemo(() => {
    return processMarkDates(stableDataToProcess);
  }, [stableDataToProcess, selectedDay]);

  const renderAppointmentItem = ({ item }) => (
    <View style={styles.item}>
      <AppointmentCard item={item} />
    </View>
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <Text style={styles.sectionHeader}>
      {preferredLanguage === "sr"
        ? formatDate(title)
        : format(title, "MMM do, yyyy.")}
    </Text>
  );
  const flatAppointments = useMemo(() => {
    const agendaSections = processAppointmentsForAgenda(stableDataToProcess);

    if (!Array.isArray(agendaSections)) {
      return [];
    }

    if (!isListView) {
      const selectedDaySection = agendaSections.find(
        (section) => section.title === selectedDay
      );

      // Return the appointments for the selected day, or empty array
      return selectedDaySection ? selectedDaySection.data : [];
    }
    return agendaSections;
  }, [stableDataToProcess, selectedDay, isListView]);

  const handleMonthChange = useCallback(
    (month) => {
      const incomingDate = new Date(month.dateString);
      const monthStart = startOfMonth(incomingDate);

      setCurrentMonth(monthStart);
    },
    [setCurrentMonth]
  );

  const handleDayPress = useCallback((day) => {
    setSelectedDay(day.dateString);
    // If the month changes when a day is tapped, update currentMonth too
    const incomingDate = new Date(day.dateString);
    setCurrentMonth(incomingDate);
  }, []);

  const handleCardPress = useCallback(
    (item) => {
      return router.push(`/${item.id}`);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }) => {
      if (isLoading) {
        return (
          <View>
            <ActivityIndicator size="large" color={theme.colorDarkPink} />
          </View>
        );
      }
      return <AppointmentCard item={item} handleOnPress={handleCardPress} />;
    },
    [isLoading]
  );

  const appointmentKeyExtractor = useCallback((item) => {
    // Use the unique appNumber, converted to string for keyExtractor
    return String(item.appNumber);
  }, []);

  if (isListView) {
    return (
      <SectionList
        sections={flatAppointments}
        keyExtractor={(item, index) =>
          item.id ? String(item.id) : `idx-${index}`
        }
        renderItem={renderAppointmentItem}
        renderSectionHeader={renderSectionHeader}
        style={styles.container}
      />
    );
  }
  return (
    <CalendarProvider
      date={calendarDate}
      onMonthChange={handleMonthChange}
      theme={calendarProviderTheme}
    >
      <View style={styles.container}>
        <Calendar
          current={calendarDate}
          onDayPress={handleDayPress}
          onMonthChange={handleMonthChange}
          firstDay={1}
          markedDates={calculatedMarkedDates}
          markingType={"multi-dot"}
          theme={calendarComponentTheme}
        />
        <View style={styles.listSectionContainer}>
          {isLoading ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator
                size="large"
                color={theme.colorDarkPink}
                style={{ alignItems: "center" }}
              />
            </View>
          ) : (
            <FlatList
              data={flatAppointments}
              renderItem={renderItem}
              keyExtractor={appointmentKeyExtractor}
              contentContainerStyle={styles.listContent}
              style={styles.list}
              ListEmptyComponent={() => (
                <LinearGradient
                  style={styles.emptyContainer}
                  colors={theme.gradientCanceled}
                >
                  <AppText style={styles.emptyText}>
                    {preferredLanguage === "sr"
                      ? t("noAppointments") +
                        " " +
                        format(selectedDay, "MMM dd.", { locale: srLatn })
                      : t("noAppointments") +
                        " " +
                        format(selectedDay, "MMM do.")}
                  </AppText>
                </LinearGradient>
              )}
            />
          )}
        </View>
      </View>
    </CalendarProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listSectionContainer: {
    flex: 1,
  },
  list: { flex: 1 },
  listContent: { paddingTop: 10, paddingBottom: 20 },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: theme.colorLightGrey,
    marginHorizontal: 15,
    borderRadius: 8,
  },
  emptyText: {
    color: theme.colorDarkGrey,
    fontFamily: "Inter-Regular",
  },
  sectionHeader: {
    backgroundColor: theme.colorDarkPink,
    padding: 12,
    fontFamily: "Inter-Bold",
    color: theme.colorWhite,
  },
  loadingOverlay: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
});

export default CalendarView;
