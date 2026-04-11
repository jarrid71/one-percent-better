import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type ChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export default function Chip({ label, active, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#1f2937",
    marginRight: 8,
    marginBottom: 8,
  },

  chipActive: {
    backgroundColor: "#2563eb",
  },

  chipText: {
    color: "#d1d5db",
    fontSize: 13,
    fontWeight: "600",
  },

  chipTextActive: {
    color: "#ffffff",
  },
});