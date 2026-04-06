import AsyncStorage from '@react-native-async-storage/async-storage';

export type StockItem = {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  lowStockLevel: string;
};

const STOCK_KEY = 'one_percent_better_stock_items';

export async function loadStockItems(): Promise<StockItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STOCK_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.log('Failed to load stock items', error);
    return [];
  }
}

export async function saveStockItems(items: StockItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STOCK_KEY, JSON.stringify(items));
  } catch (error) {
    console.log('Failed to save stock items', error);
  }
}