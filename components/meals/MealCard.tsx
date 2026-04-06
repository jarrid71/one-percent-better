import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { Meal } from "@/types/meal";

type MealCardProps = {
  meal: Meal;
};

export default function MealCard({ meal }: MealCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{meal.name}</Text>

      <Text style={styles.sectionTitle}>Ingredients</Text>

      <View style={styles.ingredientsList}>
        {meal.ingredients.map((ingredient) => (
          <Text key={ingredient.id} style={styles.ingredient}>
            • {ingredient.name} ({ingredient.amount})
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },

  ingredientsList: {
    gap: SPACING.xs,
  },

  ingredient: {
    fontSize: 14,
    color: COLORS.text,
  },
});