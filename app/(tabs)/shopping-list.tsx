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

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";

import { SPACING } from "@/constants/spacing";
import { useShoppingSuggestions } from "@/context/ShoppingSuggestionsContext";
import { useAppTheme } from "@/context/ThemeContext";
import {
    loadStockItems,
    StockItem as PantryStockItem,
    saveStockItems,
} from "@/utils/appstorage";

type ShoppingListItem = {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  checked?: boolean;
};

export default function ShoppingListScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");

  const { suggestions, removeSuggestion, clearSuggestions } =
    useShoppingSuggestions();

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
    if (!newItemName || !newItemQuantity || !newItemUnit) {
      Alert.alert("Missing info", "Fill all fields");
      return;
    }

    const newItem: ShoppingListItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      quantity: newItemQuantity.trim(),
      unit: newItemUnit.trim(),
      checked: false,
    };

    saveShoppingList([newItem, ...items]);

    setNewItemName("");
    setNewItemQuantity("");
    setNewItemUnit("");
  };

  const addSuggestionToList = (suggestionId: string) => {
    const suggestion = suggestions.find((item) => item.id === suggestionId);

    if (!suggestion) {
      return;
    }

    const alreadyExists = items.some(
      (item) =>
        item.name.trim().toLowerCase() === suggestion.name.trim().toLowerCase()
    );

    if (alreadyExists) {
      Alert.alert(
        "Already added",
        `${suggestion.name} is already in your shopping list.`
      );
      removeSuggestion(suggestionId);
      return;
    }

    const newItem: ShoppingListItem = {
      id: Date.now().toString(),
      name: suggestion.name,
      quantity: suggestion.amount?.trim() || "1",
      unit: suggestion.category?.trim() || "",
      checked: false,
    };

    saveShoppingList([newItem, ...items]);
    removeSuggestion(suggestionId);
  };

  const addAllSuggestionsToList = () => {
    if (suggestions.length === 0) {
      Alert.alert("No suggestions", "There are no suggestions to add.");
      return;
    }

    const existingNames = new Set(
      items.map((item) => item.name.trim().toLowerCase())
    );

    const newItems: ShoppingListItem[] = [];

    suggestions.forEach((suggestion, index) => {
      const normalizedName = suggestion.name.trim().toLowerCase();

      if (existingNames.has(normalizedName)) {
        return;
      }

      existingNames.add(normalizedName);

      newItems.push({
        id: `${Date.now()}-${index}`,
        name: suggestion.name,
        quantity: suggestion.amount?.trim() || "1",
        unit: suggestion.category?.trim() || "",
        checked: false,
      });
    });

    if (newItems.length === 0) {
      Alert.alert(
        "Nothing added",
        "All suggested items are already in your shopping list."
      );
      clearSuggestions();
      return;
    }

    saveShoppingList([...newItems, ...items]);
    clearSuggestions();

    Alert.alert(
      "Added to shopping list",
      `${newItems.length} suggestion${newItems.length === 1 ? "" : "s"} added.`
    );
  };

  const addItemToStock = async (item: ShoppingListItem) => {
    try {
      const currentStock = await loadStockItems();

      const existingStockIndex = currentStock.findIndex(
        (stockItem) =>
          stockItem.name.trim().toLowerCase() === item.name.trim().toLowerCase()
      );

      if (existingStockIndex >= 0) {
        const existingItem = currentStock[existingStockIndex];
        const existingQuantity = Number(existingItem.quantity) || 0;
        const incomingQuantity = Number(item.quantity) || 0;

        const updatedStock = [...currentStock];
        updatedStock[existingStockIndex] = {
          ...existingItem,
          quantity: String(existingQuantity + incomingQuantity),
          unit: existingItem.unit || item.unit || "",
        };

        await saveStockItems(updatedStock);
        return;
      }

      const newStockItem: PantryStockItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: item.name.trim(),
        quantity: item.quantity.trim() || "1",
        unit: item.unit.trim() || "",
        lowStockLevel: "1",
      };

      await saveStockItems([newStockItem, ...currentStock]);
    } catch (error) {
      console.log("Error adding item to stock:", error);
    }
  };

  const toggleItem = async (id: string) => {
    const currentItem = items.find((item) => item.id === id);

    if (!currentItem) {
      return;
    }

    const willBeChecked = !currentItem.checked;

    if (willBeChecked) {
      await addItemToStock(currentItem);

      const updated = items.filter((item) => item.id !== id);
      saveShoppingList(updated);

      return;
    }

    const updated = items.map((item) =>
      item.id === id ? { ...item, checked: willBeChecked } : item
    );

    saveShoppingList(updated);
  };

  const deleteItem = (id: string) => {
    saveShoppingList(items.filter((i) => i.id !== id));
  };

  const clearCheckedItems = () => {
    saveShoppingList(items.filter((i) => !i.checked));
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.heroCard}>
              <Text style={styles.title}>Shopping List</Text>
              <Text style={styles.subtitle}>Items you need to buy</Text>
            </View>

            {suggestions.length > 0 && (
              <View style={styles.card}>
                <View style={styles.suggestionsHeader}>
                  <View style={styles.suggestionsHeaderTextWrap}>
                    <Text style={styles.sectionTitle}>Suggestions</Text>
                    <Text style={styles.suggestionsSubtitle}>
                      Missing ingredients from your meals
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.addAllButton}
                    onPress={addAllSuggestionsToList}
                  >
                    <Text style={styles.addAllButtonText}>Add All</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.suggestionsList}>
                  {suggestions.map((suggestion) => (
                    <View key={suggestion.id} style={styles.suggestionCard}>
                      <View style={styles.suggestionTopRow}>
                        <View style={styles.suggestionTextWrap}>
                          <Text style={styles.suggestionName}>
                            {suggestion.name}
                          </Text>

                          {!!suggestion.amount && (
                            <Text style={styles.suggestionMeta}>
                              Amount: {suggestion.amount}
                            </Text>
                          )}
                        </View>

                        {!!suggestion.category && (
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>
                              {suggestion.category}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.suggestionActions}>
                        <TouchableOpacity
                          style={styles.suggestionAddButton}
                          onPress={() => addSuggestionToList(suggestion.id)}
                        >
                          <Text style={styles.suggestionAddButtonText}>
                            Add
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.suggestionRemoveButton}
                          onPress={() => removeSuggestion(suggestion.id)}
                        >
                          <Text style={styles.suggestionRemoveButtonText}>
                            Remove
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Add Item</Text>

              <TextInput
                style={styles.input}
                placeholder="Item name"
                placeholderTextColor={colors.textMuted}
                value={newItemName}
                onChangeText={setNewItemName}
              />

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.rowInput]}
                  placeholder="Qty"
                  placeholderTextColor={colors.textMuted}
                  value={newItemQuantity}
                  onChangeText={setNewItemQuantity}
                />

                <TextInput
                  style={[styles.input, styles.rowInput]}
                  placeholder="Unit"
                  placeholderTextColor={colors.textMuted}
                  value={newItemUnit}
                  onChangeText={setNewItemUnit}
                />
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={addManualItem}
              >
                <Text style={styles.primaryButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={clearCheckedItems}
            >
              <Text style={styles.secondaryButtonText}>Clear Checked</Text>
            </TouchableOpacity>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.rowBetween}>
              <View style={styles.itemTextWrap}>
                <Text
                  style={[
                    styles.itemName,
                    item.checked && styles.itemChecked,
                  ]}
                >
                  {item.name}
                </Text>
                <Text style={styles.itemMeta}>
                  {item.quantity} {item.unit}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => toggleItem(item.id)}
                style={styles.status}
              >
                <Text style={styles.statusText}>
                  {item.checked ? "Done" : "Pending"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rowBetween}>
              <TouchableOpacity
                onPress={() => toggleItem(item.id)}
                style={styles.smallButton}
              >
                <Text style={styles.smallButtonText}>
                  {item.checked ? "Undo" : "Mark"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => deleteItem(item.id)}
                style={[styles.smallButton, styles.delete]}
              >
                <Text style={styles.smallButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    content: {
      padding: SPACING.lg,
      paddingBottom: 120,
    },
    heroCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: SPACING.lg,
      marginBottom: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontSize: 26,
      fontWeight: "800",
      color: colors.text,
    },
    subtitle: {
      color: colors.textSecondary,
      marginTop: 4,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: SPACING.md,
      marginBottom: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      color: colors.text,
      fontWeight: "700",
      marginBottom: SPACING.sm,
      fontSize: 16,
    },
    suggestionsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    suggestionsHeaderTextWrap: {
      flex: 1,
    },
    suggestionsSubtitle: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 2,
    },
    addAllButton: {
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 10,
    },
    addAllButtonText: {
      color: colors.background,
      fontWeight: "700",
      fontSize: 13,
    },
    suggestionsList: {
      gap: SPACING.sm,
    },
    suggestionCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    suggestionTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    suggestionTextWrap: {
      flex: 1,
    },
    suggestionName: {
      color: colors.text,
      fontWeight: "700",
      fontSize: 14,
    },
    suggestionMeta: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    categoryBadge: {
      backgroundColor: colors.primaryLight,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
      alignSelf: "flex-start",
    },
    categoryBadgeText: {
      color: colors.text,
      fontWeight: "700",
      fontSize: 11,
    },
    suggestionActions: {
      flexDirection: "row",
      gap: SPACING.sm,
    },
    suggestionAddButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: "center",
    },
    suggestionAddButtonText: {
      color: colors.background,
      fontWeight: "700",
      fontSize: 13,
    },
    suggestionRemoveButton: {
      flex: 1,
      backgroundColor: colors.surfaceSoft,
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    suggestionRemoveButtonText: {
      color: colors.text,
      fontWeight: "700",
      fontSize: 13,
    },
    input: {
      backgroundColor: colors.surface,
      color: colors.text,
      borderRadius: 12,
      padding: 12,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    row: {
      flexDirection: "row",
      gap: SPACING.sm,
    },
    rowInput: {
      flex: 1,
    },
    rowBetween: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: SPACING.sm,
      gap: SPACING.sm,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 12,
      alignItems: "center",
    },
    primaryButtonText: {
      color: colors.background,
      fontWeight: "700",
    },
    secondaryButton: {
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: {
      color: colors.text,
      fontWeight: "700",
    },
    itemCard: {
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 12,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    itemTextWrap: {
      flex: 1,
    },
    itemName: {
      color: colors.text,
      fontWeight: "700",
    },
    itemChecked: {
      textDecorationLine: "line-through",
      color: colors.textMuted,
    },
    itemMeta: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    status: {
      backgroundColor: colors.surface,
      padding: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statusText: {
      color: colors.text,
    },
    smallButton: {
      backgroundColor: colors.primary,
      padding: 8,
      borderRadius: 8,
      minWidth: 72,
      alignItems: "center",
    },
    delete: {
      backgroundColor: colors.danger,
    },
    smallButtonText: {
      color: colors.background,
      fontSize: 12,
      fontWeight: "700",
    },
  });