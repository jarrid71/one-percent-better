import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

export type ShoppingSuggestion = {
  id: string;
  name: string;
  amount?: string;
  category?: string;
};

type AddSuggestionInput = {
  name: string;
  amount?: string;
  category?: string;
};

type ShoppingSuggestionsContextType = {
  suggestions: ShoppingSuggestion[];
  addSuggestion: (item: AddSuggestionInput) => void;
  addSuggestions: (items: AddSuggestionInput[]) => void;
  removeSuggestion: (id: string) => void;
  clearSuggestions: () => void;
};

const ShoppingSuggestionsContext = createContext<
  ShoppingSuggestionsContextType | undefined
>(undefined);

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

function getAutoCategory(name: string) {
  const normalized = normalizeName(name);

  const proteinKeywords = [
    "chicken",
    "beef",
    "steak",
    "mince",
    "turkey",
    "pork",
    "bacon",
    "ham",
    "salmon",
    "tuna",
    "fish",
    "egg",
    "eggs",
    "protein",
    "yogurt",
    "greek yogurt",
  ];

  const carbsKeywords = [
    "rice",
    "pasta",
    "noodle",
    "bread",
    "wrap",
    "tortilla",
    "oats",
    "potato",
    "sweet potato",
    "cereal",
    "quinoa",
  ];

  const vegetableKeywords = [
    "broccoli",
    "spinach",
    "lettuce",
    "tomato",
    "tomatoes",
    "onion",
    "carrot",
    "capsicum",
    "pepper",
    "zucchini",
    "cucumber",
    "mushroom",
    "garlic",
    "avocado",
  ];

  const fruitKeywords = [
    "apple",
    "banana",
    "berries",
    "berry",
    "blueberry",
    "strawberry",
    "orange",
    "grape",
    "watermelon",
    "pineapple",
    "mango",
    "kiwi",
    "lemon",
    "lime",
  ];

  const dairyKeywords = [
    "milk",
    "cheese",
    "butter",
    "cream",
    "yoghurt",
    "yogurt",
    "mozzarella",
    "parmesan",
    "feta",
  ];

  const drinksKeywords = [
    "juice",
    "water",
    "soft drink",
    "soda",
    "coffee",
    "tea",
    "milkshake",
  ];

  const pantryKeywords = [
    "salt",
    "pepper",
    "oil",
    "olive oil",
    "sauce",
    "soy sauce",
    "bbq sauce",
    "tomato sauce",
    "spice",
    "flour",
    "sugar",
    "honey",
    "peanut butter",
    "jam",
    "vinegar",
    "stock",
  ];

  const matchesKeyword = (keywords: string[]) =>
    keywords.some((keyword) => normalized.includes(keyword));

  if (matchesKeyword(proteinKeywords)) return "Protein";
  if (matchesKeyword(carbsKeywords)) return "Carbs";
  if (matchesKeyword(vegetableKeywords)) return "Vegetables";
  if (matchesKeyword(fruitKeywords)) return "Fruit";
  if (matchesKeyword(dairyKeywords)) return "Dairy";
  if (matchesKeyword(drinksKeywords)) return "Drinks";
  if (matchesKeyword(pantryKeywords)) return "Pantry";

  return "Other";
}

function createSuggestion(item: AddSuggestionInput): ShoppingSuggestion {
  const trimmedName = item.name.trim();
  const trimmedCategory = item.category?.trim();

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: trimmedName,
    amount: item.amount?.trim() || "",
    category:
      trimmedCategory && trimmedCategory.length > 0
        ? trimmedCategory
        : getAutoCategory(trimmedName),
  };
}

export function ShoppingSuggestionsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [suggestions, setSuggestions] = useState<ShoppingSuggestion[]>([]);

  const addSuggestion = (item: AddSuggestionInput) => {
    if (!item.name.trim()) return;

    setSuggestions((current) => {
      const exists = current.some(
        (suggestion) =>
          normalizeName(suggestion.name) === normalizeName(item.name)
      );

      if (exists) {
        return current;
      }

      return [...current, createSuggestion(item)];
    });
  };

  const addSuggestions = (items: AddSuggestionInput[]) => {
    if (!items.length) return;

    setSuggestions((current) => {
      const next = [...current];

      items.forEach((item) => {
        if (!item.name.trim()) return;

        const exists = next.some(
          (suggestion) =>
            normalizeName(suggestion.name) === normalizeName(item.name)
        );

        if (!exists) {
          next.push(createSuggestion(item));
        }
      });

      return next;
    });
  };

  const removeSuggestion = (id: string) => {
    setSuggestions((current) =>
      current.filter((suggestion) => suggestion.id !== id)
    );
  };

  const clearSuggestions = () => {
    setSuggestions([]);
  };

  const value = useMemo(
    () => ({
      suggestions,
      addSuggestion,
      addSuggestions,
      removeSuggestion,
      clearSuggestions,
    }),
    [suggestions]
  );

  return (
    <ShoppingSuggestionsContext.Provider value={value}>
      {children}
    </ShoppingSuggestionsContext.Provider>
  );
}

export function useShoppingSuggestions() {
  const context = useContext(ShoppingSuggestionsContext);

  if (!context) {
    throw new Error(
      "useShoppingSuggestions must be used inside ShoppingSuggestionsProvider"
    );
  }

  return context;
}