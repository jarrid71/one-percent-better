import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/context/ThemeContext";
import { loadStockItems, StockItem } from "@/utils/appstorage";
import {
    getMealMatches,
    Meal,
    MealMatchResult,
    PantryItem,
} from "../../constants/mealMatcher";

type Props = {
  meals: Meal[];
};

export default function MealMatcherCard(props: Props) {
  const { meals } = props;
  const { colors } = useAppTheme();

  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const items = await loadStockItems();
      setStockItems(items);
    };

    load();
  }, []);

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
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Pantry Meal Match
      </Text>

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Based on your current home stock
      </Text>

      {stockItems.length === 0 ? (
        <View
          style={[
            styles.emptyBox,
            {
              backgroundColor: colors.surfaceSoft,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No stock items found. Add items in the Stock tab.
          </Text>
        </View>
      ) : (
        matches.map((match) => {
          const isPerfectMatch = match.matchPercentage === 100;

          return (
            <View
              key={match.mealId}
              style={[
                styles.matchCard,
                {
                  backgroundColor: colors.surfaceSoft,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.matchHeader}>
                <Text style={[styles.mealName, { color: colors.text }]}>
                  {match.mealName}
                </Text>

                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: isPerfectMatch
                        ? colors.success
                        : colors.primaryLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color: isPerfectMatch ? "#FFFFFF" : colors.primary,
                      },
                    ]}
                  >
                    {match.matchPercentage}%
                  </Text>
                </View>
              </View>

              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {match.matchedIngredients} of {match.totalIngredients} ingredients
                matched
              </Text>

              {isPerfectMatch ? (
                <Text style={[styles.readyText, { color: colors.success }]}>
                  Ready to cook 🔥
                </Text>
              ) : match.missingIngredients.length > 0 ? (
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  Missing: {match.missingIngredients.join(", ")}
                </Text>
              ) : null}
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  emptyBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  matchCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 6,
  },
  mealName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  metaText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  readyText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    fontWeight: "700",
  },
});