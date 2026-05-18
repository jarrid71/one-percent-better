// app/(tabs)/stock.tsx

import { CameraView, useCameraPermissions } from "expo-camera";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
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

  const [permission, requestPermission] = useCameraPermissions();

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [lowStockLevel, setLowStockLevel] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  const [scannerVisible, setScannerVisible] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  const refreshStockItems = async () => {
    const items = await loadStockItems();
    setStockItems(items);
  };

  useEffect(() => {
    refreshStockItems();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshStockItems();
    }, [])
  );

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

  const openScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();

      if (!result.granted) {
        Alert.alert(
          "Camera permission needed",
          "Please allow camera access to scan barcodes."
        );
        return;
      }
    }

    setHasScanned(false);
    setScannerVisible(true);
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (hasScanned) return;

    setHasScanned(true);

    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${data}.json`
      );

      const result = await response.json();
      const product = result?.product;

      if (product) {
        const brandName = product.brands?.trim();

        const productLabel =
          product.product_name?.trim() ||
          product.generic_name?.trim() ||
          "";

        const productName =
          brandName && productLabel
            ? `${brandName} ${productLabel}`
            : productLabel || brandName || data;

        setName(productName);

        if (product.quantity) {
          setUnit(product.quantity);
        }

        Alert.alert(
          "Product found",
          `Added "${productName}" from barcode scan.`
        );
      } else {
        setName(data);

        Alert.alert(
          "Product not found",
          "Barcode scanned, but no product data was found."
        );
      }
    } catch (error) {
      console.log(error);

      setName(data);

      Alert.alert("Scan error", "Could not fetch product details.");
    }

    setScannerVisible(false);
  };

  const saveItem = async () => {
    if (!name || !quantity) return;

    if (editingId) {
      const updated = stockItems.map((item) =>
        item.id === editingId
          ? {
              ...item,
              name: name.trim(),
              quantity: quantity.trim(),
              unit: unit.trim(),
              lowStockLevel: lowStockLevel.trim(),
            }
          : item
      );

      await persist(updated);
    } else {
      const newItem: StockItem = {
        id: Date.now().toString(),
        name: name.trim(),
        quantity: quantity.trim(),
        unit: unit.trim(),
        lowStockLevel: lowStockLevel.trim(),
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

    if (editingId === id) {
      resetForm();
    }
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
    <>
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

          <TouchableOpacity style={styles.scanButton} onPress={openScanner}>
            <Text style={styles.scanButtonText}>Scan Barcode</Text>
          </TouchableOpacity>

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

          <TouchableOpacity style={styles.primaryButton} onPress={saveItem}>
            <Text style={styles.primaryButtonText}>
              {editingId ? "Save Changes" : "Save Stock Item"}
            </Text>
          </TouchableOpacity>

          {editingId && (
            <TouchableOpacity style={styles.secondaryButton} onPress={resetForm}>
              <Text style={styles.secondaryButtonText}>Cancel Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Home Stock</Text>

          {stockItems.length === 0 ? (
            <Text style={styles.emptyText}>No stock items added yet.</Text>
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
                    isLowStock(item) ? styles.lowBadge : styles.goodBadge,
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
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={scannerVisible} animationType="slide">
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: [
                "ean13",
                "ean8",
                "upc_a",
                "upc_e",
                "qr",
                "code128",
                "code39",
              ],
            }}
            onBarcodeScanned={hasScanned ? undefined : handleBarcodeScanned}
          />

          <View style={styles.scannerFooter}>
            <Text style={styles.scannerTitle}>Scan a barcode</Text>

            <Text style={styles.scannerText}>
              Point your camera at the product barcode.
            </Text>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setScannerVisible(false)}
            >
              <Text style={styles.secondaryButtonText}>Cancel Scan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
      color: colors.background,
      fontWeight: "700",
    },
    scanButton: {
      backgroundColor: colors.surface,
      padding: 14,
      borderRadius: 14,
      alignItems: "center",
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    scanButtonText: {
      color: colors.primary,
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
      color: colors.background,
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
      color: colors.background,
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
      color: colors.background,
      fontWeight: "700",
    },
    emptyText: {
      color: colors.textSecondary,
    },
    scannerContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    camera: {
      flex: 1,
    },
    scannerFooter: {
      backgroundColor: colors.card,
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    scannerTitle: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 6,
    },
    scannerText: {
      color: colors.textSecondary,
      fontSize: 14,
      marginBottom: 10,
    },
  });