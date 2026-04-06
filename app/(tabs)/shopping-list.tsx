import colors from "@/constants/colors";
import spacing from "@/constants/spacing";
import { useShoppingSuggestions } from "@/context/ShoppingSuggestionsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ShoppingListItem = {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  checked?: boolean;
};

type ShoppingCategory =
  | "Protein"
  | "Carbs"
  | "Vegetables"
  | "Fruit"
  | "Dairy"
  | "Drinks"
  | "Pantry"
  | "Other";

export default function ShoppingListScreen() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");

  const { suggestions, removeSuggestion, clearSuggestions } = useShoppingSuggestions();

  useFocusEffect(
    useCallback(() => {
      loadShoppingList();
    }, [])
  );

  useEffect(() => {
    loadShoppingList();
  }, []);

  const loadShoppingList = async () => {
    try {
      const saved = await AsyncStorage.getItem("shoppingList");
      if (saved) {
        setItems(JSON.parse(saved));
      } else {
        setItems([]);
      }
    } catch (error) {
      console.log("Error loading shopping list:", error);
    }
  };

  const saveShoppingList = async (updatedItems: ShoppingListItem[]) => {
    try {
      await AsyncStorage.setItem("shoppingList", JSON.stringify(updatedItems));
      setItems(updatedItems);
    } catch (error) {
      console.log("Error saving shopping list:", error);
    }
  };

  const addManualItem = () => {
    const trimmedName = newItemName.trim();
    const trimmedQuantity = newItemQuantity.trim();
    const trimmedUnit = newItemUnit.trim();

    if (!trimmedName || !trimmedQuantity || !trimmedUnit) {
      Alert.alert("Missing info", "Please fill in item name, quantity, and unit.");
      return;
    }

    const newItem: ShoppingListItem = {
      id: `${Date.now()}`,
      name: trimmedName,
      quantity: trimmedQuantity,
      unit: trimmedUnit,
      checked: false,
    };

    const updated = [newItem, ...items];
    saveShoppingList(updated);

    setNewItemName("");
    setNewItemQuantity("");
    setNewItemUnit("");
  };

  const toggleItem = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    saveShoppingList(updated);
  };

  const deleteItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    saveShoppingList(updated);
  };

  const clearCheckedItems = () => {
    const updated = items.filter((item) => !item.checked);
    saveShoppingList(updated);
  };

  const changeItemQuantity = (id: string, amount: number) => {
    const updated = items.map((item) => {
      if (item.id !== id) return item;

      const currentQuantity = Number(item.quantity) || 0;
      const nextQuantity = Math.max(1, currentQuantity + amount);

      return {
        ...item,
        quantity: String(nextQuantity),
      };
    });

    saveShoppingList(updated);
  };

  const addSingleSuggestionToShopping = async (suggestionId: string) => {
    try {
      const suggestion = suggestions.find((s) => s.id === suggestionId);

      if (!suggestion) {
        return;
      }

      const updatedItems = [...items];

      const suggestionName = suggestion.name.trim();
      const suggestionAmount = suggestion.amount?.trim() || "1";

      const quantityMatch = suggestionAmount.match(/^\d+(\.\d+)?/);
      const unitMatch = suggestionAmount.replace(/^\d+(\.\d+)?\s*/, "").trim();

      const quantity = quantityMatch ? quantityMatch[0] : "1";
      const unit = unitMatch || "item";

      const existingIndex = updatedItems.findIndex(
        (item) =>
          item.name.trim().toLowerCase() === suggestionName.toLowerCase() &&
          item.unit.trim().toLowerCase() === unit.toLowerCase()
      );

      if (existingIndex >= 0) {
        const currentQty = Number(updatedItems[existingIndex].quantity) || 0;
        const addQty = Number(quantity) || 0;

        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: String(currentQty + addQty),
        };
      } else {
        updatedItems.unshift({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: suggestionName,
          quantity,
          unit,
          checked: false,
        });
      }

      await AsyncStorage.setItem("shoppingList", JSON.stringify(updatedItems));
      setItems(updatedItems);
      removeSuggestion(suggestionId);
    } catch (error) {
      console.log("Error adding suggestion:", error);
      Alert.alert("Error", "Could not add that suggestion.");
    }
  };

  const addSuggestionsToShopping = async () => {
    try {
      if (suggestions.length === 0) {
        Alert.alert("No suggestions", "There are no shopping suggestions to add.");
        return;
      }

      const updatedItems = [...items];

      suggestions.forEach((suggestion) => {
        const suggestionName = suggestion.name.trim();
        const suggestionAmount = suggestion.amount?.trim() || "1";
        const quantityMatch = suggestionAmount.match(/^\d+(\.\d+)?/);
        const unitMatch = suggestionAmount.replace(/^\d+(\.\d+)?\s*/, "").trim();

        const quantity = quantityMatch ? quantityMatch[0] : "1";
        const unit = unitMatch || "item";

        const existingIndex = updatedItems.findIndex(
          (item) =>
            item.name.trim().toLowerCase() === suggestionName.toLowerCase() &&
            item.unit.trim().toLowerCase() === unit.toLowerCase()
        );

        if (existingIndex >= 0) {
          const currentQty = Number(updatedItems[existingIndex].quantity) || 0;
          const addQty = Number(quantity) || 0;

          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: String(currentQty + addQty),
          };
        } else {
          updatedItems.unshift({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: suggestionName,
            quantity,
            unit,
            checked: false,
          });
        }
      });

      await AsyncStorage.setItem("shoppingList", JSON.stringify(updatedItems));
      setItems(updatedItems);
      clearSuggestions();

      Alert.alert("Success", "Shopping suggestions added to your shopping list.");
    } catch (error) {
      console.log("Error adding suggestions to shopping list:", error);
      Alert.alert("Error", "Could not add suggestions to the shopping list.");
    }
  };

  const getItemCategory = (itemName: string): ShoppingCategory => {
    const name = itemName.trim().toLowerCase();

    const proteinWords = [
      "chicken",
      "beef",
      "steak",
      "mince",
      "turkey",
      "fish",
      "salmon",
      "tuna",
      "eggs",
      "egg",
      "prawns",
      "protein",
    ];

    const carbWords = [
      "rice",
      "pasta",
      "bread",
      "wrap",
      "wraps",
      "potato",
      "oats",
      "cereal",
      "noodle",
      "noodles",
      "flour",
    ];

    const vegetableWords = [
      "broccoli",
      "carrot",
      "spinach",
      "lettuce",
      "tomato",
      "cucumber",
      "capsicum",
      "onion",
      "pumpkin",
      "zucchini",
      "beans",
    ];

    const fruitWords = [
      "banana",
      "bananas",
      "apple",
      "orange",
      "berries",
      "berry",
      "grapes",
      "melon",
      "pear",
      "fruit",
      "mango",
    ];

    const dairyWords = [
      "milk",
      "yogurt",
      "yoghurt",
      "cheese",
      "butter",
      "cream",
    ];

    const drinkWords = [
      "water",
      "juice",
      "drink",
      "coffee",
      "tea",
      "soft drink",
    ];

    const pantryWords = [
      "salt",
      "pepper",
      "oil",
      "sauce",
      "spice",
      "herbs",
      "honey",
      "peanut butter",
      "jam",
      "stock",
    ];

    if (proteinWords.some((word) => name.includes(word))) return "Protein";
    if (carbWords.some((word) => name.includes(word))) return "Carbs";
    if (vegetableWords.some((word) => name.includes(word))) return "Vegetables";
    if (fruitWords.some((word) => name.includes(word))) return "Fruit";
    if (dairyWords.some((word) => name.includes(word))) return "Dairy";
    if (drinkWords.some((word) => name.includes(word))) return "Drinks";
    if (pantryWords.some((word) => name.includes(word))) return "Pantry";

    return "Other";
  };

  const groupedItems = useMemo(() => {
    const categoryOrder: ShoppingCategory[] = [
      "Protein",
      "Carbs",
      "Vegetables",
      "Fruit",
      "Dairy",
      "Drinks",
      "Pantry",
      "Other",
    ];

    return categoryOrder
      .map((category) => ({
        category,
        items: items.filter((item) => getItemCategory(item.name) === category),
      }))
      .filter((group) => group.items.length > 0);
  }, [items]);

  return (
    <View style={styles.container}>
      <FlatList
        data={groupedItems}
        keyExtractor={(group) => group.category}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.heroCard}>
              <Text style={styles.title}>Shopping List</Text>
              <Text style={styles.subtitle}>Items you need to buy</Text>
            </View>

            {suggestions.length > 0 && (
              <View style={styles.suggestionCard}>
                <Text style={styles.sectionTitle}>Shopping Suggestions</Text>
                <Text style={styles.sectionSubtitle}>
                  Ingredients sent from your Meals screen
                </Text>

                {suggestions.map((item) => (
                  <View key={item.id} style={styles.suggestionRow}>
                    <View style={styles.suggestionTextWrap}>
                      <Text style={styles.suggestionName}>{item.name}</Text>
                      <Text style={styles.suggestionMeta}>
                        {item.amount || "1 item"}
                        {item.sourceMeal ? ` • from ${item.sourceMeal}` : ""}
                      </Text>
                    </View>

                    <View style={styles.suggestionButtonGroup}>
                      <TouchableOpacity
                        style={styles.addSingleButton}
                        onPress={() => addSingleSuggestionToShopping(item.id)}
                      >
                        <Text style={styles.addSingleButtonText}>Add</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.removeSuggestionButton}
                        onPress={() => removeSuggestion(item.id)}
                      >
                        <Text style={styles.removeSuggestionButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  onPress={addSuggestionsToShopping}
                  style={styles.greenButton}
                >
                  <Text style={styles.greenButtonText}>Add Suggestions to Shopping</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.manualCard}>
              <Text style={styles.sectionTitle}>Add Item Manually</Text>

              <TextInput
                value={newItemName}
                onChangeText={setNewItemName}
                placeholder="Item name"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />

              <TextInput
                value={newItemQuantity}
                onChangeText={setNewItemQuantity}
                placeholder="Quantity"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                style={styles.input}
              />

              <TextInput
                value={newItemUnit}
                onChangeText={setNewItemUnit}
                placeholder="Unit (example: kg, pack, ml)"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />

              <TouchableOpacity onPress={addManualItem} style={styles.greenButton}>
                <Text style={styles.greenButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={clearCheckedItems} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Clear Checked Items</Text>
            </TouchableOpacity>
          </>
        }
        renderItem={({ item: group }) => (
          <View style={styles.groupWrap}>
            <Text style={styles.groupTitle}>{group.category}</Text>

            {group.items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <Text
                  style={[
                    styles.itemName,
                    item.checked && styles.itemNameChecked,
                  ]}
                >
                  {item.name}
                </Text>

                <View style={styles.quantityRow}>
                  <TouchableOpacity
                    onPress={() => changeItemQuantity(item.id, -1)}
                    style={styles.minusButton}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>

                  <View style={styles.quantityDisplay}>
                    <Text style={styles.quantityText}>
                      {item.quantity} {item.unit}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => changeItemQuantity(item.id, 1)}
                    style={styles.plusButton}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    onPress={() => toggleItem(item.id)}
                    style={[
                      styles.flexButton,
                      item.checked ? styles.boughtButton : styles.defaultButton,
                    ]}
                  >
                    <Text style={styles.buttonText}>
                      {item.checked ? "Bought" : "Mark Bought"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => deleteItem(item.id)}
                    style={[styles.flexButton, styles.deleteButton]}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No shopping items yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 140,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
  },
  suggestionCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  manualCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    color: colors.textMuted,
    marginBottom: spacing.md,
    fontSize: 14,
  },
  suggestionRow: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  suggestionTextWrap: {
    marginBottom: spacing.sm,
  },
  suggestionName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  suggestionMeta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  suggestionButtonGroup: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  addSingleButton: {
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    flex: 1,
  },
  addSingleButtonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12,
    textAlign: "center",
  },
  removeSuggestionButton: {
    backgroundColor: colors.danger,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    flex: 1,
  },
  removeSuggestionButtonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12,
    textAlign: "center",
  },
  input: {
    backgroundColor: colors.surfaceSoft,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  greenButton: {
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginTop: spacing.xs,
  },
  greenButtonText: {
    color: colors.text,
    textAlign: "center",
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 14,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text,
    textAlign: "center",
    fontWeight: "700",
  },
  groupWrap: {
    marginBottom: spacing.lg,
  },
  groupTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  itemNameChecked: {
    textDecorationLine: "line-through",
    color: colors.textMuted,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  minusButton: {
    backgroundColor: colors.surfaceSoft,
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  plusButton: {
    backgroundColor: colors.success,
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  quantityDisplay: {
    flex: 1,
    marginHorizontal: spacing.sm,
    backgroundColor: colors.surfaceSoft,
    borderRadius: 12,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quantityText: {
    color: colors.text,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  actionRow: {
    flexDirection: "row",
  },
  flexButton: {
    paddingVertical: spacing.md,
    borderRadius: 12,
    flex: 1,
  },
  defaultButton: {
    backgroundColor: colors.surfaceSoft,
    marginRight: spacing.xs,
  },
  boughtButton: {
    backgroundColor: colors.success,
    marginRight: spacing.xs,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    marginLeft: spacing.xs,
  },
  buttonText: {
    color: colors.text,
    textAlign: "center",
    fontWeight: "700",
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: "center",
  },
});