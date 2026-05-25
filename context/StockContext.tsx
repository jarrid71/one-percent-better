import { Meal } from "@/constants/mealMatcher";
import {
  loadStockItems,
  saveStockItems,
  StockItem,
} from "@/utils/appstorage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type StockContextType = {
  stock: StockItem[];
  addToStock: (item: StockItem) => Promise<void>;
  cookMeal: (meal: Meal) => Promise<void>;
  refreshStock: () => Promise<void>;
};

const StockContext = createContext<StockContextType | undefined>(undefined);

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

function parseAmount(value: string) {
  const numberMatch = value.match(/[\d.]+/);

  if (!numberMatch) {
    return 1;
  }

  return Number(numberMatch[0]) || 1;
}

function parseUnit(value: string) {
  const cleaned = value.toLowerCase();

  if (cleaned.includes("kg")) return "kg";
  if (cleaned.includes("g")) return "g";

  if (cleaned.includes("litre") || cleaned.includes("liter")) {
    return "l";
  }

  if (cleaned.includes("ml")) return "ml";
  if (cleaned.includes("tbsp")) return "tbsp";
  if (cleaned.includes("tsp")) return "tsp";
  if (cleaned.includes("cup")) return "cup";

  return "";
}

function convertToBaseAmount(quantity: number, unit: string) {
  switch (unit) {
    case "kg":
      return quantity * 1000;

    case "g":
      return quantity;

    case "l":
      return quantity * 1000;

    case "ml":
      return quantity;

    case "tbsp":
      return quantity * 15;

    case "tsp":
      return quantity * 5;

    case "cup":
      return quantity * 250;

    default:
      return quantity;
  }
}

function convertFromBaseAmount(quantity: number, unit: string) {
  switch (unit) {
    case "kg":
      return quantity / 1000;

    case "g":
      return quantity;

    case "l":
      return quantity / 1000;

    case "ml":
      return quantity;

    case "tbsp":
      return quantity / 15;

    case "tsp":
      return quantity / 5;

    case "cup":
      return quantity / 250;

    default:
      return quantity;
  }
}

function getUnitFamily(unit: string) {
  if (["kg", "g"].includes(unit)) {
    return "weight";
  }

  if (["l", "ml", "tbsp", "tsp", "cup"].includes(unit)) {
    return "volume";
  }

  return "count";
}

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
      (s) => normalizeName(s.name) === normalizeName(item.name)
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

  const cookMeal = async (meal: Meal) => {
    const currentStock = await loadStockItems();

    let updatedStock = [...currentStock];

    meal.ingredients.forEach((ingredient) => {
      const ingredientName = normalizeName(ingredient.name);

      const ingredientAmountText = ingredient.amount ?? "1";

      const ingredientAmount = parseAmount(ingredientAmountText);

      const ingredientUnit = parseUnit(ingredientAmountText);

      const stockIndex = updatedStock.findIndex((stockItem) => {
        const stockName = normalizeName(stockItem.name);

        return (
          stockName === ingredientName ||
          stockName.includes(ingredientName) ||
          ingredientName.includes(stockName)
        );
      });

      if (stockIndex < 0) {
        return;
      }

      const stockItem = updatedStock[stockIndex];

      const stockQuantity = Number(stockItem.quantity) || 0;

      const stockUnit = parseUnit(stockItem.unit);

      const ingredientFamily = getUnitFamily(ingredientUnit);

      const stockFamily = getUnitFamily(stockUnit);

      if (ingredientFamily !== stockFamily) {
        return;
      }

      const stockBaseAmount = convertToBaseAmount(
        stockQuantity,
        stockUnit
      );

      const ingredientBaseAmount = convertToBaseAmount(
        ingredientAmount,
        ingredientUnit
      );

      const newBaseAmount = Math.max(
        stockBaseAmount - ingredientBaseAmount,
        0
      );

      const newDisplayAmount = convertFromBaseAmount(
        newBaseAmount,
        stockUnit
      );

      updatedStock[stockIndex] = {
        ...stockItem,
        quantity: String(Number(newDisplayAmount.toFixed(2))),
      };
    });

    updatedStock = updatedStock.filter(
      (item) => Number(item.quantity) > 0
    );

    await saveStockItems(updatedStock);

    setStock(updatedStock);
  };

  return (
    <StockContext.Provider
      value={{
        stock,
        addToStock,
        cookMeal,
        refreshStock,
      }}
    >
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