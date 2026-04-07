import { STORAGE_KEYS } from "@/constants/storage";
import { Meal } from "@/types/meal";
import { getIngredientCategory } from "@/utils/getIngredientCategory";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type WeeklyPlan = Record<string, string[]>;

type MealsContextType = {
  meals: Meal[];
  weeklyPlan: WeeklyPlan;
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  addMeal: (meal: Meal) => void;
  updateMeal: (updatedMeal: Meal) => void;
  deleteMeal: (mealId: string) => void;
  addMealToDay: (day: string, mealId: string) => void;
  removeMealFromDay: (day: string, mealId: string) => void;
  getMealsForDay: (day: string) => Meal[];
  isLoading: boolean;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const defaultWeeklyPlan: WeeklyPlan = {
  Mon: [],
  Tue: [],
  Wed: [],
  Thu: [],
  Fri: [],
  Sat: [],
  Sun: [],
};

const MealsContext = createContext<MealsContextType | undefined>(undefined);

type MealsProviderProps = {
  children: ReactNode;
};

function normalizeMeal(meal: any): Meal {
  return {
    id: String(meal.id ?? `${Date.now()}-${Math.random()}`),
    name: String(meal.name ?? ""),
    ingredients: Array.isArray(meal.ingredients)
      ? meal.ingredients.map((ingredient: any, index: number) => {
          const ingredientName = String(ingredient?.name ?? "").trim();
          const existingCategory = ingredient?.category;

          return {
            id: String(
              ingredient?.id ?? `${meal.id ?? "meal"}-ingredient-${index}`
            ),
            name: ingredientName,
            amount: String(ingredient?.amount ?? ""),
            category:
              existingCategory && typeof existingCategory === "string"
                ? existingCategory
                : getIngredientCategory(ingredientName),
          };
        })
      : [],
  };
}

export function MealsProvider({ children }: MealsProviderProps) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>(defaultWeeklyPlan);
  const [selectedDay, setSelectedDay] = useState<string>("Mon");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedMeals = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
        const storedWeeklyPlan = await AsyncStorage.getItem(
          STORAGE_KEYS.WEEKLY_PLAN
        );

        if (storedMeals) {
          const parsedMeals = JSON.parse(storedMeals);

          if (Array.isArray(parsedMeals)) {
            const normalizedMeals = parsedMeals.map(normalizeMeal);
            setMeals(normalizedMeals);
          }
        }

        if (storedWeeklyPlan) {
          const parsedWeeklyPlan = JSON.parse(storedWeeklyPlan);

          setWeeklyPlan({
            ...defaultWeeklyPlan,
            ...parsedWeeklyPlan,
          });
        }
      } catch (error) {
        console.error("Failed to load meals data from storage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const saveMeals = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
      } catch (error) {
        console.error("Failed to save meals:", error);
      }
    };

    saveMeals();
  }, [meals, isLoading]);

  useEffect(() => {
    if (isLoading) return;

    const saveWeeklyPlan = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.WEEKLY_PLAN,
          JSON.stringify(weeklyPlan)
        );
      } catch (error) {
        console.error("Failed to save weekly plan:", error);
      }
    };

    saveWeeklyPlan();
  }, [weeklyPlan, isLoading]);

  const addMeal = (meal: Meal) => {
    setMeals((prev) => [...prev, normalizeMeal(meal)]);
  };

  const updateMeal = (updatedMeal: Meal) => {
    const normalizedMeal = normalizeMeal(updatedMeal);

    setMeals((prev) =>
      prev.map((meal) => (meal.id === normalizedMeal.id ? normalizedMeal : meal))
    );
  };

  const deleteMeal = (mealId: string) => {
    setMeals((prev) => prev.filter((meal) => meal.id !== mealId));

    setWeeklyPlan((prev) => {
      const updatedPlan: WeeklyPlan = {};

      for (const day of DAYS) {
        updatedPlan[day] = (prev[day] || []).filter((id) => id !== mealId);
      }

      return updatedPlan;
    });
  };

  const addMealToDay = (day: string, mealId: string) => {
    setWeeklyPlan((prev) => {
      const currentMealsForDay = prev[day] || [];

      if (currentMealsForDay.includes(mealId)) {
        return prev;
      }

      return {
        ...prev,
        [day]: [...currentMealsForDay, mealId],
      };
    });
  };

  const removeMealFromDay = (day: string, mealId: string) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((id) => id !== mealId),
    }));
  };

  const getMealsForDay = (day: string) => {
    const mealIds = weeklyPlan[day] || [];

    return mealIds
      .map((mealId) => meals.find((meal) => meal.id === mealId))
      .filter((meal): meal is Meal => Boolean(meal));
  };

  const value = useMemo(
    () => ({
      meals,
      weeklyPlan,
      selectedDay,
      setSelectedDay,
      addMeal,
      updateMeal,
      deleteMeal,
      addMealToDay,
      removeMealFromDay,
      getMealsForDay,
      isLoading,
    }),
    [meals, weeklyPlan, selectedDay, isLoading]
  );

  return <MealsContext.Provider value={value}>{children}</MealsContext.Provider>;
}

export function useMeals() {
  const context = useContext(MealsContext);

  if (!context) {
    throw new Error("useMeals must be used inside a MealsProvider");
  }

  return context;
}