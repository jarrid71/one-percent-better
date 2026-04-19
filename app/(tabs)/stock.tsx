import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "@/context/ThemeContext";
import {
  loadStockItems,
  saveStockItems,
  StockItem,
} from "../../utils/appstorage";

export default function StockScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [lowStockLevel, setLowStockLevel] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const items = await loadStockItems();
      setStockItems(items);
    };
    load();
  }, []);

  const persist = async (items: StockItem[]) => {
    setStockItems(items);
    await saveStockItems(items);
  };

  const resetForm = () => {
    setName("");
    setQuantity("");
    setUnit("");
    setLowStockLevel("");
    setEditingId(null);
  };

  const saveItem = async () => {
    if (!name || !quantity) return;

    if (editingId) {
      const updated = stockItems.map((item) =>
        item.id === editingId
          ? { ...item, name, quantity, unit, lowStockLevel }
          : item
      );
      await persist(updated);
    } else {
      const newItem: StockItem = {
        id: Date.now().toString(),
        name,
        quantity,
        unit,
        lowStockLevel,
      };
      await persist([newItem, ...stockItems]);
    }

    resetForm();
  };

  const startEdit = (item: StockItem) => {
    setEditingId(item.id);
    setName(item.name);
    setQuantity(item.quantity);
    setUnit(item.unit);
    setLowStockLevel(item.lowStockLevel);
  };

  const deleteItem = async (id: string) => {
    const updated = stockItems.filter((item) => item.id !== id);
    await persist(updated);

    if (editingId === id) resetForm();
  };

  const isLowStock = (item: StockItem) => {
    const qty = Number(item.quantity);
    const low = Number(item.lowStockLevel);
    if (!item.lowStockLevel) return false;
    if (Number.isNaN(qty) || Number.isNaN(low)) return false;
    return qty <= low;
  };

  const lowStockCount = useMemo(
    () => stockItems.filter(isLowStock).length,
    [stockItems]
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Stock</Text>
      <Text style={styles.subtitle}>
        Track what you already have at home
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Stock Summary</Text>
        <Text style={styles.info}>Items: {stockItems.length}</Text>
        <Text style={styles.info}>Low stock: {lowStockCount}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {editingId ? "Edit Stock Item" : "Add Stock Item"}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Item name"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Quantity"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
        />

        <TextInput
          style={styles.input}
          placeholder="Unit"
          placeholderTextColor={colors.textMuted}
          value={unit}
          onChangeText={setUnit}
        />

        <TextInput
          style={styles.input}
          placeholder="Low stock level"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={lowStockLevel}
          onChangeText={setLowStockLevel}
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={saveItem}
        >
          <Text style={styles.primaryButtonText}>
            {editingId ? "Save Changes" : "Save Stock Item"}
          </Text>
        </TouchableOpacity>

        {editingId && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={resetForm}
          >
            <Text style={styles.secondaryButtonText}>
              Cancel Edit
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Home Stock</Text>

        {stockItems.length === 0 ? (
          <Text style={styles.emptyText}>
            No stock items added yet.
          </Text>
        ) : (
          stockItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{item.name}</Text>

              <Text style={styles.info}>
                Quantity: {item.quantity} {item.unit || ""}
              </Text>

              {!!item.lowStockLevel && (
                <Text style={styles.info}>
                  Low stock level: {item.lowStockLevel}
                </Text>
              )}

              <View
                style={[
                  styles.statusBadge,
                  isLowStock(item)
                    ? styles.lowBadge
                    : styles.goodBadge,
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {isLowStock(item) ? "Low stock" : "In stock"}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => startEdit(item)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteItem(item.id)}
              >
                <Text style={styles.deleteButtonText}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
      paddingBottom: 120,
    },
    title: {
      fontSize: 34,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: 18,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 18,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 14,
    },
    input: {
      backgroundColor: colors.surface,
      color: colors.text,
      padding: 16,
      borderRadius: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    info: {
      color: colors.textSecondary,
      marginTop: 4,
      fontSize: 14,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 14,
      alignItems: "center",
      marginTop: 4,
    },
    primaryButtonText: {
      color: "#fff",
      fontWeight: "700",
    },
    secondaryButton: {
      backgroundColor: colors.surface,
      padding: 14,
      borderRadius: 14,
      alignItems: "center",
      marginTop: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: {
      color: colors.text,
      fontWeight: "700",
    },
    itemCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    itemTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 8,
    },
    statusBadge: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 12,
      marginTop: 12,
      alignSelf: "flex-start",
    },
    goodBadge: {
      backgroundColor: colors.success,
    },
    lowBadge: {
      backgroundColor: colors.danger,
    },
    statusBadgeText: {
      color: "#fff",
      fontWeight: "700",
    },
    editButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 12,
    },
    editButtonText: {
      color: "#fff",
      fontWeight: "700",
    },
    deleteButton: {
      backgroundColor: colors.danger,
      padding: 12,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 10,
    },
    deleteButtonText: {
      color: "#fff",
      fontWeight: "700",
    },
    emptyText: {
      color: colors.textSecondary,
    },
  });