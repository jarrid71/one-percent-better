import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import WeeklyPlanner from "@/components/common/WeeklyPlanner";
import Chip from "../../components/workouts/chip";
import TopTab from "../../components/workouts/toptab";
import WorkoutExerciseManager from "../../components/workouts/WorkoutExerciseManager";
import WorkoutTemplateCard from "../../components/workouts/WorkoutTemplateCard";

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

type WorkoutTab = "overview" | "plan" | "learn";

const WEEKDAY_OPTIONS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const SHORT_TO_FULL_DAY: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

const FULL_TO_SHORT_DAY: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export default function WorkoutsScreen() {
  const [activeTab, setActiveTab] = useState<WorkoutTab>("plan");
  const [selectedDay, setSelectedDay] = useState("Monday");

  const [assignedDays, setAssignedDays] = useState<string[]>([]);
  const [workoutName, setWorkoutName] = useState("");
  const [duration, setDuration] = useState("");

  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [exercisePregnancySafe, setExercisePregnancySafe] = useState(false);
  const [exerciseLowImpact, setExerciseLowImpact] = useState(false);

  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(
    null
  );

  const [templates, setTemplates] = useState<WorkoutTemplate[]>([
    {
      id: "1",
      assignedDays: ["Monday", "Thursday"],
      workoutName: "Push",
      duration: "60",
      exercises: [
        {
          id: "1-1",
          name: "Bench Press",
          sets: "4",
          reps: "8",
          weight: "80",
          pregnancySafe: false,
          lowImpact: true,
        },
      ],
    },
    {
      id: "2",
      assignedDays: ["Tuesday"],
      workoutName: "Pull",
      duration: "55",
      exercises: [
        {
          id: "2-1",
          name: "Lat Pulldown",
          sets: "4",
          reps: "10",
          weight: "55",
          pregnancySafe: true,
          lowImpact: true,
        },
      ],
    },
    {
      id: "3",
      assignedDays: [],
      workoutName: "Backup Upper",
      duration: "45",
      exercises: [],
    },
  ]);

  const selectedTemplate =
    templates.find((template) => template.id === selectedTemplateId) ?? null;

  const getFirstDayIndex = (days: string[]) => {
    if (days.length === 0) return 999;

    const indexes = days
      .map((day) =>
        WEEKDAY_OPTIONS.indexOf(day as (typeof WEEKDAY_OPTIONS)[number])
      )
      .filter((index) => index >= 0);

    return indexes.length > 0 ? Math.min(...indexes) : 999;
  };

  const sortedTemplates = useMemo(() => {
    return [...templates].sort((a, b) => {
      const firstDayA = getFirstDayIndex(a.assignedDays);
      const firstDayB = getFirstDayIndex(b.assignedDays);

      if (firstDayA !== firstDayB) {
        return firstDayA - firstDayB;
      }

      return a.workoutName.localeCompare(b.workoutName);
    });
  }, [templates]);

  const templatesForSelectedDay = useMemo(() => {
    return sortedTemplates.filter((template) =>
      template.assignedDays.includes(selectedDay)
    );
  }, [sortedTemplates, selectedDay]);

  const unassignedTemplates = useMemo(() => {
    return sortedTemplates.filter((template) => template.assignedDays.length === 0);
  }, [sortedTemplates]);

  const plannerDayCounts = useMemo(() => {
    return {
      Mon: templates.filter((template) =>
        template.assignedDays.includes("Monday")
      ).length,
      Tue: templates.filter((template) =>
        template.assignedDays.includes("Tuesday")
      ).length,
      Wed: templates.filter((template) =>
        template.assignedDays.includes("Wednesday")
      ).length,
      Thu: templates.filter((template) =>
        template.assignedDays.includes("Thursday")
      ).length,
      Fri: templates.filter((template) =>
        template.assignedDays.includes("Friday")
      ).length,
      Sat: templates.filter((template) =>
        template.assignedDays.includes("Saturday")
      ).length,
      Sun: templates.filter((template) =>
        template.assignedDays.includes("Sunday")
      ).length,
    };
  }, [templates]);

  const handlePlannerDayChange = (day: string) => {
    setSelectedDay(SHORT_TO_FULL_DAY[day] ?? day);
  };

  const plannerSelectedDay = FULL_TO_SHORT_DAY[selectedDay] ?? "Mon";

  const toggleAssignedDay = (day: string) => {
    setAssignedDays((prev) =>
      prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]
    );
  };

  const quickSwapDayToTemplate = (templateId: string) => {
    setTemplates((prev) =>
      prev.map((template) => {
        const daysWithoutSelectedDay = template.assignedDays.filter(
          (day) => day !== selectedDay
        );

        if (template.id !== templateId) {
          return {
            ...template,
            assignedDays: daysWithoutSelectedDay,
          };
        }

        const updatedAssignedDays = [...daysWithoutSelectedDay, selectedDay];
        const sortedAssignedDays = WEEKDAY_OPTIONS.filter((day) =>
          updatedAssignedDays.includes(day)
        );

        return {
          ...template,
          assignedDays: [...sortedAssignedDays],
        };
      })
    );
  };

  const removeSelectedDayFromTemplate = (templateId: string) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === templateId
          ? {
              ...template,
              assignedDays: template.assignedDays.filter(
                (day) => day !== selectedDay
              ),
            }
          : template
      )
    );
  };

  const assignSelectedDayToTemplate = (templateId: string) => {
    setTemplates((prev) =>
      prev.map((template) => {
        if (template.id !== templateId) return template;

        if (template.assignedDays.includes(selectedDay)) return template;

        const updatedAssignedDays = [...template.assignedDays, selectedDay];
        const sortedAssignedDays = WEEKDAY_OPTIONS.filter((day) =>
          updatedAssignedDays.includes(day)
        );

        return {
          ...template,
          assignedDays: [...sortedAssignedDays],
        };
      })
    );
  };

  const resetTemplateForm = () => {
    setEditingTemplateId(null);
    setAssignedDays([]);
    setWorkoutName("");
    setDuration("");
  };

  const resetExerciseForm = () => {
    setEditingExerciseId(null);
    setExerciseName("");
    setSets("");
    setReps("");
    setWeight("");
    setExercisePregnancySafe(false);
    setExerciseLowImpact(false);
  };

  const addOrUpdateTemplate = () => {
    if (!workoutName || !duration) return;

    const sortedAssignedDays = WEEKDAY_OPTIONS.filter((day) =>
      assignedDays.includes(day)
    );

    if (editingTemplateId) {
      setTemplates((prev) =>
        prev.map((template) =>
          template.id === editingTemplateId
            ? {
                ...template,
                assignedDays: [...sortedAssignedDays],
                workoutName,
                duration,
              }
            : template
        )
      );
    } else {
      const newTemplate: WorkoutTemplate = {
        id: makeId(),
        assignedDays: [...sortedAssignedDays],
        workoutName,
        duration,
        exercises: [],
      };

      setTemplates((prev) => [...prev, newTemplate]);
      setSelectedTemplateId(newTemplate.id);
    }

    resetTemplateForm();
  };

  const startEditingTemplate = (template: WorkoutTemplate) => {
    setActiveTab("plan");
    setEditingTemplateId(template.id);
    setSelectedTemplateId(template.id);
    setAssignedDays([...template.assignedDays]);
    setWorkoutName(template.workoutName);
    setDuration(template.duration);
  };

  const deleteTemplate = (id: string) => {
    const updated = templates.filter((template) => template.id !== id);
    setTemplates(updated);

    if (selectedTemplateId === id) {
      setSelectedTemplateId(updated[0]?.id ?? "");
    }

    if (editingTemplateId === id) {
      resetTemplateForm();
    }
  };

  const copyTemplateForEditing = (templateToCopy: WorkoutTemplate) => {
    const copiedTemplate: WorkoutTemplate = {
      ...templateToCopy,
      id: makeId(),
      workoutName: `${templateToCopy.workoutName} Copy`,
      exercises: templateToCopy.exercises.map((exercise) => ({
        ...exercise,
        id: makeId(),
      })),
    };

    setTemplates((prev) => [...prev, copiedTemplate]);
    setActiveTab("plan");
    setEditingTemplateId(copiedTemplate.id);
    setSelectedTemplateId(copiedTemplate.id);
    setAssignedDays([...copiedTemplate.assignedDays]);
    setWorkoutName(copiedTemplate.workoutName);
    setDuration(copiedTemplate.duration);
  };

  const saveExercise = () => {
    if (!selectedTemplateId || !exerciseName) return;

    const exercise: Exercise = {
      id: makeId(),
      name: exerciseName,
      sets,
      reps,
      weight,
      pregnancySafe: exercisePregnancySafe,
      lowImpact: exerciseLowImpact,
    };

    setTemplates((prev) =>
      prev.map((template) =>
        template.id === selectedTemplateId
          ? { ...template, exercises: [...template.exercises, exercise] }
          : template
      )
    );

    resetExerciseForm();
  };

  const startEditingExercise = (exercise: Exercise) => {
    setEditingExerciseId(exercise.id);
    setExerciseName(exercise.name);
    setSets(exercise.sets);
    setReps(exercise.reps);
    setWeight(exercise.weight);
    setExercisePregnancySafe(!!exercise.pregnancySafe);
    setExerciseLowImpact(!!exercise.lowImpact);
  };

  const deleteExercise = (templateId: string, exerciseId: string) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === templateId
          ? {
              ...template,
              exercises: template.exercises.filter(
                (exercise) => exercise.id !== exerciseId
              ),
            }
          : template
      )
    );
  };

  const moveExercise = (
    templateId: string,
    exerciseId: string,
    direction: "up" | "down"
  ) => {
    setTemplates((prev) =>
      prev.map((template) => {
        if (template.id !== templateId) return template;

        const index = template.exercises.findIndex(
          (exercise) => exercise.id === exerciseId
        );
        const newExercises = [...template.exercises];
        const swapIndex = direction === "up" ? index - 1 : index + 1;

        if (index === -1 || swapIndex < 0 || swapIndex >= newExercises.length) {
          return template;
        }

        [newExercises[index], newExercises[swapIndex]] = [
          newExercises[swapIndex],
          newExercises[index],
        ];

        return { ...template, exercises: newExercises };
      })
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <TopTab activeTab={activeTab} setActiveTab={setActiveTab} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <WeeklyPlanner
            selectedDay={plannerSelectedDay}
            onDayChange={handlePlannerDayChange}
            dayCounts={plannerDayCounts}
          />

          {activeTab === "plan" && (
            <>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>{selectedDay} Workouts</Text>

                {templatesForSelectedDay.length > 0 ? (
                  templatesForSelectedDay.map((template) => (
                    <WorkoutTemplateCard
                      key={template.id}
                      template={{
                        ...template,
                        weekday:
                          template.assignedDays.length > 0
                            ? template.assignedDays.join(", ")
                            : "Unassigned",
                      }}
                      onSelect={() => {
                        setSelectedTemplateId(template.id);
                      }}
                      onEdit={() => {
                        startEditingTemplate(template);
                      }}
                      onDelete={() => {
                        deleteTemplate(template.id);
                      }}
                      onDuplicate={() => {
                        copyTemplateForEditing(template);
                      }}
                      isSelected={selectedTemplateId === template.id}
                    />
                  ))
                ) : (
                  <Text style={styles.emptyText}>
                    No workouts assigned to {selectedDay} yet.
                  </Text>
                )}
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                  Quick Swap for {selectedDay}
                </Text>
                <Text style={styles.infoText}>
                  Tap a template to replace this day’s workout with it.
                </Text>

                <View style={styles.swapList}>
                  {sortedTemplates.map((template) => {
                    const isAssigned = template.assignedDays.includes(selectedDay);

                    return (
                      <TouchableOpacity
                        key={template.id}
                        style={[
                          styles.swapRow,
                          isAssigned && styles.swapRowActive,
                        ]}
                        onPress={() => quickSwapDayToTemplate(template.id)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.swapTextWrap}>
                          <Text style={styles.swapText}>
                            {template.workoutName}
                          </Text>
                          <Text style={styles.swapSubText}>
                            {template.duration} min
                          </Text>
                        </View>

                        <Text
                          style={[
                            styles.swapStatus,
                            isAssigned && styles.swapStatusActive,
                          ]}
                        >
                          {isAssigned ? "Current" : "Swap to this"}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                  Backup Templates
                </Text>
                <Text style={styles.infoText}>
                  These are saved workouts not currently assigned to any day.
                </Text>

                <View style={styles.swapList}>
                  {unassignedTemplates.length > 0 ? (
                    unassignedTemplates.map((template) => (
                      <TouchableOpacity
                        key={template.id}
                        style={styles.swapRow}
                        onPress={() => assignSelectedDayToTemplate(template.id)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.swapTextWrap}>
                          <Text style={styles.swapText}>
                            {template.workoutName}
                          </Text>
                          <Text style={styles.swapSubText}>
                            {template.duration} min
                          </Text>
                        </View>

                        <Text style={styles.swapStatus}>Assign to {selectedDay}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>
                      No backup templates yet.
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Create / Edit Template</Text>

                <TextInput
                  style={styles.input}
                  value={workoutName}
                  onChangeText={setWorkoutName}
                  placeholder="Workout name"
                  placeholderTextColor="#9ca3af"
                />

                <TextInput
                  style={styles.input}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="Duration"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Assigned Days (optional)</Text>

                <View style={styles.row}>
                  {WEEKDAY_OPTIONS.map((day) => (
                    <Chip
                      key={day}
                      label={day}
                      active={assignedDays.includes(day)}
                      onPress={() => toggleAssignedDay(day)}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={addOrUpdateTemplate}
                >
                  <Text style={styles.primaryButtonText}>
                    {editingTemplateId ? "Save Template" : "Add Template"}
                  </Text>
                </TouchableOpacity>
              </View>

              {selectedTemplate && (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>
                    Remove {selectedDay} from Selected Template
                  </Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeSelectedDayFromTemplate(selectedTemplate.id)}
                  >
                    <Text style={styles.removeButtonText}>
                      Remove {selectedDay}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <WorkoutExerciseManager
                selectedTemplate={selectedTemplate}
                exerciseName={exerciseName}
                setExerciseName={setExerciseName}
                sets={sets}
                setSets={setSets}
                reps={reps}
                setReps={setReps}
                weight={weight}
                setWeight={setWeight}
                exercisePregnancySafe={exercisePregnancySafe}
                setExercisePregnancySafe={setExercisePregnancySafe}
                exerciseLowImpact={exerciseLowImpact}
                setExerciseLowImpact={setExerciseLowImpact}
                editingExerciseId={editingExerciseId}
                saveExercise={saveExercise}
                resetExerciseForm={resetExerciseForm}
                startEditingExercise={startEditingExercise}
                deleteExercise={deleteExercise}
                moveExercise={moveExercise}
              />
            </>
          )}

          {activeTab === "overview" && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.infoText}>
                Build workout templates and assign them to multiple days.
              </Text>
            </View>
          )}

          {activeTab === "learn" && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Learn</Text>
              <Text style={styles.infoText}>
                You can add tips or training guidance here later.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0f1115",
  },

  container: {
    flex: 1,
    backgroundColor: "#0f1115",
  },

  scrollContent: {
    paddingBottom: 24,
  },

  card: {
    backgroundColor: "#1c1f26",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#ffffff",
  },

  label: {
    color: "#d1d5db",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },

  infoText: {
    color: "#d1d5db",
    fontSize: 14,
    lineHeight: 20,
  },

  emptyText: {
    color: "#9ca3af",
    fontSize: 14,
  },

  input: {
    backgroundColor: "#2a2e38",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    color: "#ffffff",
  },

  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },

  primaryButton: {
    backgroundColor: "#4c8bf5",
    padding: 10,
    borderRadius: 8,
  },

  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    textAlign: "center",
  },

  swapList: {
    marginTop: 10,
  },

  swapRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2a2e38",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },

  swapRowActive: {
    backgroundColor: "#1e3a8a",
    borderWidth: 1,
    borderColor: "#60a5fa",
  },

  swapTextWrap: {
    flex: 1,
    marginRight: 12,
  },

  swapText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },

  swapSubText: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },

  swapStatus: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "600",
  },

  swapStatusActive: {
    color: "#dbeafe",
  },

  removeButton: {
    backgroundColor: "#3f1d1d",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  removeButtonText: {
    color: "#fca5a5",
    fontWeight: "600",
    textAlign: "center",
  },
});