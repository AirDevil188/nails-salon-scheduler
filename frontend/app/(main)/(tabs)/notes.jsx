import { useCallback, useEffect, useRef, useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import useGetNotes from "../../../src/hooks/useGetNotes";
import useDebounce from "../../../src/hooks/useDebaunce";
import SearchBar from "../../../src/components/SearchBar";
import { theme } from "../../../src/theme";
import { useTranslation } from "../../../src/hooks/useTranslation";
import AppText from "../../../src/components/AppText";

const {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} = require("react-native");

const getNoteColor = (type) => {
  if (!type) return theme.noteColors.primary;

  switch (type.toLowerCase()) {
    case "primary":
      return theme.noteColors.primary;
    case "secondary":
      return theme.noteColors.secondary;
    case "warning":
      return theme.noteColors.warning;
    case "critical":
      return theme.noteColors.critical;
    default:
      return theme.noteColors.primary;
  }
};

const formatDate = (createdAt, currentLanguage) => {
  if (!createdAt) return "N/A";

  const dateOptions = { month: "short", day: "numeric" };

  if (currentLanguage === "sr") {
    return new Date(createdAt).toLocaleDateString("sr-Latn", dateOptions);
  }

  return new Date(createdAt).toLocaleDateString("en-US", dateOptions);
};

const decodeHtmlEntities = (text) => {
  if (!text) return "";

  return (
    text
      // Replace <br>, <p>, <div> etc. with line breaks or spaces
      .replace(/<\/(p|div|h[1-6]|li|ul|ol)>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]*>/g, " ") // remove remaining tags
      // Decode HTML entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Collapse multiple spaces or newlines
      .replace(/\s+/g, " ")
      .trim()
  );
};

const NoteCard = ({ note, onPress }) => {
  const { currentLanguage, t } = useTranslation();
  const { title, content, type, createdAt } = note;
  const accentColor = getNoteColor(type);
  const formattedDate = createdAt
    ? formatDate(createdAt, currentLanguage)
    : "N/A";

  const cleanContent = decodeHtmlEntities(
    content || "No content preview available."
  );
  const contentPreview = cleanContent.substring(0, 80) + "...";

  return (
    <TouchableOpacity
      onPress={() => onPress(note.id)}
      style={[
        noteCardStyles.cardContainer,
        { borderColor: theme.colorDarkPink },
      ]}
      activeOpacity={0.8}
    >
      <View
        style={[
          noteCardStyles.accentBar,
          { backgroundColor: theme.colorDarkPink },
        ]}
      />

      <View style={noteCardStyles.contentArea}>
        <AppText style={noteCardStyles.titleText} numberOfLines={1}>
          {title || "Untitled Note"}
        </AppText>
        <AppText style={noteCardStyles.contentText} numberOfLines={2}>
          {contentPreview}
        </AppText>

        <View style={noteCardStyles.footer}>
          <AppText style={noteCardStyles.dateText}>{formattedDate}</AppText>
          <View
            style={[noteCardStyles.typePill, { backgroundColor: accentColor }]}
          >
            <AppText style={noteCardStyles.typeText}>
              {type === "primary"
                ? t("notePrimaryLabel").toUpperCase()
                : type === "warning"
                  ? t("noteWarningLabel").toUpperCase()
                  : type === "critical"
                    ? t("noteCriticalLabel").toUpperCase()
                    : t("noteSecondaryLabel").toUpperCase()}
            </AppText>
          </View>
        </View>
      </View>

      <Link href={`/notes/${note.id}`} asChild>
        <TouchableOpacity style={noteCardStyles.editButton}>
          <AppText style={noteCardStyles.editButtonText}>{"→"}</AppText>
        </TouchableOpacity>
      </Link>
    </TouchableOpacity>
  );
};

const noteCardStyles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    backgroundColor: theme.colorWhite,
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    overflow: "hidden",
    elevation: 8,
    shadowColor: theme.colorBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5.46,
  },
  accentBar: { width: 6, height: "100%", borderRadius: 1 },
  contentArea: { flex: 1, padding: 15 },
  titleText: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.noteColorTextPrimary,
    marginBottom: 5,
  },
  contentText: {
    fontSize: 13,
    color: theme.colorLightGrey,
    marginBottom: 10,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  dateText: { fontSize: 11, color: theme.colorLightGrey },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  typeText: { fontSize: 10, fontWeight: "bold", color: theme.colorWhite },
  editButton: {
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colorDarkPink,
  },
  editButtonText: { fontSize: 24, color: theme.colorWhite },
});

export default function IndexScreen() {
  const { currentLanguage, t } = useTranslation();
  const [inputText, setInputText] = useState("");
  const debouncedSearchQuery = useDebounce(inputText, 800);
  const [orderBy, setOrderBy] = useState("createdAt_desc");
  const [activeField, activeDirection] = orderBy.split("_");

  const {
    data,
    isLoading,
    error,
    isFetchingNextPage,
    isPending,
    hasNextPage,
    fetchNextPage,
  } = useGetNotes(debouncedSearchQuery, orderBy);

  const allNotes = data?.pages?.flatMap((page) => page.notes) || [];

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const searchInputRef = useRef(null);
  const isSearching = isPending || isFetchingNextPage;

  useEffect(() => {
    if (inputText.length > 0 && !isSearching && searchInputRef.current) {
      const timer = setTimeout(() => {
        if (searchInputRef.current && searchInputRef.current.focus) {
          searchInputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [debouncedSearchQuery, isSearching, inputText]);

  const sortedNotes = [...allNotes].sort((a, b) => {
    const aValue = a[activeField];
    const bValue = b[activeField];

    if (aValue < bValue) return activeDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return activeDirection === "asc" ? 1 : -1;

    if (a.title < b.title) return -1;
    if (a.title > b.title) return 1;

    return 0;
  });

  const handleCardPress = (id) => {
    router.push(`/notes/${id}`);
  };

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={theme.colorDarkPink} />
          <AppText style={styles.footerLoaderText}>
            {t("loadingMoreNotes")}
          </AppText>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <SearchBar
          ref={searchInputRef}
          inputText={inputText}
          setInputText={setInputText}
          placeholder={t("searchBarPlaceholder")}
        />

        {isPending && allNotes.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colorDarkPink} />
          </View>
        ) : (
          <FlatList
            data={sortedNotes}
            keyExtractor={(item) => item.id || item.title}
            renderItem={({ item }) => (
              <NoteCard note={item} onPress={handleCardPress} />
            )}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            contentContainerStyle={styles.flatListContent}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <AppText style={styles.emptyText}>
                  {t("noNotesFoundSearch")}
                </AppText>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  container: { flex: 1 },
  flatListContent: { paddingVertical: 10 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colorLightGrey,
    textAlign: "center",
    marginBottom: 20,
  },

  footerLoader: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  footerLoaderText: {
    marginLeft: 10,
    fontSize: 14,
    color: theme.colorLightGrey,
  },
});
