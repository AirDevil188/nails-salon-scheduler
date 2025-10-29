import { useRef, useState } from "react";
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
import useCreateNote from "../src/hooks/useCreateNote";
import { router } from "expo-router";
import { theme } from "../src/theme";

const NoteTypeSelector = ({ noteType, setNoteType }) => {
  const { t, currentLanguage } = useTranslation();
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

export default function NewNoteScreen() {
  const { mutate: createNote, isPending, isError, error } = useCreateNote();
  const { t, currentLanguage } = useTranslation();

  const richText = useRef();

  const [title, setTitle] = useState("");

  const [contentHTML, setContentHTML] = useState("");

  const [noteType, setNoteType] = useState("primary");

  // Function to handle saving the note
  const handleSaveNote = async () => {
    console.warn("success");
    //get final HTML content from the editor's internal state
    const finalContent = await richText.current?.getContentHtml();

    // :TODO: form validation
    if (!title.trim() || !finalContent?.trim()) {
      console.warn("Please provide a title and content for your note.");
      return;
    }
    const notePayload = {
      title: title.trim(),
      content: finalContent,
      type: noteType,
    };

    createNote(notePayload, {
      // clear note inputs
      onSuccess: () => {
        setTitle("");
        setContentHTML("");
        console.log("Note saved successfully, navigating back.");
        router.back();
      },

      onError: (err) => {
        console.error("Failed to save note:", err.message);
        // :TODO: errs backend
      },
    });
  };

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
          <TouchableOpacity onPress={handleSaveNote} style={styles.saveButton}>
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
            [actions.setParagraph]: ({}) => (
              <Text
                style={{
                  color: theme.colorWhite,
                  fontSize: 16,
                  fontWeight: "bold",
                  paddingHorizontal: 2,
                  fontFamily: "Inter-Regular",
                }}
              >
                P
              </Text>
            ),

            [actions.setBold]: ({}) => (
              <MaterialIcons
                name="format-bold"
                size={20}
                color={theme.colorWhite}
              />
            ),
            [actions.setItalic]: ({}) => (
              <MaterialIcons
                name="format-italic"
                size={20}
                color={theme.colorWhite}
              />
            ),
            [actions.setUnderline]: ({}) => (
              <MaterialIcons
                name="format-underlined"
                size={20}
                color={theme.colorWhite}
              />
            ),
            [actions.heading1]: ({}) => (
              <Text
                style={{
                  color: theme.colorWhite,
                  fontSize: 22,
                  fontWeight: "bold",
                  fontFamily: "Inter-Bold",
                }}
              >
                H1
              </Text>
            ),
            [actions.heading2]: ({}) => (
              <Text
                style={{
                  color: theme.colorWhite,
                  fontSize: 18,
                  fontWeight: "bold",
                  fontFamily: "Inter-Bold",
                }}
              >
                H2
              </Text>
            ),
            [actions.heading3]: ({}) => (
              <Text
                style={{
                  color: theme.colorWhite,
                  fontSize: 16,
                  fontWeight: "bold",
                  fontFamily: "Inter-Medium",
                }}
              >
                H3
              </Text>
            ),
            [actions.insertBulletsList]: ({}) => (
              <MaterialIcons
                name="format-list-bulleted"
                size={20}
                color={theme.colorWhite}
              />
            ),
            [actions.insertOrderedList]: ({}) => (
              <MaterialIcons
                name="format-list-numbered"
                size={20}
                color={theme.colorWhite}
              />
            ),
            [actions.insertLink]: ({}) => (
              <MaterialIcons name="link" size={20} color={theme.colorWhite} />
            ),
            [actions.removeFormat]: ({}) => (
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
          initialContentHTML={""}
          placeholder={t("notesTextPlaceholder")}
          onChange={setContentHTML}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 15,
  },
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
    maxHeight: "auto",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: theme.colorDarkPink,
    fontFamily: "Inter-Regular",
  },
});

// --- Separate Styles for note type selector ---

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
    shadowColor: "#000",
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
