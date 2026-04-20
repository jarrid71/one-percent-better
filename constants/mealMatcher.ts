export type MealIngredient = {
  id: string;
  name: string;
  amount: string;
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

export type MealMatchResult = {
  mealId: string;
  mealName: string;
  totalIngredients: number;
  matchedIngredients: number;
  missingIngredients: string[];
  matchPercentage: number;
};

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export function getMealMatches(
  meals: Meal[],
  pantryItems: PantryItem[]
): MealMatchResult[] {
  const pantryNames = pantryItems.map((item) => normalizeText(item.name));

  const results: MealMatchResult[] = meals.map((meal) => {
    const ingredientNames = meal.ingredients.map((ingredient) =>
      normalizeText(ingredient.name)
    );

    const missingIngredients = ingredientNames.filter(
      (ingredientName) => !pantryNames.includes(ingredientName)
    );

    const totalIngredients = ingredientNames.length;
    const matchedIngredients = totalIngredients - missingIngredients.length;

    const matchPercentage =
      totalIngredients === 0
        ? 0
        : Math.round((matchedIngredients / totalIngredients) * 100);

    return {
      mealId: meal.id,
      mealName: meal.name,
      totalIngredients,
      matchedIngredients,
      missingIngredients,
      matchPercentage,
    };
  });

  return results.sort((a, b) => {
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }

    return a.missingIngredients.length - b.missingIngredients.length;
  });
}