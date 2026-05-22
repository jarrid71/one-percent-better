// app/(tabs)/meals.tsx

import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import FloatingAddButton from "@/components/common/FloatingAddButton";
import WeeklyPlanner from "@/components/common/WeeklyPlanner";
import AddMealModal from "@/components/meals/AddMealModal";
import MealCard from "@/components/meals/MealCard";
import MealMatcherCard from "@/components/meals/MealMatcherCard";
import { SPACING } from "@/constants/spacing";
import { useMeals } from "@/context/MealsContext";
import { useAppTheme } from "@/context/ThemeContext";
import { Meal } from "@/types/meal";
import { useStock } from "../../context/StockContext";

type MealsViewMode = "cook" | "saved" | "planner";

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

  const [viewMode, setViewMode] = useState<MealsViewMode>("cook");
  const [isMealModalVisible, setIsMealModalVisible] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  const plannedMealsForSelectedDay = getMealsForDay(selectedDay);

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

  const isMealPlannedForSelectedDay = (mealId: string) => {
    return getMealsForDay(selectedDay).some((meal) => meal.id === mealId);
  };

  const toggleMealForSelectedDay = (mealId: string) => {
    const isAlreadyPlanned = isMealPlannedForSelectedDay(mealId);

    if (isAlreadyPlanned) {
      removeMealFromDay(selectedDay, mealId);
    } else {
      addMealToDay(selectedDay, mealId);
    }
  };

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
          <Text style={styles.overline}>MEALS</Text>
          <Text style={styles.screenTitle}>Meal Assistant</Text>
          <Text style={styles.subtitle}>
            Cook from stock, save meals, and plan your week.
          </Text>
        </View>

        <View style={styles.tabsWrap}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              viewMode === "cook" && styles.tabButtonActive,
            ]}
            onPress={() => setViewMode("cook")}
          >
            <Text
              style={[
                styles.tabText,
                viewMode === "cook" && styles.tabTextActive,
              ]}
            >
              Cook Now
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              viewMode === "saved" && styles.tabButtonActive,
            ]}
            onPress={() => setViewMode("saved")}
          >
            <Text
              style={[
                styles.tabText,
                viewMode === "saved" && styles.tabTextActive,
              ]}
            >
              Saved
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              viewMode === "planner" && styles.tabButtonActive,
            ]}
            onPress={() => setViewMode("planner")}
          >
            <Text
              style={[
                styles.tabText,
                viewMode === "planner" && styles.tabTextActive,
              ]}
            >
              Planner
            </Text>
          </TouchableOpacity>
        </View>

        {viewMode === "cook" && (
          <View style={styles.section}>
            <View style={styles.introCard}>
              <Text style={styles.sectionTitle}>What can I cook?</Text>
              <Text style={styles.helperText}>
                Based on your current stock, this shows which saved meals are
                ready or nearly ready.
              </Text>
            </View>

            {meals.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No saved meals yet</Text>
                <Text style={styles.emptyText}>
                  Add some meals first, then this area will show what you can
                  cook from your pantry.
                </Text>
              </View>
            ) : stock.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No stock added yet</Text>
                <Text style={styles.emptyText}>
                  Add items in the Stock tab so Meal Matcher can compare your
                  pantry against your meals.
                </Text>
              </View>
            ) : (
              <MealMatcherCard meals={meals} key={stock.length} />
            )}
          </View>
        )}

        {viewMode === "saved" && (
          <View style={styles.section}>
            <View style={styles.introCard}>
              <Text style={styles.sectionTitle}>Saved Meals</Text>
              <Text style={styles.helperText}>
                Tap a meal to edit it. Use the plus button to add a new meal.
              </Text>
            </View>

            {meals.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No meals saved</Text>
                <Text style={styles.emptyText}>
                  Press the plus button to create your first meal.
                </Text>
              </View>
            ) : (
              <View style={styles.mealsList}>
                {meals.map((meal) => (
                  <TouchableOpacity
                    key={meal.id}
                    activeOpacity={0.88}
                    onPress={() => openEditMealModal(meal)}
                  >
                    <MealCard meal={meal} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {viewMode === "planner" && (
          <View style={styles.section}>
            <View style={styles.introCard}>
              <Text style={styles.sectionTitle}>Weekly Planner</Text>
              <Text style={styles.helperText}>
                Pick a day, then add or remove meals from that day.
              </Text>
            </View>

            <View style={styles.card}>
              <WeeklyPlanner
                selectedDay={selectedDay}
                onDayChange={setSelectedDay}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Planned for {selectedDay}</Text>

              {plannedMealsForSelectedDay.length === 0 ? (
                <Text style={styles.emptyText}>
                  No meals planned for {selectedDay} yet.
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
                        <Text style={styles.plannedMealName}>{meal.name}</Text>
                        <Text style={styles.plannedMealMeta}>
                          {meal.ingredients.length}{" "}
                          {meal.ingredients.length === 1
                            ? "ingredient"
                            : "ingredients"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => toggleMealForSelectedDay(meal.id)}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Add meals to {selectedDay}</Text>

              {meals.length === 0 ? (
                <Text style={styles.emptyText}>
                  No saved meals yet. Add meals in the Saved tab first.
                </Text>
              ) : (
                <View style={styles.quickPlanList}>
                  {meals.map((meal) => {
                    const isPlanned = isMealPlannedForSelectedDay(meal.id);

                    return (
                      <View key={meal.id} style={styles.quickPlanRow}>
                        <View style={styles.quickPlanTextWrap}>
                          <Text style={styles.quickPlanName}>{meal.name}</Text>
                          <Text style={styles.quickPlanMeta}>
                            {meal.ingredients.length}{" "}
                            {meal.ingredients.length === 1
                              ? "ingredient"
                              : "ingredients"}
                          </Text>
                        </View>

                        <TouchableOpacity
                          onPress={() => toggleMealForSelectedDay(meal.id)}
                          style={[
                            styles.planButton,
                            isPlanned
                              ? styles.planButtonRemove
                              : styles.planButtonAdd,
                          ]}
                        >
                          <Text style={styles.planButtonText}>
                            {isPlanned ? "Added" : "Add"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {(viewMode === "saved" || viewMode === "planner") && (
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
      lineHeight: 21,
    },
    tabsWrap: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 6,
      marginBottom: SPACING.lg,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      alignItems: "center",
    },
    tabButtonActive: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.textSecondary,
    },
    tabTextActive: {
      color: colors.background,
    },
    section: {
      gap: SPACING.md,
    },
    introCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 6,
    },
    helperText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: colors.text,
      marginBottom: SPACING.md,
    },
    emptyCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 6,
    },
    emptyText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    mealsList: {
      gap: SPACING.md,
    },
    plannedMealsList: {
      gap: SPACING.sm,
    },
    plannedMealRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    plannedMealMain: {
      flex: 1,
    },
    plannedMealName: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 2,
    },
    plannedMealMeta: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    removeButton: {
      backgroundColor: colors.danger,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    removeButtonText: {
      color: colors.background,
      fontSize: 12,
      fontWeight: "800",
    },
    quickPlanList: {
      gap: SPACING.sm,
    },
    quickPlanRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickPlanTextWrap: {
      flex: 1,
    },
    quickPlanName: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 2,
    },
    quickPlanMeta: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    planButton: {
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 9,
      minWidth: 70,
      alignItems: "center",
    },
    planButtonAdd: {
      backgroundColor: colors.primary,
    },
    planButtonRemove: {
      backgroundColor: colors.surfaceSoft,
      borderWidth: 1,
      borderColor: colors.border,
    },
    planButtonText: {
      color: colors.background,
      fontSize: 12,
      fontWeight: "800",
    },
  });