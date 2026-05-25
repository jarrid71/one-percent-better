import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import AddMissingIngredientsButton from "@/components/meals/AddMissingIngredientsButton";
import { useAppTheme } from "@/context/ThemeContext";

type MissingIngredient = {
  name: string;
  amount?: string;
  category?: string;
};

type MealMatcherResultCardProps = {
  mealName: string;
  matchPercent: number;
  missingIngredients: MissingIngredient[];
  onCookMeal?: () => void;
};

export default function MealMatcherResultCard({
  mealName,
  matchPercent,
  missingIngredients,
  onCookMeal,
}: MealMatcherResultCardProps) {
  const { colors } = useAppTheme();

  const isReadyToCook = matchPercent >= 100;
  const isAlmostReady = matchPercent >= 70 && matchPercent < 100;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isReadyToCook
            ? colors.success
            : isAlmostReady
            ? colors.primary
            : colors.border,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.mealName, { color: colors.text }]}>{mealName}</Text>

        <View
          style={[
            styles.percentBadge,
            {
              backgroundColor: isReadyToCook
                ? colors.success
                : isAlmostReady
                ? colors.primary
                : colors.primaryLight,
            },
          ]}
        >
          <Text
            style={[
              styles.percentText,
              {
                color:
                  isReadyToCook || isAlmostReady
                    ? colors.background
                    : colors.text,
              },
            ]}
          >
            {matchPercent}%
          </Text>
        </View>
      </View>

      {isReadyToCook ? (
        <Text style={[styles.readyText, { color: colors.success }]}>
          Ready to cook 🔥
        </Text>
      ) : isAlmostReady ? (
        <Text style={[styles.almostText, { color: colors.primary }]}>
          Almost ready 👀
        </Text>
      ) : null}

      {isReadyToCook && onCookMeal && (
        <TouchableOpacity
          style={[styles.cookButton, { backgroundColor: colors.success }]}
          onPress={onCookMeal}
          activeOpacity={0.85}
        >
          <Text style={[styles.cookButtonText, { color: colors.background }]}>
            Cook meal
          </Text>
        </TouchableOpacity>
      )}

      {missingIngredients.length > 0 && (
        <>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            Missing ingredients
          </Text>

          <View style={styles.missingList}>
            {missingIngredients.map((ingredient, index) => (
              <Text
                key={`${ingredient.name}-${index}`}
                style={[styles.missingItem, { color: colors.textMuted }]}
              >
                • {ingredient.name}
                {ingredient.amount ? ` (${ingredient.amount})` : ""}
              </Text>
            ))}
          </View>

          <AddMissingIngredientsButton
            missingIngredients={missingIngredients}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  mealName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
  },
  percentBadge: {
    minWidth: 64,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  percentText: {
    fontSize: 13,
    fontWeight: "700",
  },
  readyText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "700",
  },
  almostText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "700",
  },
  cookButton: {
    marginTop: 12,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cookButtonText: {
    fontSize: 14,
    fontWeight: "800",
  },
  sectionLabel: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  missingList: {
    gap: 4,
  },
  missingItem: {
    fontSize: 13,
    lineHeight: 18,
  },
});