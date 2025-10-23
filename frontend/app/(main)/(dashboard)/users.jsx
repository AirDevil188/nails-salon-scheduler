import {
  StyleSheet,
  View,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppText, { AppTextStyle } from "../../../src/components/AppText";
import useGetUsers from "../../../src/hooks/useGetUsers";
import Entypo from "@expo/vector-icons/Entypo";
import { theme } from "../../../src/theme";
import formatDate from "../../../src/utils/formatDate";
import { useCallback, useEffect, useRef, useState } from "react";
import useDebounce from "../../../src/hooks/useDebaunce";
import SearchBar from "../../../src/components/SearchBar";

export default function IndexScreen() {
  const [inputText, setInputText] = useState("");
  const debouncedSearchQuery = useDebounce(inputText, 500);
  const [orderBy, setOrderBy] = useState("createdAt_desc");
  const [activeField, activeDirection] = orderBy.split("_");

  const searchInputRef = useRef(null);

  const {
    data,
    isFetched,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isError,
    isLoading,
  } = useGetUsers(debouncedSearchQuery, orderBy);

  // flat pages to combine them into one array
  const allUsers = data?.pages?.flatMap((page) => page.users) || [];
  // func to load more pages
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSortChange = (field, direction) => {
    setOrderBy(`${field}_${direction}`);
  };

  const isSearching = isLoading || isFetchingNextPage; // Use isFetchingNextPage for a clear signal

  useEffect(() => {
    // Only attempt to refocus if there's actual text
    // AND the query is NOT currently running (it has just completed).
    if (inputText.length > 0 && !isSearching && searchInputRef.current) {
      const timer = setTimeout(() => {
        // It's crucial to check the ref again inside the timeout
        // as the component might unmount between the timer start and end.
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [debouncedSearchQuery, isSearching, inputText]);

  const sortedUsers = [...allUsers].sort((a, b) => {
    const aValue = a[activeField];
    const bValue = b[activeField];

    if (aValue < bValue) {
      // Return 1 or -1 based on direction
      return activeDirection === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return activeDirection === "asc" ? 1 : -1;
    }

    // Fallback If primary field is equal sort by a stable secondary key
    if (a.first_name < b.first_name) return -1;
    if (a.first_name > b.first_name) return 1;

    return 0; // The two objects are identical for sorting purposes
  });

  const renderUserCard = useCallback(({ item: user }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeading}>
          <Image
            source={{
              uri: "https://res.cloudinary.com/ddxkbe6lh/v1760806079/nails_appointment_app/avatars/avatar_default_gehjeg.png",
            }}
            style={{ width: 100, height: 100 }}
          />
          <View style={{ flexGrow: 1 }}>
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <AppText style={[AppTextStyle.h3, styles.name]}>
                {user.first_name + " " + user.last_name}
              </AppText>
            </View>

            <AppText style={styles.email}>{user.email}</AppText>
            <Entypo
              name="dots-three-vertical"
              size={24}
              color="black"
              style={{
                flexDirection: "row",
                alignSelf: "flex-end",
              }}
            />
            <AppText>{formatDate(user.createdAt)}</AppText>
          </View>
        </View>
      </View>
    );
  }, []);

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={{ paddingVertical: 20 }}>
          <ActivityIndicator size="large" color={theme.colorBlue} />
        </View>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={theme.colorBlue} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return <AppText>Error loading users.</AppText>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <SearchBar
        ref={searchInputRef}
        inputText={inputText}
        setInputText={setInputText}
      />
      <View style={styles.sortContainer}>
        {/* 1. Sort by Name */}
        <TouchableOpacity
          onPress={() => handleSortChange("first_name", "asc")}
          style={styles.sortOption}
        >
          <AppText
            style={[
              styles.sortText,
              // Highlight the active option
              orderBy.startsWith("first_name") && { color: theme.colorBlue },
            ]}
          >
            Sort by Name ⬇
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSortChange("email", "desc")}
          style={styles.sortOption}
        >
          <AppText
            style={[
              styles.sortText,
              // Highlight the active option
              orderBy.startsWith("email") && { color: theme.colorBlue },
            ]}
          >
            Sort by Email ⬆
          </AppText>
        </TouchableOpacity>

        {/* 3. Sort by Date */}
        <TouchableOpacity
          onPress={() => handleSortChange("createdAt", "desc")}
          style={styles.sortOption}
        >
          <AppText
            style={[
              styles.sortText,
              // Highlight the active option
              orderBy.startsWith("createdAt") && { color: theme.colorBlue },
            ]}
          >
            Sort by Date
          </AppText>
        </TouchableOpacity>
      </View>
      <FlatList
        data={sortedUsers}
        key="user-list-view"
        renderItem={renderUserCard}
        keyExtractor={(user) => user.id.toString()}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponentStyle
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flexGrow: 1,
    marginTop: -50,
  },
  container: {
    flex: 1,
  },
  card: {
    flexGrow: 1,
    alignItems: "center",
    flexDirection: "row",
    borderBottomWidth: 0.2,
    padding: 12,
  },
  cardHeading: {
    flexDirection: "row",
  },
  name: {
    fontFamily: "Inter-Medium",
    paddingTop: 12,
  },
  email: {
    fontFamily: "Inter-Light",
    color: theme.colorLightGrey,
  },
  sortContainer: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 5,
    justifyContent: "space-around",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
    backgroundColor: theme.colorWhite,
  },
  sortOption: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sortText: {
    fontSize: 14,
    color: theme.colorLightGrey,
  },
});
