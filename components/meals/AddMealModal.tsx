import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { Ingredient, Meal } from "@/types/meal";
import { getIngredientCategory } from "@/utils/getIngredientCategory";

type AddMealModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (meal: Meal) => void;
  editingMeal?: Meal | null;
};

export default function AddMealModal({
  visible,
  onClose,
  onSave,
  editingMeal = null,
}: AddMealModalProps) {
  const isEditing = useMemo(() => !!editingMeal, [editingMeal]);

  const [mealName, setMealName] = useState("");
  const [ingredientName, setIngredientName] = useState("");
  const [ingredientAmount, setIngredientAmount] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    if (visible) {
      if (editingMeal) {
        setMealName(editingMeal.name);
        setIngredients(editingMeal.ingredients);
      } else {
        resetForm();
      }
    }
  }, [visible, editingMeal]);

  function resetForm() {
    setMealName("");
    setIngredientName("");
    setIngredientAmount("");
    setIngredients([]);
  }

  function handleAddIngredient() {
    const trimmedName = ingredientName.trim();
    const trimmedAmount = ingredientAmount.trim();

    if (!trimmedName || !trimmedAmount) {
      return;
    }

    const newIngredient: Ingredient = {
      id: `${Date.now()}-${Math.random()}`,
      name: trimmedName,
      amount: trimmedAmount,
      category: getIngredientCategory(trimmedName),
    };

    setIngredients((prev) => [...prev, newIngredient]);
    setIngredientName("");
    setIngredientAmount("");
  }

  function handleRemoveIngredient(id: string) {
    setIngredients((prev) => prev.filter((ingredient) => ingredient.id !== id));
  }

  function handleSaveMeal() {
    const trimmedMealName = mealName.trim();

    if (!trimmedMealName || ingredients.length === 0) {
      return;
    }

    const meal: Meal = {
      id: editingMeal?.id ?? `${Date.now()}-${Math.random()}`,
      name: trimmedMealName,
      ingredients,
    };

    onSave(meal);
    resetForm();
    onClose();
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.title}>
            {isEditing ? "Edit Meal" : "Add Meal"}
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.label}>Meal Name</Text>
            <TextInput
              value={mealName}
              onChangeText={setMealName}
              placeholder="e.g. Chicken rice bowl"
              placeholderTextColor={COLORS.textSecondary}
              style={styles.input}
            />

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
            </View>

            <Text style={styles.helperText}>
              Enter ingredient name and amount. Category is sorted automatically.
            </Text>

            <Text style={styles.label}>Ingredient Name</Text>
            <TextInput
              value={ingredientName}
              onChangeText={setIngredientName}
              placeholder="e.g. Chicken breast"
              placeholderTextColor={COLORS.textSecondary}
              style={styles.input}
            />

            <Text style={styles.label}>Amount</Text>
            <TextInput
              value={ingredientAmount}
              onChangeText={setIngredientAmount}
              placeholder="e.g. 500g"
              placeholderTextColor={COLORS.textSecondary}
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.addIngredientButton}
              onPress={handleAddIngredient}
            >
              <Text style={styles.addIngredientButtonText}>Add Ingredient</Text>
            </TouchableOpacity>

            <View style={styles.ingredientsList}>
              {ingredients.map((ingredient) => (
                <View key={ingredient.id} style={styles.ingredientCard}>
                  <View style={styles.ingredientTextWrap}>
                    <Text style={styles.ingredientName}>{ingredient.name}</Text>
                    <Text style={styles.ingredientMeta}>
                      {ingredient.amount} • {ingredient.category}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleRemoveIngredient(ingredient.id)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveMeal}>
              <Text style={styles.saveButtonText}>
                {isEditing ? "Save Changes" : "Save Meal"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    maxHeight: "90%",
    padding: SPACING.lg,
  },
  scrollContent: {
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
    marginTop: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  sectionHeaderRow: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  helperText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  addIngredientButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  addIngredientButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  ingredientsList: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  ingredientCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  ingredientTextWrap: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  ingredientMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  removeButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  removeButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FF6B6B",
  },
  footer: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: COLORS.background,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});