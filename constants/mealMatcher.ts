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
  quantity?: string | number;
  unit?: string;
};

export type StockItem = {
  id: string;
  name: string;
  quantity?: string | number;
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

type ParsedAmount = {
  quantity: number | null;
  unit: string;
};

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeUnit(unit: string) {
  const normalized = normalizeText(unit);

  const unitMap: Record<string, string> = {
    gram: "g",
    grams: "g",
    g: "g",

    kilogram: "kg",
    kilograms: "kg",
    kg: "kg",

    millilitre: "ml",
    millilitres: "ml",
    milliliter: "ml",
    milliliters: "ml",
    ml: "ml",

    litre: "l",
    litres: "l",
    liter: "l",
    liters: "l",
    l: "l",

    teaspoon: "tsp",
    teaspoons: "tsp",
    tsp: "tsp",

    tablespoon: "tbsp",
    tablespoons: "tbsp",
    tbsp: "tbsp",

    cup: "cup",
    cups: "cup",

    tub: "tub",
    tubs: "tub",

    packet: "packet",
    packets: "packet",
    pack: "packet",
    packs: "packet",

    can: "can",
    cans: "can",
    tin: "can",
    tins: "can",

    slice: "slice",
    slices: "slice",

    piece: "piece",
    pieces: "piece",
  };

  return unitMap[normalized] || normalized;
}

function parseAmount(value?: string | number): ParsedAmount {
  if (value === undefined || value === null) {
    return {
      quantity: null,
      unit: "",
    };
  }

  const text = String(value).trim().toLowerCase();

  if (!text) {
    return {
      quantity: null,
      unit: "",
    };
  }

  const match = text.match(/^(\d+(\.\d+)?)\s*([a-zA-Z]+)?/);

  if (!match) {
    return {
      quantity: null,
      unit: normalizeUnit(text),
    };
  }

  return {
    quantity: Number(match[1]),
    unit: normalizeUnit(match[3] || ""),
  };
}

function convertToBaseAmount(amount: ParsedAmount): number | null {
  if (amount.quantity === null) return null;

  switch (amount.unit) {
    case "kg":
      return amount.quantity * 1000;
    case "g":
      return amount.quantity;

    case "l":
      return amount.quantity * 1000;
    case "ml":
      return amount.quantity;

    case "tbsp":
      return amount.quantity * 15;
    case "tsp":
      return amount.quantity * 5;
    case "cup":
      return amount.quantity * 250;

    default:
      return amount.quantity;
  }
}

function getUnitFamily(unit: string) {
  const normalizedUnit = normalizeUnit(unit);

  if (["g", "kg"].includes(normalizedUnit)) return "weight";
  if (["ml", "l", "tbsp", "tsp", "cup"].includes(normalizedUnit)) return "volume";
  if (["tub", "packet", "can", "slice", "piece"].includes(normalizedUnit)) {
    return "container";
  }

  return "unknown";
}

function cleanIngredientName(value: string) {
  return normalizeText(value)
    .replace(/^\d+(\.\d+)?\s*/g, "")
    .replace(
      /^(tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|cup|cups|g|gram|grams|kg|ml|l|litre|litres|tub|tubs|packet|pack|can|tin|slice|slices|piece|pieces)\s+/g,
      ""
    )
    .trim();
}

function namesMatch(ingredientName: string, pantryName: string) {
  const normalizedIngredient = normalizeText(ingredientName);
  const cleanedIngredient = cleanIngredientName(ingredientName);

  const normalizedPantryName = normalizeText(pantryName);
  const cleanedPantryName = cleanIngredientName(pantryName);

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
}

function hasEnoughQuantity(
  ingredient: MealIngredient,
  pantryItem: PantryItem
) {
  const neededAmount = parseAmount(ingredient.amount);
  const stockQuantity = parseAmount(pantryItem.quantity);
  const stockUnit = normalizeUnit(pantryItem.unit || stockQuantity.unit);

  if (neededAmount.quantity === null) {
    return true;
  }

  if (stockQuantity.quantity === null) {
    return true;
  }

  const neededFamily = getUnitFamily(neededAmount.unit);
  const stockFamily = getUnitFamily(stockUnit);

  if (stockFamily === "container") {
    return true;
  }

  if (neededFamily === "container") {
    return true;
  }

  if (neededFamily === "unknown" || stockFamily === "unknown") {
    return true;
  }

  if (neededFamily !== stockFamily) {
    return true;
  }

  const neededBaseAmount = convertToBaseAmount(neededAmount);
  const stockBaseAmount = convertToBaseAmount({
    quantity: stockQuantity.quantity,
    unit: stockUnit || stockQuantity.unit,
  });

  if (neededBaseAmount === null || stockBaseAmount === null) {
    return true;
  }

  return stockBaseAmount >= neededBaseAmount;
}

function hasPantryMatch(
  ingredient: MealIngredient,
  pantryItems: PantryItem[]
) {
  return pantryItems.some((pantryItem) => {
    const nameMatches = namesMatch(ingredient.name, pantryItem.name);

    if (!nameMatches) {
      return false;
    }

    return hasEnoughQuantity(ingredient, pantryItem);
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
        .filter((ingredient) => !hasPantryMatch(ingredient, pantryItems))
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