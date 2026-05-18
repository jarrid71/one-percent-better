// constants/mealMatcher.ts

export type MealIngredient = {
  id: string;
  name: string;
  amount?: string;
  category?: string;
};

export type Meal = {
  id: string;
  name: string;
  ingredients: MealIngredient[];
};

export type PantryItem = {
  id: string;
  name: string;
};

export type StockItem = {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
};

export type MissingIngredient = {
  name: string;
  amount?: string;
  category?: string;
};

export type MealMatchResult = {
  mealId: string;
  mealName: string;
  matchPercentage: number;
  matchedIngredients: number;
  totalIngredients: number;
  missingIngredients: MissingIngredient[];
  statusLabel: string;
};

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function cleanIngredientName(value: string) {
  return normalizeText(value)
    .replace(/^\d+(\.\d+)?\s*/g, "")
    .replace(
      /^(tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|cup|cups|g|gram|grams|kg|ml|l|litre|litres|tub|packet|pack|can|tin|slice|slices|piece|pieces)\s+/g,
      ""
    )
    .trim();
}

function hasPantryMatch(ingredientName: string, pantryItems: PantryItem[]) {
  const normalizedIngredient = normalizeText(ingredientName);
  const cleanedIngredient = cleanIngredientName(ingredientName);

  return pantryItems.some((pantryItem) => {
    const normalizedPantryName = normalizeText(pantryItem.name);
    const cleanedPantryName = cleanIngredientName(pantryItem.name);

    return (
      normalizedPantryName === normalizedIngredient ||
      normalizedPantryName === cleanedIngredient ||
      cleanedPantryName === normalizedIngredient ||
      cleanedPantryName === cleanedIngredient ||
      normalizedPantryName.includes(cleanedIngredient) ||
      cleanedIngredient.includes(normalizedPantryName) ||
      cleanedPantryName.includes(cleanedIngredient) ||
      cleanedIngredient.includes(cleanedPantryName)
    );
  });
}

export function getMealMatches(
  meals: Meal[],
  pantryItems: PantryItem[]
): MealMatchResult[] {
  return meals
    .map((meal) => {
      const ingredients = meal.ingredients ?? [];
      const totalIngredients = ingredients.length;

      if (totalIngredients === 0) {
        return {
          mealId: meal.id,
          mealName: meal.name,
          matchPercentage: 0,
          matchedIngredients: 0,
          totalIngredients: 0,
          missingIngredients: [],
          statusLabel: "No ingredients",
        };
      }

      const missingIngredients = ingredients
        .filter((ingredient) => !hasPantryMatch(ingredient.name, pantryItems))
        .map((ingredient) => ({
          name: ingredient.name,
          amount: ingredient.amount,
          category: ingredient.category,
        }));

      const matchedIngredients = totalIngredients - missingIngredients.length;

      const matchPercentage = Math.round(
        (matchedIngredients / totalIngredients) * 100
      );

      let statusLabel = "Not ready";

      if (matchPercentage === 100) {
        statusLabel = "Ready to cook 🔥";
      } else if (matchPercentage >= 70) {
        statusLabel = "Almost ready 👀";
      }

      return {
        mealId: meal.id,
        mealName: meal.name,
        matchPercentage,
        matchedIngredients,
        totalIngredients,
        missingIngredients,
        statusLabel,
      };
    })
    .sort((a, b) => {
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }

      if (a.missingIngredients.length !== b.missingIngredients.length) {
        return a.missingIngredients.length - b.missingIngredients.length;
      }

      return a.mealName.localeCompare(b.mealName);
    });
}