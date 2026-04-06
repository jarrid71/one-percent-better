import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type WeeklyPlannerProps = {
  selectedDay?: string;
  onDayChange?: (day: string) => void;
};

export default function WeeklyPlanner({
  selectedDay = "Mon",
  onDayChange,
}: WeeklyPlannerProps) {
  const [activeDay, setActiveDay] = useState(selectedDay);

  const handlePress = (day: string) => {
    setActiveDay(day);
    onDayChange?.(day);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.heading}>Weekly Planner</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {DAYS.map((day) => {
          const isActive = activeDay === day;

          return (
            <TouchableOpacity
              key={day}
              style={[styles.dayButton, isActive && styles.activeDayButton]}
              onPress={() => handlePress(day)}
              activeOpacity={0.8}
            >
              <Text style={[styles.dayText, isActive && styles.activeDayText]}>
                {day}
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
  scrollContent: {
    paddingRight: 8,
  },
  dayButton: {
    backgroundColor: "#222733",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginRight: 10,
  },
  activeDayButton: {
    backgroundColor: "#2563EB",
  },
  dayText: {
    color: "#C7CEDB",
    fontSize: 15,
    fontWeight: "600",
  },
  activeDayText: {
    color: "#FFFFFF",
  },
});