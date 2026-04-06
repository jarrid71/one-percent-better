import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import FloatingAddButton from "@/components/common/FloatingAddButton";
import MyCollapsibleSection from "@/components/common/MyCollapsibleSection";
import WeeklyPlanner from "@/components/common/WeeklyPlanner";
import DashboardCard from "@/components/meals/DashboardCard";
import MealCard from "@/components/meals/MealCard";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { Meal } from "@/types/meal";

const savedMeals: Meal[] = [
  {
    id: "1",
    name: "Chicken Rice Bowl",
    ingredients: [
      { id: "1a", name: "Chicken Breast", amount: "200g", category: "Protein" },
      { id: "1b", name: "Jasmine Rice", amount: "1 cup", category: "Pantry" },
      { id: "1c", name: "Avocado", amount: "1/2", category: "Fridge" },
    ],
  },
  {
    id: "2",
    name: "Steak Wrap",
    ingredients: [
      { id: "2a", name: "Steak", amount: "180g", category: "Protein" },
      { id: "2b", name: "Wrap", amount: "1", category: "Pantry" },
      { id: "2c", name: "Lettuce", amount: "1 handful", category: "Fridge" },
    ],
  },
  {
    id: "3",
    name: "Protein Oats",
    ingredients: [
      { id: "3a", name: "Oats", amount: "1 cup", category: "Pantry" },
      { id: "3b", name: "Protein Powder", amount: "1 scoop", category: "Pantry" },
      { id: "3c", name: "Banana", amount: "1", category: "Fridge" },
    ],
  },
];

export default function MealsScreen() {
  const [selectedDay, setSelectedDay] = useState("Mon");

  const dailyCalories = 2240;
  const proteinTarget = 180;
  const plannedMeals = savedMeals.length;

  const greeting = useMemo(() => {
    return "Fuel your day";
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.overline}>MEAL DASHBOARD</Text>
            <Text style={styles.screenTitle}>Meals</Text>
            <Text style={styles.subtitle}>{greeting}</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <DashboardCard
            title="Calories"
            value={`${dailyCalories}`}
            subtitle="Daily target"
          />
          <DashboardCard
            title="Protein"
            value={`${proteinTarget}g`}
            subtitle="Goal per day"
          />
        </View>

        <View style={styles.summaryRow}>
          <DashboardCard
            title="Planned Meals"
            value={`${plannedMeals}`}
            subtitle={`${selectedDay} plan`}
          />
          <DashboardCard
            title="Water"
            value="2.5L"
            subtitle="Example target"
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Weekly Planner</Text>
          <WeeklyPlanner
            selectedDay={selectedDay}
            onDayChange={setSelectedDay}
          />
        </View>

        <MyCollapsibleSection title="Saved Meals">
          <View style={styles.mealsList}>
            {savedMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </View>
        </MyCollapsibleSection>

        <MyCollapsibleSection title="Profile-Based Targets">
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Your target summary</Text>
            <Text style={styles.infoText}>
              This section can later connect to your UserProfileContext and show
              calories, protein, carbs, fats, and meal recommendations.
            </Text>
          </View>
        </MyCollapsibleSection>

        <MyCollapsibleSection title="Planned Daily Average">
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Daily average</Text>
            <Text style={styles.infoText}>
              This section can later show your average daily calories and macros
              based on saved meals and your weekly meal plan.
            </Text>
          </View>
        </MyCollapsibleSection>
      </ScrollView>

      <FloatingAddButton
        onPress={() => Alert.alert("Add Meal", "Open your add meal modal here")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 120,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  overline: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  summaryRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  mealsList: {
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
});