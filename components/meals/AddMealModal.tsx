import React, { useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import colors from "@/constants/colors";
import spacing from "@/constants/spacing";
import { Meal, MealIngredient } from "../../types/meal";
type AddMealModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (meal: Meal) => void;
};

const categoryOptions = ["Protein", "Pantry", "Fridge", "Freezer", "Other"];

export default function AddMealModal({
  visible,
  onClose,
  onSave,
}: AddMealModalProps) {
  const [mealName, setMealName] = useState("");
  const [ingredientName, setIngredientName] = useState("");
  const [ingredientAmount, setIngredientAmount] = useState("");
  const [ingredientCategory, setIngredientCategory] = useState("Protein");
  const [ingredients, setIngredients] = useState<MealIngredient[]>([]);

  function resetForm() {
    setMealName("");
    setIngredientName("");
    setIngredientAmount("");
    setIngredientCategory("Protein");
    setIngredients([]);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleAddIngredient() {
    if (!ingredientName.trim() || !ingredientAmount.trim()) {
      Alert.alert("Missing info", "Please enter an ingredient name and amount.");
      return;
    }

    const newIngredient: MealIngredient = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      name: ingredientName.trim(),
      amount: ingredientAmount.trim(),
      category: ingredientCategory,
    };

    setIngredients((currentIngredients) => [...currentIngredients, newIngredient]);
    setIngredientName("");
    setIngredientAmount("");
    setIngredientCategory("Protein");
  }

  function handleRemoveIngredient(ingredientId: string) {
    setIngredients((currentIngredients) =>
      currentIngredients.filter((ingredient) => ingredient.id !== ingredientId)
    );
  }

  function handleSaveMeal() {
    if (!mealName.trim()) {
      Alert.alert("Missing meal name", "Please enter a meal name.");
      return;
    }

    if (ingredients.length === 0) {
      Alert.alert("No ingredients", "Please add at least one ingredient.");
      return;
    }

    const newMeal: Meal = {
      id: Date.now().toString(),
      name: mealName.trim(),
      ingredients,
    };

    onSave(newMeal);
    resetForm();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.title}>Create Meal</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Meal Name</Text>
            <TextInput
              value={mealName}
              onChangeText={setMealName}
              placeholder="Example: Chicken Rice Bowl"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Add Ingredient</Text>

              <TextInput
                value={ingredientName}
                onChangeText={setIngredientName}
                placeholder="Ingredient name"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />

              <TextInput
                value={ingredientAmount}
                onChangeText={setIngredientAmount}
                placeholder="Amount"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />

              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryWrap}>
                {categoryOptions.map((category) => {
                  const isSelected = ingredientCategory === category;

                  return (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton,
                        isSelected && styles.categoryButtonSelected,
                      ]}
                      onPress={() => setIngredientCategory(category)}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          isSelected && styles.categoryButtonTextSelected,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.addIngredientButton}
                onPress={handleAddIngredient}
              >
                <Text style={styles.addIngredientButtonText}>Add Ingredient</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Ingredients</Text>

              {ingredients.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No ingredients added yet.</Text>
                </View>
              ) : (
                ingredients.map((ingredient) => (
                  <View key={ingredient.id} style={styles.ingredientCard}>
                    <View style={styles.ingredientInfo}>
                      <Text style={styles.ingredientName}>{ingredient.name}</Text>
                      <Text style={styles.ingredientMeta}>
                        {ingredient.amount} • {ingredient.category}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveIngredient(ingredient.id)}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveMeal}>
              <Text style={styles.saveButtonText}>Save Meal</Text>
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
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },

  modalCard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: "90%",
  },

  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: spacing.lg,
  },

  label: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },

  input: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    fontSize: 15,
  },

  sectionBlock: {
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.md,
  },

  categoryWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  categoryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  categoryButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  categoryButtonText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },

  categoryButtonTextSelected: {
    color: colors.textPrimary,
  },

  addIngredientButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: "center",
  },

  addIngredientButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },

  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  emptyText: {
    color: colors.textMuted,
    textAlign: "center",
    fontSize: 14,
  },

  ingredientCard: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },

  ingredientInfo: {
    flex: 1,
  },

  ingredientName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },

  ingredientMeta: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  removeButton: {
    backgroundColor: colors.danger,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  removeButtonText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },

  footer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  cancelButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },

  saveButton: {
    flex: 1,
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: "center",
  },

  saveButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
});