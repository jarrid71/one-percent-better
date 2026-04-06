export type MealIngredient = {
  id: string;
  name: string;
  amount: string;
  category: string;
};

export type Meal = {
  id: string;
  name: string;
  ingredients: MealIngredient[];
};