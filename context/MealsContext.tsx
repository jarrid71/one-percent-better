import React, { createContext, ReactNode, useContext, useState } from "react";
import { Meal } from "../types/meal";

type MealsContextType = {
  meals: Meal[];
  addMeal: (meal: Meal) => void;
  removeMeal: (mealId: string) => void;
};

const starterMeals: Meal[] = [
  {
    id: "1",
    name: "Chicken and rice",
    ingredients: [
      { id: "1-1", name: "Chicken breast", amount: "2 pcs", category: "Protein" },
      { id: "1-2", name: "Rice", amount: "2 cups", category: "Pantry" },
      { id: "1-3", name: "Broccoli", amount: "1 head", category: "Fridge" },
    ],
  },
  {
    id: "2",
    name: "Steak wrap",
    ingredients: [
      { id: "2-1", name: "Steak", amount: "300g", category: "Protein" },
      { id: "2-2", name: "Wraps", amount: "1 pack", category: "Pantry" },
      { id: "2-3", name: "Lettuce", amount: "1 bag", category: "Fridge" },
    ],
  },
  {
    id: "3",
    name: "Eggs on toast",
    ingredients: [
      { id: "3-1", name: "Eggs", amount: "6", category: "Fridge" },
      { id: "3-2", name: "Bread", amount: "1 loaf", category: "Pantry" },
      { id: "3-3", name: "Butter", amount: "1 tub", category: "Fridge" },
    ],
  },
  {
    id: "4",
    name: "Protein oats",
    ingredients: [
      { id: "4-1", name: "Oats", amount: "1 bag", category: "Pantry" },
      { id: "4-2", name: "Protein powder", amount: "1 tub", category: "Pantry" },
      { id: "4-3", name: "Milk", amount: "2L", category: "Fridge" },
      { id: "4-4", name: "Bananas", amount: "1 bunch", category: "Fridge" },
    ],
  },
];

const MealsContext = createContext<MealsContextType | undefined>(undefined);

type MealsProviderProps = {
  children: ReactNode;
};

export function MealsProvider({ children }: MealsProviderProps) {
  const [meals, setMeals] = useState<Meal[]>(starterMeals);

  function addMeal(meal: Meal) {
    setMeals((currentMeals) => [meal, ...currentMeals]);
  }

  function removeMeal(mealId: string) {
    setMeals((currentMeals) =>
      currentMeals.filter((meal) => meal.id !== mealId)
    );
  }

  return (
    <MealsContext.Provider value={{ meals, addMeal, removeMeal }}>
      {children}
    </MealsContext.Provider>
  );
}

export function useMeals() {
  const context = useContext(MealsContext);

  if (context === undefined) {
    throw new Error("useMeals must be used inside MealsProvider");
  }

  return context;
}