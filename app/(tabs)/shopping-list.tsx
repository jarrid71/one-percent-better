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
      if (saved) setItems(JSON.parse(saved));
    } catch (error) {
      console.log("Error loading shopping list:", error);
    }
  };

  const saveShoppingList = async (updatedItems: ShoppingListItem[]) => {
    try {
      await AsyncStorage.setItem(
        "shoppingList",
        JSON.stringify(updatedItems)
      );
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
      name: newItemName,
      quantity: newItemQuantity,
      unit: newItemUnit,
      checked: false,
    };

    saveShoppingList([newItem, ...items]);

    setNewItemName("");
    setNewItemQuantity("");
    setNewItemUnit("");
  };

  const toggleItem = (id: string) => {
    const updated = items.map((i) =>
      i.id === id ? { ...i, checked: !i.checked } : i
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
              <Text style={styles.subtitle}>
                Items you need to buy
              </Text>
            </View>

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
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Qty"
                  placeholderTextColor={colors.textMuted}
                  value={newItemQuantity}
                  onChangeText={setNewItemQuantity}
                />

                <TextInput
                  style={[styles.input, { flex: 1 }]}
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
                <Text style={styles.primaryButtonText}>
                  Add Item
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={clearCheckedItems}
            >
              <Text style={styles.secondaryButtonText}>
                Clear Checked
              </Text>
            </TouchableOpacity>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.rowBetween}>
              <View>
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
    },
    title: {
      fontSize: 26,
      fontWeight: "800",
      color: colors.text,
    },
    subtitle: {
      color: colors.textSecondary,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: SPACING.md,
      marginBottom: SPACING.lg,
    },
    sectionTitle: {
      color: colors.text,
      fontWeight: "700",
      marginBottom: SPACING.sm,
    },
    input: {
      backgroundColor: colors.surface,
      color: colors.text,
      borderRadius: 12,
      padding: 12,
      marginBottom: SPACING.sm,
    },
    row: {
      flexDirection: "row",
      gap: SPACING.sm,
    },
    rowBetween: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: SPACING.sm,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 12,
      alignItems: "center",
    },
    primaryButtonText: {
      color: "#fff",
      fontWeight: "700",
    },
    secondaryButton: {
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 12,
      alignItems: "center",
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
    },
    status: {
      backgroundColor: colors.surface,
      padding: 6,
      borderRadius: 8,
    },
    statusText: {
      color: colors.text,
    },
    smallButton: {
      backgroundColor: colors.primary,
      padding: 8,
      borderRadius: 8,
    },
    delete: {
      backgroundColor: colors.danger,
    },
    smallButtonText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "700",
    },
  });