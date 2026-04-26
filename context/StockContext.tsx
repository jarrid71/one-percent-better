import {
  loadStockItems,
  saveStockItems,
  StockItem,
} from "@/utils/appstorage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

type StockContextType = {
  stock: StockItem[];
  addToStock: (item: StockItem) => Promise<void>;
  refreshStock: () => Promise<void>;
};

const StockContext = createContext<StockContextType | undefined>(undefined);

export function StockProvider({ children }: { children: ReactNode }) {
  const [stock, setStock] = useState<StockItem[]>([]);

  const refreshStock = async () => {
    const items = await loadStockItems();
    setStock(items);
  };

  useEffect(() => {
    refreshStock();
  }, []);

  const addToStock = async (item: StockItem) => {
    const currentStock = await loadStockItems();

    const existingIndex = currentStock.findIndex(
      (s) => s.name.toLowerCase() === item.name.toLowerCase()
    );

    if (existingIndex >= 0) {
      const updated = [...currentStock];
      const existing = updated[existingIndex];

      updated[existingIndex] = {
        ...existing,
        quantity: String(
          (Number(existing.quantity) || 0) +
          (Number(item.quantity) || 0)
        ),
      };

      await saveStockItems(updated);
      setStock(updated);
      return;
    }

    const newItem: StockItem = {
      ...item,
      id: Date.now().toString(),
      lowStockLevel: "1",
    };

    const updated = [newItem, ...currentStock];

    await saveStockItems(updated);
    setStock(updated);
  };

  return (
    <StockContext.Provider value={{ stock, addToStock, refreshStock }}>
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error("useStock must be used within StockProvider");
  }
  return context;
}