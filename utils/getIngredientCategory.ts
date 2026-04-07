export type IngredientCategory =
  | "Protein"
  | "Pantry"
  | "Fridge"
  | "Freezer"
  | "Other";

const CATEGORY_KEYWORDS: Record<IngredientCategory, string[]> = {
  Protein: [
    "chicken",
    "beef",
    "steak",
    "mince",
    "turkey",
    "lamb",
    "pork",
    "bacon",
    "ham",
    "salmon",
    "tuna",
    "fish",
    "prawns",
    "shrimp",
    "egg",
    "eggs",
    "protein",
    "whey",
    "yogurt protein",
    "protein yogurt",
    "tofu",
    "tempeh",
    "sausages",
    "sausage",
  ],
  Pantry: [
    "rice",
    "pasta",
    "noodles",
    "bread",
    "wrap",
    "wraps",
    "tortilla",
    "tortillas",
    "oats",
    "cereal",
    "flour",
    "sugar",
    "salt",
    "pepper",
    "oil",
    "olive oil",
    "sauce",
    "soy sauce",
    "vinegar",
    "stock",
    "spice",
    "spices",
    "herbs",
    "beans",
    "lentils",
    "chickpeas",
    "tomato sauce",
    "passata",
    "peanut butter",
    "jam",
    "honey",
    "nuts",
    "seeds",
  ],
  Fridge: [
    "milk",
    "cheese",
    "butter",
    "yogurt",
    "cream",
    "lettuce",
    "spinach",
    "kale",
    "carrot",
    "carrots",
    "broccoli",
    "capsicum",
    "pepper",
    "cucumber",
    "tomato",
    "tomatoes",
    "onion",
    "onions",
    "garlic",
    "apple",
    "apples",
    "berries",
    "strawberries",
    "blueberries",
    "grapes",
    "lemon",
    "lime",
    "avocado",
  ],
  Freezer: [
    "frozen",
    "ice cream",
    "frozen berries",
    "frozen vegetables",
    "frozen veg",
    "peas",
    "hash brown",
    "hash browns",
    "chips",
    "fries",
    "frozen chicken",
    "frozen fish",
    "frozen meals",
  ],
  Other: [],
};

export function getIngredientCategory(
  ingredientName: string
): IngredientCategory {
  const normalizedName = ingredientName.trim().toLowerCase();

  if (!normalizedName) {
    return "Other";
  }

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [
    IngredientCategory,
    string[]
  ][]) {
    const matched = keywords.some((keyword) =>
      normalizedName.includes(keyword)
    );

    if (matched) {
      return category;
    }
  }

  return "Other";
}