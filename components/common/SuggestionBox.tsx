import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type SuggestionItem = {
  id: string;
  name: string;
};

type SuggestionBoxProps = {
  title?: string;
  suggestions: SuggestionItem[];
  onAdd: (item: SuggestionItem) => void;
};

export default function SuggestionBox({
  title = "Suggestions",
  suggestions,
  onAdd,
}: SuggestionBoxProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{title}</Text>

      {suggestions.length === 0 ? (
        <Text style={styles.emptyText}>No suggestions yet.</Text>
      ) : (
        suggestions.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.itemText}>{item.name}</Text>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => onAdd(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#171A21",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#222733",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
  },
  itemText: {
    color: "#FFFFFF",
    fontSize: 15,
    flex: 1,
    paddingRight: 12,
  },
  addButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});