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

function createSuggestion(item: AddSuggestionInput): ShoppingSuggestion {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: item.name.trim(),
    amount: item.amount?.trim() || "",
    category: item.category?.trim() || "Other",
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
        (suggestion) => normalizeName(suggestion.name) === normalizeName(item.name)
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