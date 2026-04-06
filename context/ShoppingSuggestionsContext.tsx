import React, { createContext, useContext, useMemo, useState } from "react";

export type ShoppingSuggestion = {
  id: string;
  name: string;
  amount?: string;
  category?: string;
  sourceMeal?: string;
};

type ShoppingSuggestionsContextType = {
  suggestions: ShoppingSuggestion[];
  addSuggestion: (suggestion: ShoppingSuggestion) => void;
  addSuggestions: (newSuggestions: ShoppingSuggestion[]) => void;
  removeSuggestion: (id: string) => void;
  clearSuggestions: () => void;
};

const ShoppingSuggestionsContext = createContext<ShoppingSuggestionsContextType | undefined>(
  undefined
);

export function ShoppingSuggestionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [suggestions, setSuggestions] = useState<ShoppingSuggestion[]>([]);

  const addSuggestion = (suggestion: ShoppingSuggestion) => {
    setSuggestions((current) => {
      const exists = current.some(
        (item) => item.name.toLowerCase() === suggestion.name.toLowerCase()
      );

      if (exists) return current;

      return [...current, suggestion];
    });
  };

  const addSuggestions = (newSuggestions: ShoppingSuggestion[]) => {
    setSuggestions((current) => {
      const updated = [...current];

      newSuggestions.forEach((suggestion) => {
        const exists = updated.some(
          (item) => item.name.toLowerCase() === suggestion.name.toLowerCase()
        );

        if (!exists) {
          updated.push(suggestion);
        }
      });

      return updated;
    });
  };

  const removeSuggestion = (id: string) => {
    setSuggestions((current) => current.filter((item) => item.id !== id));
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
    throw new Error("useShoppingSuggestions must be used inside ShoppingSuggestionsProvider");
  }

  return context;
}