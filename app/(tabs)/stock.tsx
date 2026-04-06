import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { loadStockItems, saveStockItems, StockItem } from '../../utils/appstorage';
export default function StockScreen() {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [lowStockLevel, setLowStockLevel] = useState('');
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
    setName('');
    setQuantity('');
    setUnit('');
    setLowStockLevel('');
    setEditingId(null);
  };

  const saveItem = async () => {
    if (!name || !quantity) return;

    if (editingId) {
      const updated = stockItems.map((item) =>
        item.id === editingId
          ? {
              ...item,
              name,
              quantity,
              unit,
              lowStockLevel,
            }
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

  const lowStockCount = useMemo(() => {
    return stockItems.filter(isLowStock).length;
  }, [stockItems]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Stock</Text>
      <Text style={styles.subtitle}>Track what you already have at home</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Stock Summary</Text>
        <Text style={styles.info}>Items: {stockItems.length}</Text>
        <Text style={styles.info}>Low stock: {lowStockCount}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {editingId ? 'Edit Stock Item' : 'Add Stock Item'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Item name"
          placeholderTextColor="#777"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Quantity"
          placeholderTextColor="#777"
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
        />

        <TextInput
          style={styles.input}
          placeholder="Unit (e.g. kg, packs, bottles)"
          placeholderTextColor="#777"
          value={unit}
          onChangeText={setUnit}
        />

        <TextInput
          style={styles.input}
          placeholder="Low stock level"
          placeholderTextColor="#777"
          keyboardType="numeric"
          value={lowStockLevel}
          onChangeText={setLowStockLevel}
        />

        <TouchableOpacity style={styles.primaryButton} onPress={saveItem}>
          <Text style={styles.primaryButtonText}>
            {editingId ? 'Save Changes' : 'Save Stock Item'}
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
                Quantity: {item.quantity} {item.unit || ''}
              </Text>

              {!!item.lowStockLevel && (
                <Text style={styles.info}>Low stock level: {item.lowStockLevel}</Text>
              )}

              <View
                style={[
                  styles.statusBadge,
                  isLowStock(item) ? styles.lowBadge : styles.goodBadge,
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {isLowStock(item) ? 'Low stock' : 'In stock'}
                </Text>
              </View>

              <TouchableOpacity style={styles.editButton} onPress={() => startEdit(item)}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteItem(item.id)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 20, paddingBottom: 120 },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#8f95a3',
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#111218',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
  },
  input: {
    backgroundColor: '#23242b',
    color: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  info: {
    color: '#b5b5b5',
    marginTop: 4,
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: '#2d2f38',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  itemCard: {
    backgroundColor: '#1a1c23',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  itemTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusBadge: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  goodBadge: {
    backgroundColor: '#1f7a3d',
  },
  lowBadge: {
    backgroundColor: '#8b1e1e',
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  editButton: {
    backgroundColor: '#3a3f4b',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#8b1e1e',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyText: {
    color: '#8f95a3',
    fontSize: 14,
  },
});