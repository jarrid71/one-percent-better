import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "@/context/ThemeContext";

export type WorkoutTab = "overview" | "plan" | "learn";

type TopTabProps = {
  activeTab: WorkoutTab;
  setActiveTab: (tab: WorkoutTab) => void;
};

export default function TopTab({ activeTab, setActiveTab }: TopTabProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "overview" && styles.tabActive]}
        onPress={() => setActiveTab("overview")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "overview" && styles.tabTextActive,
          ]}
        >
          Overview
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === "plan" && styles.tabActive]}
        onPress={() => setActiveTab("plan")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "plan" && styles.tabTextActive,
          ]}
        >
          Plan
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === "learn" && styles.tabActive]}
        onPress={() => setActiveTab("learn")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "learn" && styles.tabTextActive,
          ]}
        >
          Learn
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: colors.background, // ✅ themed
      paddingHorizontal: 16,
      paddingVertical: 10,
    },

    tab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: colors.surface, // ✅ themed
      alignItems: "center",
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },

    tabActive: {
      backgroundColor: colors.primary, // ✅ themed
      borderColor: colors.primary,
    },

    tabText: {
      color: colors.textSecondary,
      fontWeight: "600",
    },

    tabTextActive: {
      color: "#ffffff",
    },
  });