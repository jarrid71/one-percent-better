import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

type DayKey = (typeof DAYS)[number];

type WeeklyPlannerProps = {
  selectedDay?: string;
  onDayChange?: (day: string) => void;
  dayCounts?: Partial<Record<DayKey, number>>;
};

export default function WeeklyPlanner({
  selectedDay = "Mon",
  onDayChange,
  dayCounts = {},
}: WeeklyPlannerProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.heading}>Weekly Planner</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {DAYS.map((day) => {
          const isActive = selectedDay === day;
          const count = dayCounts[day] ?? 0;

          return (
            <TouchableOpacity
              key={day}
              style={[styles.dayButton, isActive && styles.activeDayButton]}
              onPress={() => onDayChange?.(day)}
              activeOpacity={0.8}
            >
              <Text style={[styles.dayText, isActive && styles.activeDayText]}>
                {day}
              </Text>

              <Text style={[styles.countText, isActive && styles.activeCountText]}>
                {count} workout{count === 1 ? "" : "s"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#171a21",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
  },

  heading: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },

  scrollContent: {
    paddingRight: 8,
  },

  dayButton: {
    backgroundColor: "#222733",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 10,
    minWidth: 92,
    alignItems: "center",
  },

  activeDayButton: {
    backgroundColor: "#2563eb",
  },

  dayText: {
    color: "#c7cedb",
    fontSize: 15,
    fontWeight: "600",
  },

  activeDayText: {
    color: "#ffffff",
  },

  countText: {
    color: "#9ca3af",
    fontSize: 11,
    marginTop: 4,
  },

  activeCountText: {
    color: "#dbeafe",
  },
});