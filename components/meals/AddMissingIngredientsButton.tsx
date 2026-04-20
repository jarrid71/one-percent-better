import React from "react";
import { Alert, Pressable, StyleSheet, Text } from "react-native";

import { useShoppingSuggestions } from "@/context/ShoppingSuggestionsContext";
import { useAppTheme } from "@/context/ThemeContext";

type MissingIngredient = {
  name: string;
  amount?: string;
  category?: string;
};

type AddMissingIngredientsButtonProps = {
  missingIngredients: MissingIngredient[];
};

export default function AddMissingIngredientsButton({
  missingIngredients,
}: AddMissingIngredientsButtonProps) {
  const { colors } = useAppTheme();
  const { addSuggestions } = useShoppingSuggestions();

  const handlePress = () => {
    const cleanedIngredients = missingIngredients
      .filter((item) => item.name.trim().length > 0)
      .map((item) => ({
        name: item.name.trim(),
        amount: item.amount?.trim() || "",
        category: item.category?.trim() || "Other",
      }));

    if (cleanedIngredients.length === 0) {
      Alert.alert("Nothing to add", "This meal has no missing ingredients.");
      return;
    }

    addSuggestions(cleanedIngredients);

    Alert.alert(
      "Added to shopping list",
      `${cleanedIngredients.length} missing ingredient${
        cleanedIngredients.length === 1 ? "" : "s"
      } added to suggestions.`
    );
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={[styles.buttonText, { color: colors.background }]}>
        Add missing ingredients to shopping list
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
});