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
              <View style={styles.sectionCard}>
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
                        style={styles.smallAddButton}
                        onPress={() => addSingleSuggestionToShopping(item.id)}
                      >
                        <Text style={styles.smallAddButtonText}>Add</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.smallRemoveButton}
                        onPress={() => removeSuggestion(item.id)}
                      >
                        <Text style={styles.smallRemoveButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  onPress={addSuggestionsToShopping}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>Add All Suggestions</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Add Item Manually</Text>

              <TextInput
                value={newItemName}
                onChangeText={setNewItemName}
                placeholder="Item name"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />

              <View style={styles.inlineInputsRow}>
                <TextInput
                  value={newItemQuantity}
                  onChangeText={setNewItemQuantity}
                  placeholder="Qty"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={[styles.input, styles.inlineInput]}
                />

                <TextInput
                  value={newItemUnit}
                  onChangeText={setNewItemUnit}
                  placeholder="Unit"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, styles.inlineInput]}
                />
              </View>

              <TouchableOpacity onPress={addManualItem} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Add Item</Text>
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
                <View style={styles.itemTopRow}>
                  <View style={styles.itemTextWrap}>
                    <Text
                      style={[
                        styles.itemName,
                        item.checked && styles.itemNameChecked,
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.itemMeta,
                        item.checked && styles.itemMetaChecked,
                      ]}
                    >
                      {item.quantity} {item.unit}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => toggleItem(item.id)}
                    style={[
                      styles.statusPill,
                      item.checked ? styles.boughtPill : styles.pendingPill,
                    ]}
                  >
                    <Text style={styles.statusPillText}>
                      {item.checked ? "Bought" : "Pending"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.itemBottomRow}>
                  <View style={styles.compactQuantityControls}>
                    <TouchableOpacity
                      onPress={() => changeItemQuantity(item.id, -1)}
                      style={styles.quantityButton}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>

                    <View style={styles.quantityBadge}>
                      <Text style={styles.quantityBadgeText}>
                        {item.quantity}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => changeItemQuantity(item.id, 1)}
                      style={styles.quantityButton}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.itemActionsRight}>
                    <TouchableOpacity
                      onPress={() => toggleItem(item.id)}
                      style={[
                        styles.smallActionButton,
                        item.checked ? styles.uncheckButton : styles.checkButton,
                      ]}
                    >
                      <Text style={styles.smallActionButtonText}>
                        {item.checked ? "Undo" : "Mark"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => deleteItem(item.id)}
                      style={[styles.smallActionButton, styles.deleteButton]}
                    >
                      <Text style={styles.smallActionButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
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
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    color: colors.textMuted,
    marginBottom: spacing.md,
    fontSize: 13,
  },
  suggestionRow: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionTextWrap: {
    marginBottom: 8,
  },
  suggestionName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  suggestionMeta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  suggestionButtonGroup: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  smallAddButton: {
    flex: 1,
    backgroundColor: colors.success,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  smallAddButtonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12,
  },
  smallRemoveButton: {
    flex: 1,
    backgroundColor: colors.danger,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  smallRemoveButtonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12,
  },
  input: {
    backgroundColor: colors.surfaceSoft,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 14,
  },
  inlineInputsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  inlineInput: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: colors.success,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 2,
  },
  primaryButtonText: {
    color: colors.text,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 14,
  },
  groupWrap: {
    marginBottom: spacing.lg,
  },
  groupTitle: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  itemTextWrap: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 3,
  },
  itemNameChecked: {
    textDecorationLine: "line-through",
    color: colors.textMuted,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  itemMetaChecked: {
    color: colors.textMuted,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pendingPill: {
    backgroundColor: colors.surfaceSoft,
  },
  boughtPill: {
    backgroundColor: colors.success,
  },
  statusPillText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
  },
  itemBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  compactQuantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  quantityButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 20,
  },
  quantityBadge: {
    minWidth: 42,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
  },
  quantityBadgeText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 13,
  },
  itemActionsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  smallActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  checkButton: {
    backgroundColor: colors.surfaceSoft,
  },
  uncheckButton: {
    backgroundColor: colors.success,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  smallActionButtonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: "center",
    fontSize: 14,
  },
});