import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";
import { useTranslation } from "../src/hooks/useTranslation";
import { router, useLocalSearchParams } from "expo-router";
import { theme } from "../src/theme";
import useUpdateNote from "../src/hooks/useUpdateNote";
import useGetNoteDetails from "../src/hooks/useGetNoteDetails";

const NoteTypeSelector = ({ noteType, setNoteType }) => {
  const { t } = useTranslation();
  const types = ["primary", "secondary", "warning", "critical"];

  return (
    <View style={typeStyles.container}>
      <Text style={typeStyles.label}>{t("notesType")}</Text>
      {types.map((type) => (
        <TouchableOpacity
          key={type}
          onPress={() => setNoteType(type)}
          style={[
            typeStyles.button,
            { backgroundColor: theme.noteColors[type] },
            noteType === type && typeStyles.selectedButton,
          ]}
        >
          {noteType === type && (
            <MaterialIcons name="check" size={16} color="white" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function UpdateNoteScreen() {
  const { noteId } = useLocalSearchParams();
  const { t } = useTranslation();
  const { mutate: updateNote } = useUpdateNote();
  const { data: noteData, isLoading } = useGetNoteDetails(noteId);

  const richText = useRef();
  const [title, setTitle] = useState("");
  const [contentHTML, setContentHTML] = useState("");
  const [noteType, setNoteType] = useState("primary");

  useEffect(() => {
    if (noteData) {
      setTitle(noteData.title);
      setNoteType(noteData.type || "primary");
      setContentHTML(noteData.content || "");
      setTimeout(() => {
        richText.current?.setContentHTML(noteData.content || "");
      }, 100);
    }
  }, [noteData]);

  const handleUpdateNote = async () => {
    const finalContent = await richText.current?.getContentHtml();

    if (!title.trim() || !finalContent?.trim()) {
      console.warn("Please provide a title and content for your note.");
      return;
    }

    const updatedPayload = {
      id: noteId,
      title: title.trim(),
      content: finalContent,
      type: noteType,
    };

    updateNote(updatedPayload, {
      onSuccess: () => {
        router.back();
      },
      onError: (err) => {
        // :TODO: backend errs
        console.error(err);
      },
    });
  };

  if (isLoading) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView
        style={styles.container}
        enableOnAndroid={true}
        extraScrollHeight={100}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <TextInput
            style={styles.titleInput}
            placeholder={t("notesTitlePlaceholder")}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <TouchableOpacity
            onPress={handleUpdateNote}
            style={styles.saveButton}
          >
            <MaterialIcons name="done" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <NoteTypeSelector noteType={noteType} setNoteType={setNoteType} />

        <RichToolbar
          editor={richText}
          actions={[
            actions.heading1,
            actions.heading2,
            actions.heading3,
            actions.setParagraph,
            actions.setBold,
            actions.setItalic,
            actions.setUnderline,
            actions.insertBulletsList,
            actions.insertOrderedList,
            actions.insertLink,
            actions.removeFormat,
          ]}
          iconMap={{
            [actions.setParagraph]: () => (
              <Text style={toolbarTextStyle}>P</Text>
            ),
            [actions.setBold]: () => (
              <MaterialIcons
                name="format-bold"
                size={20}
                color={theme.colorWhite}
              />
            ),
            [actions.setItalic]: () => (
              <MaterialIcons
                name="format-italic"
                size={20}
                color={theme.colorWhite}
              />
            ),
            [actions.setUnderline]: () => (
              <MaterialIcons
                name="format-underlined"
                size={20}
                color={theme.colorWhite}
              />
            ),
            [actions.heading1]: () => (
              <Text style={[toolbarTextStyle, { fontSize: 22 }]}>H1</Text>
            ),
            [actions.heading2]: () => (
              <Text style={[toolbarTextStyle, { fontSize: 18 }]}>H2</Text>
            ),
            [actions.heading3]: () => (
              <Text style={[toolbarTextStyle, { fontSize: 16 }]}>H3</Text>
            ),
            [actions.insertBulletsList]: () => (
              <MaterialIcons
                name="format-list-bulleted"
                size={20}
                color={theme.colorWhite}
              />
            ),
            [actions.insertOrderedList]: () => (
              <MaterialIcons
                name="format-list-numbered"
                size={20}
                color={theme.colorWhite}
              />
            ),
            [actions.insertLink]: () => (
              <MaterialIcons name="link" size={20} color={theme.colorWhite} />
            ),
            [actions.removeFormat]: () => (
              <MaterialIcons
                name="format-clear"
                size={20}
                color={theme.colorWhite}
              />
            ),
          }}
          style={styles.toolbar}
        />

        <RichEditor
          ref={richText}
          style={styles.editor}
          initialContentHTML={contentHTML}
          placeholder={t("notesTextPlaceholder")}
          onChange={setContentHTML}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

// 🖋 Styles — identical to new note screen
const toolbarTextStyle = {
  color: theme.colorWhite,
  fontWeight: "bold",
  fontFamily: "Inter-Regular",
  paddingHorizontal: 2,
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colorWhite },
  container: { flex: 1 },
  contentContainer: { padding: 15 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  saveButton: {
    backgroundColor: theme.colorDarkPink,
    padding: 8,
    borderRadius: 5,
  },
  titleInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    color: theme.noteColorTextPrimary,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    marginBottom: 10,
    paddingVertical: 10,
    alignSelf: "center",
  },
  toolbar: {
    backgroundColor: theme.colorDarkPink,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderColor: theme.colorWhite,
    borderBottomWidth: 0,
    zIndex: 1,
  },
  editor: {
    minHeight: 400,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: theme.colorDarkPink,
    fontFamily: "Inter-Regular",
  },
});

const typeStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.noteColorTextPrimary,
    marginRight: 15,
  },
  button: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: theme.colorBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  selectedButton: {
    borderWidth: 3,
    borderColor: theme.colorDarkPink,
  },
});
