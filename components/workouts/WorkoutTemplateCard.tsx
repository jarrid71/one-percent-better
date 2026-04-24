import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "@/context/ThemeContext";

type WorkoutTemplate = {
  id: string;
  weekday: string;
  workoutName: string;
  duration: string;
  exercises: {
    id: string;
    name: string;
    sets: string;
    reps: string;
    weight: string;
    pregnancySafe?: boolean;
    lowImpact?: boolean;
  }[];
};

type WorkoutTemplateCardProps = {
  template: WorkoutTemplate;
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isSelected?: boolean;
};

export default function WorkoutTemplateCard({
  template,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  isSelected = false,
}: WorkoutTemplateCardProps) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onSelect}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text
          style={[styles.weekday, { color: colors.primary }]}
          numberOfLines={2}
        >
          {template.weekday || "No day set"}
        </Text>

        <Text style={[styles.duration, { color: colors.textSecondary }]}>
          {template.duration} min
        </Text>
      </View>

      <Text style={[styles.workoutName, { color: colors.text }]}>
        {template.workoutName}
      </Text>

      <Text style={[styles.exerciseCount, { color: colors.textSecondary }]}>
        {template.exercises.length} exercise
        {template.exercises.length === 1 ? "" : "s"}
      </Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={onEdit}
          style={[
            styles.actionButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.actionText, { color: colors.text }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDuplicate}
          style={[
            styles.actionButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.actionText, { color: colors.text }]}>Copy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDelete}
          style={[
            styles.deleteButton,
            {
              backgroundColor: colors.danger + "20",
              borderColor: colors.danger + "40",
            },
          ]}
        >
          <Text style={[styles.deleteText, { color: colors.danger }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  weekday: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    marginRight: 12,
  },
  duration: {
    fontSize: 12,
    fontWeight: "600",
  },
  workoutName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  exerciseCount: {
    fontSize: 13,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  actionButton: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 6,
  },
  actionText: {
    fontWeight: "600",
    fontSize: 13,
  },
  deleteButton: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  deleteText: {
    fontWeight: "600",
    fontSize: 13,
  },
});