import React from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Exercise = {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
  pregnancySafe?: boolean;
  lowImpact?: boolean;
};

type WorkoutTemplate = {
  id: string;
  assignedDays: string[];
  workoutName: string;
  duration: string;
  exercises: Exercise[];
};

type Props = {
  selectedTemplate: WorkoutTemplate | null;
  exerciseName: string;
  setExerciseName: (v: string) => void;
  sets: string;
  setSets: (v: string) => void;
  reps: string;
  setReps: (v: string) => void;
  weight: string;
  setWeight: (v: string) => void;
  exercisePregnancySafe: boolean;
  setExercisePregnancySafe: (v: boolean) => void;
  exerciseLowImpact: boolean;
  setExerciseLowImpact: (v: boolean) => void;
  editingExerciseId: string | null;
  saveExercise: () => void;
  resetExerciseForm: () => void;
  startEditingExercise: (exercise: Exercise) => void;
  deleteExercise: (templateId: string, exerciseId: string) => void;
  moveExercise: (
    templateId: string,
    exerciseId: string,
    direction: "up" | "down"
  ) => void;
};

export default function WorkoutExerciseManager({
  selectedTemplate,
  exerciseName,
  setExerciseName,
  sets,
  setSets,
  reps,
  setReps,
  weight,
  setWeight,
  exercisePregnancySafe,
  setExercisePregnancySafe,
  exerciseLowImpact,
  setExerciseLowImpact,
  editingExerciseId,
  saveExercise,
  resetExerciseForm,
  startEditingExercise,
  deleteExercise,
  moveExercise,
}: Props) {
  if (!selectedTemplate) {
    return (
      <View style={styles.card}>
        <Text style={styles.smallText}>Select a workout template first.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Exercises</Text>

      <Text style={styles.templateDetails}>
        {selectedTemplate.workoutName}
        {selectedTemplate.assignedDays.length > 0
          ? ` • ${selectedTemplate.assignedDays.join(", ")}`
          : ""}
      </Text>

      <TextInput
        style={styles.input}
        value={exerciseName}
        onChangeText={setExerciseName}
        placeholder="Exercise name"
        placeholderTextColor="#9ca3af"
      />

      <View style={styles.rowInputs}>
        <TextInput
          style={[styles.input, styles.smallInput]}
          value={sets}
          onChangeText={setSets}
          placeholder="Sets"
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.smallInput]}
          value={reps}
          onChangeText={setReps}
          placeholder="Reps"
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.smallInput]}
          value={weight}
          onChangeText={setWeight}
          placeholder="Weight"
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            exercisePregnancySafe && styles.secondaryButtonActive,
          ]}
          onPress={() => setExercisePregnancySafe(!exercisePregnancySafe)}
        >
          <Text style={styles.secondaryButtonText}>
            Pregnancy Safe: {exercisePregnancySafe ? "Yes" : "No"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            exerciseLowImpact && styles.secondaryButtonActive,
          ]}
          onPress={() => setExerciseLowImpact(!exerciseLowImpact)}
        >
          <Text style={styles.secondaryButtonText}>
            Low Impact: {exerciseLowImpact ? "Yes" : "No"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.primaryButton} onPress={saveExercise}>
          <Text style={styles.primaryButtonText}>
            {editingExerciseId ? "Save Exercise" : "Add Exercise"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={resetExerciseForm}
        >
          <Text style={styles.secondaryButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.exerciseList}>
        {selectedTemplate.exercises.map((exercise, index) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <Text style={styles.listTitle}>
              {index + 1}. {exercise.name}
            </Text>

            <Text style={styles.smallText}>
              {exercise.sets} sets x {exercise.reps} reps @ {exercise.weight} kg
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => startEditingExercise(exercise)}
              >
                <Text style={styles.secondaryButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() =>
                  moveExercise(selectedTemplate.id, exercise.id, "up")
                }
              >
                <Text style={styles.secondaryButtonText}>Up</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() =>
                  moveExercise(selectedTemplate.id, exercise.id, "down")
                }
              >
                <Text style={styles.secondaryButtonText}>Down</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => deleteExercise(selectedTemplate.id, exercise.id)}
              >
                <Text style={styles.secondaryButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1c1f26",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#fff",
  },

  templateDetails: {
    color: "#93c5fd",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
  },

  input: {
    backgroundColor: "#2a2e38",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    color: "#fff",
  },

  smallInput: {
    flex: 1,
    marginRight: 8,
  },

  rowInputs: {
    flexDirection: "row",
  },

  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },

  primaryButton: {
    backgroundColor: "#4c8bf5",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  secondaryButton: {
    backgroundColor: "#2a2e38",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 6,
  },

  secondaryButtonActive: {
    backgroundColor: "#4c8bf5",
  },

  secondaryButtonText: {
    color: "#fff",
  },

  exerciseList: {
    marginTop: 10,
  },

  exerciseCard: {
    backgroundColor: "#2a2e38",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  listTitle: {
    fontWeight: "600",
    color: "#fff",
  },

  smallText: {
    color: "#bbb",
  },
});