import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import FloatingAddButton from "@/components/common/FloatingAddButton";
import MyCollapsibleSection from "@/components/common/MyCollapsibleSection";
import WeeklyPlanner from "@/components/common/WeeklyPlanner";
import AddMealModal from "@/components/meals/AddMealModal";
import DashboardCard from "@/components/meals/DashboardCard";
import MealCard from "@/components/meals/MealCard";
import MealMatcherCard from "@/components/meals/MealMatcherCard";
import { SPACING } from "@/constants/spacing";
import { useMeals } from "@/context/MealsContext";
import { useAppTheme } from "@/context/ThemeContext";
import { Meal } from "@/types/meal";
import { useStock } from "../../context/StockContext";

type MealsViewMode = "planner" | "matcher";

export default function MealsScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const {
    meals,
    selectedDay,
    setSelectedDay,
    addMeal,
    updateMeal,
    deleteMeal,
    addMealToDay,
    removeMealFromDay,
    getMealsForDay,
    isLoading,
  } = useMeals();

  const { stock } = useStock();

  const [isMealModalVisible, setIsMealModalVisible] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [viewMode, setViewMode] = useState<MealsViewMode>("planner");

  const dailyCalories = 2240;
  const proteinTarget = 180;
  const plannedMeals = getMealsForDay(selectedDay).length;

  const greeting = useMemo(() => {
    return "Fuel your day";
  }, []);

  const openAddMealModal = () => {
    setEditingMeal(null);
    setIsMealModalVisible(true);
  };

  const openEditMealModal = (meal: Meal) => {
    setEditingMeal(meal);
    setIsMealModalVisible(true);
  };

  const closeMealModal = () => {
    setEditingMeal(null);
    setIsMealModalVisible(false);
  };

  const handleSaveMeal = (mealToSave: Meal) => {
    if (editingMeal) {
      updateMeal(mealToSave);
    } else {
      addMeal(mealToSave);
    }
  };

  const handleDeleteMeal = (mealId: string) => {
    deleteMeal(mealId);
    closeMealModal();
  };

  const toggleMealForSelectedDay = (mealId: string) => {
    const isAlreadyPlanned = isMealPlannedForSelectedDay(mealId);

    if (isAlreadyPlanned) {
      removeMealFromDay(selectedDay, mealId);
    } else {
      addMealToDay(selectedDay, mealId);
    }
  };

  const isMealPlannedForSelectedDay = (mealId: string) => {
    return getMealsForDay(selectedDay).some((meal) => meal.id === mealId);
  };

  const plannedMealsForSelectedDay = getMealsForDay(selectedDay);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading meals...</Text>
      </View>
    );
  }

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

        <View
          style={[
            styles.topTabsWrap,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.topTab,
              viewMode === "planner" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setViewMode("planner")}
          >
            <Text
              style={[
                styles.topTabText,
                { color: colors.textSecondary },
                viewMode === "planner" && styles.topTabTextActive,
              ]}
            >
              Planner
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.topTab,
              viewMode === "matcher" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setViewMode("matcher")}
          >
            <Text
              style={[
                styles.topTabText,
                { color: colors.textSecondary },
                viewMode === "matcher" && styles.topTabTextActive,
              ]}
            >
              Matcher
            </Text>
          </TouchableOpacity>
        </View>

        {viewMode === "planner" && (
          <>
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

            <MyCollapsibleSection title={`Planned Meals for ${selectedDay}`}>
              <View style={styles.infoCard}>
                {plannedMealsForSelectedDay.length === 0 ? (
                  <Text style={styles.infoText}>
                    No meals planned for {selectedDay} yet. Tap a saved meal
                    below to add it.
                  </Text>
                ) : (
                  <View style={styles.plannedMealsList}>
                    {plannedMealsForSelectedDay.map((meal) => (
                      <View key={meal.id} style={styles.plannedMealRow}>
                        <TouchableOpacity
                          style={styles.plannedMealMain}
                          activeOpacity={0.8}
                          onPress={() => openEditMealModal(meal)}
                        >
                          <View style={styles.plannedMealTextWrap}>
                            <Text style={styles.plannedMealName}>
                              {meal.name}
                            </Text>
                            <Text style={styles.plannedMealMeta}>
                              {meal.ingredients.length}{" "}
                              {meal.ingredients.length === 1
                                ? "ingredient"
                                : "ingredients"}
                            </Text>
                          </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => toggleMealForSelectedDay(meal.id)}
                          style={styles.removePlannedButton}
                        >
                          <Text style={styles.removePlannedButtonText}>
                            Remove
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </MyCollapsibleSection>

            <MyCollapsibleSection title="Saved Meals">
              <View style={styles.savedMealsHeader}>
                <Text style={styles.savedMealsHelper}>
                  Tap a meal card to edit it. Use the small button to add or
                  remove it from {selectedDay}.
                </Text>
              </View>

              <View style={styles.mealsList}>
                {meals.map((meal) => {
                  const isPlanned = isMealPlannedForSelectedDay(meal.id);

                  return (
                    <View key={meal.id} style={styles.savedMealItem}>
                      <TouchableOpacity
                        activeOpacity={0.88}
                        onPress={() => openEditMealModal(meal)}
                      >
                        <View style={styles.mealCardWrap}>
                          <MealCard meal={meal} />
                          {isPlanned && (
                            <View style={styles.plannedBadge}>
                              <Text style={styles.plannedBadgeText}>
                                Planned for {selectedDay}
                              </Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => toggleMealForSelectedDay(meal.id)}
                        style={[
                          styles.planToggleButton,
                          isPlanned
                            ? styles.planToggleButtonRemove
                            : styles.planToggleButtonAdd,
                        ]}
                      >
                        <Text style={styles.planToggleButtonText}>
                          {isPlanned
                            ? `Remove from ${selectedDay}`
                            : `Add to ${selectedDay}`}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </MyCollapsibleSection>

            <MyCollapsibleSection title="Profile-Based Targets">
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Your target summary</Text>
                <Text style={styles.infoText}>
                  This section can later connect to your UserProfileContext and
                  show calories, protein, carbs, fats, and meal
                  recommendations.
                </Text>
              </View>
            </MyCollapsibleSection>

            <MyCollapsibleSection title="Planned Daily Average">
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Daily average</Text>
                <Text style={styles.infoText}>
                  This section can later show your average daily calories and
                  macros based on saved meals and your weekly meal plan.
                </Text>
              </View>
            </MyCollapsibleSection>
          </>
        )}

        {viewMode === "matcher" && (
          <View style={styles.matcherWrap}>
            <MealMatcherCard meals={meals} key={stock.length} />
          </View>
        )}
      </ScrollView>

      {viewMode === "planner" && (
        <FloatingAddButton onPress={openAddMealModal} />
      )}

      <AddMealModal
        visible={isMealModalVisible}
        onClose={closeMealModal}
        onSave={handleSaveMeal}
        onDelete={handleDeleteMeal}
        editingMeal={editingMeal}
      />
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    loadingText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textSecondary,
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
      color: colors.primary,
      marginBottom: SPACING.xs,
    },
    screenTitle: {
      fontSize: 32,
      fontWeight: "800",
      color: colors.text,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      marginTop: SPACING.xs,
    },
    topTabsWrap: {
      flexDirection: "row",
      borderWidth: 1,
      borderRadius: 18,
      padding: 6,
      marginBottom: SPACING.lg,
    },
    topTab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      alignItems: "center",
    },
    topTabText: {
      fontSize: 14,
      fontWeight: "700",
    },
    topTabTextActive: {
      color: "#FFFFFF",
    },
    summaryRow: {
      flexDirection: "row",
      gap: SPACING.md,
      marginBottom: SPACING.md,
    },
    sectionCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: SPACING.lg,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: SPACING.md,
    },
    mealsList: {
      gap: SPACING.md,
      marginTop: SPACING.sm,
    },
    savedMealsHeader: {
      marginTop: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    savedMealsHelper: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    savedMealItem: {
      gap: SPACING.sm,
    },
    mealCardWrap: {
      position: "relative",
    },
    plannedBadge: {
      position: "absolute",
      top: 12,
      right: 12,
      backgroundColor: colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
    },
    plannedBadgeText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "700",
    },
    planToggleButton: {
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
    },
    planToggleButtonAdd: {
      backgroundColor: colors.primary,
    },
    planToggleButtonRemove: {
      backgroundColor: "#b91c1c",
    },
    planToggleButtonText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "700",
    },
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: SPACING.sm,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginBottom: SPACING.sm,
    },
    infoText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    plannedMealsList: {
      gap: SPACING.sm,
    },
    plannedMealRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      backgroundColor: colors.background,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    plannedMealMain: {
      flex: 1,
    },
    plannedMealTextWrap: {
      flex: 1,
      paddingRight: SPACING.sm,
    },
    plannedMealName: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 2,
    },
    plannedMealMeta: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    removePlannedButton: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    removePlannedButtonText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "700",
    },
    matcherWrap: {
      marginTop: SPACING.xs,
    },
  });