import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SPACING } from "@/constants/spacing";
import { useMeals } from "@/context/MealsContext";
import { useAppTheme } from "@/context/ThemeContext";
import { Ingredient, Meal } from "@/types/meal";
import { getIngredientCategory } from "@/utils/getIngredientCategory";

type AddMealModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (meal: Meal) => void;
  onDelete: (mealId: string) => void;
  editingMeal?: Meal | null;
};

export default function AddMealModal({
  visible,
  onClose,
  onSave,
  onDelete,
  editingMeal = null,
}: AddMealModalProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { ingredientSuggestions } = useMeals();

  const isEditing = !!editingMeal;

  const mealNameInputRef = useRef<TextInput>(null);
  const ingredientNameInputRef = useRef<TextInput>(null);
  const amountInputRef = useRef<TextInput>(null);

  const [mealName, setMealName] = useState("");
  const [ingredientName, setIngredientName] = useState("");
  const [ingredientAmount, setIngredientAmount] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

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

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });

    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  function resetForm() {
    setMealName("");
    setIngredientName("");
    setIngredientAmount("");
    setIngredients([]);
    setIsKeyboardVisible(false);
  }

  const filteredSuggestions = useMemo(() => {
    const trimmedInput = ingredientName.trim().toLowerCase();

    if (!trimmedInput) return [];

    return ingredientSuggestions
      .filter((suggestion) => {
        const lowerSuggestion = suggestion.toLowerCase();

        return (
          lowerSuggestion.includes(trimmedInput) &&
          lowerSuggestion !== trimmedInput
        );
      })
      .slice(0, 5);
  }, [ingredientName, ingredientSuggestions]);

  function handleMealNameSubmit() {
    ingredientNameInputRef.current?.focus();
  }

  function handleSuggestionPress(suggestion: string) {
    setIngredientName(suggestion);

    setTimeout(() => {
      amountInputRef.current?.focus();
    }, 50);
  }

  function handleIngredientNameSubmit() {
    amountInputRef.current?.focus();
  }

  function handleAddIngredient() {
    const trimmedName = ingredientName.trim();
    const trimmedAmount = ingredientAmount.trim();

    if (!trimmedName || !trimmedAmount) return;

    const newIngredient: Ingredient = {
      id: `${Date.now()}-${Math.random()}`,
      name: trimmedName,
      amount: trimmedAmount,
      category: getIngredientCategory(trimmedName),
    };

    setIngredients((prev) => [...prev, newIngredient]);
    setIngredientName("");
    setIngredientAmount("");

    setTimeout(() => {
      ingredientNameInputRef.current?.focus();
    }, 50);
  }

  function handleRemoveIngredient(id: string) {
    setIngredients((prev) =>
      prev.filter((ingredient) => ingredient.id !== id)
    );
  }

  function handleDeleteMeal() {
    if (!editingMeal) return;

    Alert.alert(
      "Delete Meal",
      `Are you sure you want to delete "${editingMeal.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDelete(editingMeal.id);
            resetForm();
          },
        },
      ]
    );
  }

  function handleSaveMeal() {
    const trimmedMealName = mealName.trim();

    if (!trimmedMealName || ingredients.length === 0) return;

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
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.label}>Meal Name</Text>
            <TextInput
              ref={mealNameInputRef}
              value={mealName}
              onChangeText={setMealName}
              placeholder="e.g. Chicken rice bowl"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              returnKeyType="next"
              onSubmitEditing={handleMealNameSubmit}
              blurOnSubmit={false}
            />

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
            </View>

            <Text style={styles.helperText}>
              Enter ingredient name and amount. Category is sorted automatically.
            </Text>

            <Text style={styles.label}>Ingredient Name</Text>
            <TextInput
              ref={ingredientNameInputRef}
              value={ingredientName}
              onChangeText={setIngredientName}
              placeholder="e.g. Chicken breast"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              returnKeyType="next"
              onSubmitEditing={handleIngredientNameSubmit}
              blurOnSubmit={false}
            />

            {filteredSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {filteredSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={`${suggestion}-${index}`}
                    style={[
                      styles.suggestionItem,
                      index === filteredSuggestions.length - 1 &&
                        styles.lastSuggestionItem,
                    ]}
                    onPress={() => handleSuggestionPress(suggestion)}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Amount</Text>
            <TextInput
              ref={amountInputRef}
              value={ingredientAmount}
              onChangeText={setIngredientAmount}
              placeholder="e.g. 500g"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={handleAddIngredient}
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

          {!isKeyboardVisible && (
            <View style={styles.footer}>
              {isEditing ? (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDeleteMeal}
                >
                  <Text style={styles.deleteButtonText}>Delete Meal</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveMeal}
              >
                <Text style={styles.saveButtonText}>
                  {isEditing ? "Save Changes" : "Save Meal"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      padding: SPACING.lg,
    },
    modalCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      maxHeight: "90%",
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    scrollContent: {
      paddingBottom: SPACING.md,
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
      marginBottom: SPACING.lg,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 6,
      marginTop: SPACING.sm,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
    },
    sectionHeaderRow: {
      marginTop: SPACING.lg,
      marginBottom: SPACING.xs,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    helperText: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: SPACING.sm,
    },
    suggestionsContainer: {
      marginTop: 8,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      overflow: "hidden",
    },
    suggestionItem: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    lastSuggestionItem: {
      borderBottomWidth: 0,
    },
    suggestionText: {
      fontSize: 14,
      color: colors.text,
    },
    addIngredientButton: {
      marginTop: SPACING.md,
      backgroundColor: colors.primary,
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
      backgroundColor: colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.text,
      marginBottom: 4,
    },
    ingredientMeta: {
      fontSize: 13,
      color: colors.textSecondary,
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
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      backgroundColor: colors.background,
    },
    cancelButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "600",
    },
    deleteButton: {
      flex: 1,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      backgroundColor: "#b91c1c",
    },
    deleteButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },
    saveButton: {
      flex: 1,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      backgroundColor: colors.primary,
    },
    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },
  });