import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { Meal } from "@/types/meal";

type MealCardProps = {
  meal: Meal;
};

export default function MealCard({ meal }: MealCardProps) {
  const ingredientCount = meal.ingredients.length;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{meal.name}</Text>
          <Text style={styles.subtitle}>Saved meal</Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>
            {ingredientCount} {ingredientCount === 1 ? "item" : "items"}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Ingredients</Text>

      <View style={styles.ingredientsList}>
        {meal.ingredients.map((ingredient, index) => (
          <View key={ingredient.id} style={styles.ingredientRow}>
            <View style={styles.bullet} />

            <View style={styles.ingredientTextWrap}>
              <Text style={styles.ingredientName}>{ingredient.name}</Text>
              <Text style={styles.ingredientAmount}>{ingredient.amount}</Text>
            </View>

            <Text style={styles.ingredientNumber}>
              {String(index + 1).padStart(2, "0")}
            </Text>
          </View>
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

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },

  titleWrap: {
    flex: 1,
    paddingRight: SPACING.sm,
  },

  title: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },

  countBadge: {
    backgroundColor: COLORS.background,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  ingredientsList: {
    gap: SPACING.sm,
  },

  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  bullet: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },

  ingredientTextWrap: {
    flex: 1,
  },

  ingredientName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },

  ingredientAmount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },

  ingredientNumber: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
});