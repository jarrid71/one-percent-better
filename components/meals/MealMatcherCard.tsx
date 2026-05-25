// components/meals/MealMatcherCard.tsx

import React, { useMemo } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import MealMatcherResultCard from "@/components/meals/MealMatcherResultCard";
import {
  getMealMatches,
  Meal,
  MealMatchResult,
  PantryItem,
} from "@/constants/mealMatcher";
import { useStock } from "@/context/StockContext";
import { useAppTheme } from "@/context/ThemeContext";

type Props = {
  meals: Meal[];
};

export default function MealMatcherCard({ meals }: Props) {
  const { colors } = useAppTheme();
  const { stock, cookMeal } = useStock();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const pantryItems: PantryItem[] = useMemo(() => {
    return stock.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
    }));
  }, [stock]);

  const matches: MealMatchResult[] = useMemo(() => {
    return getMealMatches(meals, pantryItems);
  }, [meals, pantryItems]);

  const handleCookMeal = async (mealId: string, mealName: string) => {
    const meal = meals.find((item) => item.id === mealId);

    if (!meal) {
      Alert.alert("Meal not found", "This meal could not be cooked.");
      return;
    }

    await cookMeal(meal);

    Alert.alert("Meal cooked", `${mealName} has been removed from your stock.`);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Pantry Meal Match</Text>

      <Text style={styles.subtitle}>Based on your current home stock</Text>

      {stock.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            No stock items found. Add items in the Stock tab.
          </Text>
        </View>
      ) : (
        matches.map((match) => (
          <MealMatcherResultCard
            key={match.mealId}
            mealName={match.mealName}
            matchPercent={match.matchPercentage}
            missingIngredients={match.missingIngredients}
            onCookMeal={() => handleCookMeal(match.mealId, match.mealName)}
          />
        ))
      )}
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderRadius: 20,
      padding: 16,
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 6,
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 12,
      color: colors.textSecondary,
    },
    emptyBox: {
      borderWidth: 1,
      borderRadius: 14,
      padding: 14,
      backgroundColor: colors.surfaceSoft,
      borderColor: colors.border,
    },
    emptyText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },
  });