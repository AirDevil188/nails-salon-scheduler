import { useLocalSearchParams, useNavigation } from "expo-router";
import useGetNoteDetails from "../../src/hooks/useGetNoteDetails";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RichEditor } from "react-native-pell-rich-editor";
import { useEffect, useRef, useState } from "react";
import { theme } from "../../src/theme";
import { AppointmentEditHeader } from "../../src/components/AppointmentHeaderEdit";

export default function NoteDetailsScreen() {
  const navigation = useNavigation();
  const { noteId } = useLocalSearchParams();
  const { data, isLoading } = useGetNoteDetails(noteId);
  const editorRef = useRef();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (data && navigation && noteId) {
      navigation.setOptions({
        title: data.title,
        headerRight: () => (
          <AppointmentEditHeader appointmentId={noteId} deleteEnable={true} />
        ),
      });
    }
  }, [data, navigation, noteId]);

  useEffect(() => {
    if (data?.content && isReady) {
      editorRef.current?.setContentHTML(data.content);
    }
  }, [data?.content, isReady]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colorDarkPink} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1 }}>
        {!isReady && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="small" color={theme.colorDarkPink} />
          </View>
        )}
        <View style={{ flex: 1 }} pointerEvents="none">
          <RichEditor
            ref={editorRef}
            useContainer={true}
            initialContentHTML={data?.content || ""}
            style={styles.editor}
            editorInitializedCallback={() => setIsReady(true)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF" },
  editor: { flex: 1, backgroundColor: "#FFF", paddingHorizontal: 10 },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    zIndex: 1,
  },
});
