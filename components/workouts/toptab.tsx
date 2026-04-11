import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type WorkoutTab = "overview" | "plan" | "learn";

type TopTabProps = {
  activeTab: WorkoutTab;
  setActiveTab: (tab: WorkoutTab) => void;
};

export default function TopTab({ activeTab, setActiveTab }: TopTabProps) {
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
        <Text style={[styles.tabText, activeTab === "plan" && styles.tabTextActive]}>
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

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#0f1115",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#1f2937",
    alignItems: "center",
    marginHorizontal: 4,
  },

  tabActive: {
    backgroundColor: "#2563eb",
  },

  tabText: {
    color: "#9ca3af",
    fontWeight: "600",
  },

  tabTextActive: {
    color: "#ffffff",
  },
});