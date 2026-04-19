import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "@/context/ThemeContext";

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
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

const createStyles = (colors: any) =>
  StyleSheet.create({
    wrapper: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 20,
      marginTop: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },

    heading: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "700",
      marginBottom: 12,
    },

    scrollContent: {
      paddingRight: 8,
    },

    dayButton: {
      backgroundColor: colors.inputBackground ?? colors.background,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginRight: 10,
      minWidth: 92,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },

    activeDayButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    dayText: {
      color: colors.textSecondary,
      fontSize: 15,
      fontWeight: "600",
    },

    activeDayText: {
      color: "#ffffff",
    },

    countText: {
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 4,
    },

    activeCountText: {
      color: "#ffffff",
    },
  });