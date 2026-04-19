import React, { useMemo, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";

import WeeklyPlanner from "@/components/common/WeeklyPlanner";
import { useAppTheme } from "@/context/ThemeContext";
import { useWorkouts } from "@/context/WorkoutsContext";
import { WorkoutExercise, WorkoutTemplate } from "@/types/workout";
import Chip from "../../components/workouts/chip";
import TopTab from "../../components/workouts/toptab";
import WorkoutExerciseManager from "../../components/workouts/WorkoutExerciseManager";
import WorkoutTemplateCard from "../../components/workouts/WorkoutTemplateCard";

type EditableExercise = {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
  pregnancySafe?: boolean;
  lowImpact?: boolean;
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

const formatLogDate = (dateString: string) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function WorkoutsScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const {
    templates,
    setTemplates,
    completeWorkout,
    completedLogs,
    deleteCompletedLog,
  } = useWorkouts();

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

  const [isCompleteModalVisible, setIsCompleteModalVisible] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  const [templateToComplete, setTemplateToComplete] =
    useState<WorkoutTemplate | null>(null);

  const selectedTemplate =
    templates.find((template) => template.id === selectedTemplateId) ?? null;

  const recentCompletedLogs = useMemo(() => {
    return completedLogs.slice(0, 8);
  }, [completedLogs]);

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
    return sortedTemplates.filter(
      (template) => template.assignedDays.length === 0
    );
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

  const resetCompleteWorkoutModal = () => {
    setIsCompleteModalVisible(false);
    setCompletionNotes("");
    setTemplateToComplete(null);
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

    const exercise: WorkoutExercise = {
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

  const startEditingExercise = (exercise: EditableExercise) => {
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

  const openCompleteWorkoutModal = (template: WorkoutTemplate) => {
    setTemplateToComplete(template);
    setCompletionNotes("");
    setIsCompleteModalVisible(true);
  };

  const handleConfirmCompleteWorkout = () => {
    if (!templateToComplete) return;

    completeWorkout(templateToComplete, completionNotes.trim());

    Alert.alert(
      "Workout completed",
      `${templateToComplete.workoutName} was added to your workout history.`
    );

    resetCompleteWorkoutModal();
  };

  const handleDeleteCompletedLog = (logId: string, workoutName: string) => {
    Alert.alert(
      "Remove workout history",
      `Remove "${workoutName}" from your history?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => deleteCompletedLog(logId),
        },
      ]
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
                    <View key={template.id} style={styles.dayWorkoutWrap}>
                      <WorkoutTemplateCard
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

                      <TouchableOpacity
                        style={styles.completeButton}
                        onPress={() => openCompleteWorkoutModal(template)}
                      >
                        <Text style={styles.completeButtonText}>
                          Complete Workout
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>
                    No workouts assigned to {selectedDay} yet.
                  </Text>
                )}
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Recent Workout History</Text>

                {recentCompletedLogs.length > 0 ? (
                  recentCompletedLogs.map((log) => (
                    <View key={log.id} style={styles.historyRow}>
                      <View style={styles.historyTopRow}>
                        <View style={styles.historyTextWrap}>
                          <Text style={styles.historyTitle}>
                            {log.workoutName}
                          </Text>
                          <Text style={styles.historyDate}>
                            {formatLogDate(log.date)}
                          </Text>
                          {log.notes ? (
                            <Text style={styles.historyNotes}>{log.notes}</Text>
                          ) : null}
                        </View>

                        <TouchableOpacity
                          style={styles.historyDeleteButton}
                          onPress={() =>
                            handleDeleteCompletedLog(log.id, log.workoutName)
                          }
                        >
                          <Text style={styles.historyDeleteButtonText}>
                            Remove
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>
                    No completed workouts yet.
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
                    const isAssigned =
                      template.assignedDays.includes(selectedDay);

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
                <Text style={styles.sectionTitle}>Backup Templates</Text>
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

                        <Text style={styles.swapStatus}>
                          Assign to {selectedDay}
                        </Text>
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
                  placeholderTextColor={colors.textSecondary}
                />

                <TextInput
                  style={styles.input}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="Duration"
                  placeholderTextColor={colors.textSecondary}
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
                    onPress={() =>
                      removeSelectedDayFromTemplate(selectedTemplate.id)
                    }
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

        <Modal
          visible={isCompleteModalVisible}
          transparent
          animationType="fade"
          onRequestClose={resetCompleteWorkoutModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Complete Workout</Text>

              <Text style={styles.modalSubtitle}>
                {templateToComplete?.workoutName ?? ""}
              </Text>

              <TextInput
                style={[styles.input, styles.notesInput]}
                value={completionNotes}
                onChangeText={setCompletionNotes}
                placeholder="Optional notes"
                placeholderTextColor={colors.textSecondary}
                multiline
              />

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={resetCompleteWorkoutModal}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={handleConfirmCompleteWorkout}
                >
                  <Text style={styles.modalSaveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },

    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scrollContent: {
      paddingBottom: 24,
    },

    card: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      marginHorizontal: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 10,
      color: colors.text,
    },

    label: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 10,
    },

    infoText: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },

    emptyText: {
      color: colors.textSecondary,
      fontSize: 14,
    },

    input: {
      backgroundColor: colors.inputBackground ?? colors.card,
      padding: 10,
      borderRadius: 8,
      marginBottom: 10,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },

    notesInput: {
      minHeight: 90,
      textAlignVertical: "top",
    },

    row: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 10,
    },

    primaryButton: {
      backgroundColor: colors.primary,
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
      backgroundColor: colors.inputBackground ?? colors.card,
      padding: 12,
      borderRadius: 10,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },

    swapRowActive: {
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.primary,
    },

    swapTextWrap: {
      flex: 1,
      marginRight: 12,
    },

    swapText: {
      color: colors.text,
      fontWeight: "600",
      fontSize: 14,
    },

    swapSubText: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },

    swapStatus: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
    },

    swapStatusActive: {
      color: "#ffffff",
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

    dayWorkoutWrap: {
      marginBottom: 12,
    },

    completeButton: {
      marginTop: 8,
      backgroundColor: "#14532d",
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 14,
    },

    completeButtonText: {
      color: "#dcfce7",
      fontWeight: "600",
      textAlign: "center",
    },

    historyRow: {
      backgroundColor: colors.inputBackground ?? colors.card,
      borderRadius: 10,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },

    historyTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },

    historyTextWrap: {
      flex: 1,
      marginRight: 12,
    },

    historyTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 4,
    },

    historyDate: {
      color: colors.primary,
      fontSize: 12,
      marginBottom: 4,
    },

    historyNotes: {
      color: colors.textSecondary,
      fontSize: 12,
    },

    historyDeleteButton: {
      backgroundColor: "#3f1d1d",
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 10,
    },

    historyDeleteButtonText: {
      color: "#fca5a5",
      fontSize: 12,
      fontWeight: "600",
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      paddingHorizontal: 20,
    },

    modalCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },

    modalTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 8,
    },

    modalSubtitle: {
      color: colors.primary,
      fontSize: 14,
      marginBottom: 12,
    },

    modalButtonRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
    },

    modalCancelButton: {
      backgroundColor: colors.inputBackground ?? colors.card,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },

    modalCancelButtonText: {
      color: colors.text,
      fontWeight: "600",
    },

    modalSaveButton: {
      backgroundColor: "#14532d",
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },

    modalSaveButtonText: {
      color: "#dcfce7",
      fontWeight: "600",
    },
  });