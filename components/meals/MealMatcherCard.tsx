import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useFocusEffect } from "expo-router";

import MealMatcherResultCard from "@/components/meals/MealMatcherResultCard";
import {
  getMealMatches,
  Meal,
  MealMatchResult,
  PantryItem,
} from "@/constants/mealMatcher";
import { useAppTheme } from "@/context/ThemeContext";
import { loadStockItems, StockItem } from "@/utils/appstorage";

type Props = {
  meals: Meal[];
};

export default function MealMatcherCard({ meals }: Props) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  const refreshStockItems = async () => {
    const items = await loadStockItems();
    setStockItems(items);
  };

  useFocusEffect(
    useCallback(() => {
      refreshStockItems();
    }, [])
  );

  const pantryItems: PantryItem[] = useMemo(() => {
    return stockItems.map((item) => ({
      id: item.id,
      name: item.name,
    }));
  }, [stockItems]);

  const matches: MealMatchResult[] = useMemo(() => {
    return getMealMatches(meals, pantryItems);
  }, [meals, pantryItems]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Pantry Meal Match</Text>
      <Text style={styles.subtitle}>Based on your current home stock</Text>

      {stockItems.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            No stock items found. Add items in the Stock tab.
          </Text>
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            No meals found yet. Add a meal first.
          </Text>
        </View>
      ) : (
        matches.map((match) => {
          const missingIngredients = match.missingIngredients.map((name) => ({
            name,
          }));

          return (
            <MealMatcherResultCard
              key={match.mealId}
              mealName={match.mealName}
              matchPercent={match.matchPercentage}
              missingIngredients={missingIngredients}
            />
          );
        })
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