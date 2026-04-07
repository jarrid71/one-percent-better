export type IngredientCategory =
  | "Protein"
  | "Pantry"
  | "Fridge"
  | "Freezer"
  | "Other";

export type Ingredient = {
  id: string;
  name: string;
  amount: string;
  category: IngredientCategory;
};

export type Meal = {
  id: string;
  name: string;
  ingredients: Ingredient[];
};