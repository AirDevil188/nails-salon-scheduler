import React from "react"; // Already imported
import { View, StyleSheet } from "react-native"; // 👈 Ensure TextInput is imported if AppTextInput uses it
import AppTextInput from "./AppTextInput";

const SearchBar = React.forwardRef(
  ({ inputText, setInputText, onSubmitSearch }, ref) => {
    return (
      <View style={styles.searchBar}>
        <AppTextInput
          ref={ref}
          placeholder={"Search..."}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={onSubmitSearch}
          style={styles.searchInput}
        />
      </View>
    );
  }
);

SearchBar.displayName = "SearchBar";
export default SearchBar;

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  searchInput: {
    flex: 1,
    marginRight: 10,
    padding: 8,
  },
});
