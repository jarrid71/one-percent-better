import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onSelect}
      style={[styles.card, isSelected && styles.cardSelected]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.weekday} numberOfLines={2}>
          {template.weekday || "No day set"}
        </Text>

        <Text style={styles.duration}>{template.duration} min</Text>
      </View>

      <Text style={styles.workoutName}>{template.workoutName}</Text>

      <Text style={styles.exerciseCount}>
        {template.exercises.length} exercise
        {template.exercises.length === 1 ? "" : "s"}
      </Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onDuplicate} style={styles.actionButton}>
          <Text style={styles.actionText}>Copy</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  cardSelected: {
    borderColor: "#2563eb",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  weekday: {
    flex: 1,
    color: "#93c5fd",
    fontSize: 13,
    fontWeight: "700",
    marginRight: 12,
  },

  duration: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "600",
  },

  workoutName: {
    color: "#f9fafb",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },

  exerciseCount: {
    color: "#d1d5db",
    fontSize: 13,
    marginBottom: 12,
  },

  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },

  actionButton: {
    backgroundColor: "#1f2937",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 6,
  },

  actionText: {
    color: "#f9fafb",
    fontWeight: "600",
    fontSize: 13,
  },

  deleteButton: {
    backgroundColor: "#3f1d1d",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 6,
  },

  deleteText: {
    color: "#fca5a5",
    fontWeight: "600",
    fontSize: 13,
  },
});