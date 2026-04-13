import { STORAGE_KEYS } from "@/constants/storage";
import {
  CompletedWorkoutLog,
  WorkoutTemplate,
} from "@/types/workout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type WorkoutsContextType = {
  templates: WorkoutTemplate[];
  completedLogs: CompletedWorkoutLog[];
  isLoading: boolean;

  setTemplates: React.Dispatch<React.SetStateAction<WorkoutTemplate[]>>;

  addTemplate: (template: WorkoutTemplate) => void;
  updateTemplate: (updatedTemplate: WorkoutTemplate) => void;
  deleteTemplate: (templateId: string) => void;

  completeWorkout: (template: WorkoutTemplate, notes?: string) => void;
  deleteCompletedLog: (logId: string) => void;
};

const WorkoutsContext = createContext<WorkoutsContextType | undefined>(undefined);

export function WorkoutsProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [completedLogs, setCompletedLogs] = useState<CompletedWorkoutLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkoutData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveTemplates();
    }
  }, [templates, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveCompletedLogs();
    }
  }, [completedLogs, isLoading]);

  const loadWorkoutData = async () => {
    try {
      const savedTemplates = await AsyncStorage.getItem(
        STORAGE_KEYS.WORKOUT_TEMPLATES
      );
      const savedCompletedLogs = await AsyncStorage.getItem(
        STORAGE_KEYS.COMPLETED_WORKOUT_LOGS
      );

      if (savedTemplates) {
        setTemplates(JSON.parse(savedTemplates));
      }

      if (savedCompletedLogs) {
        setCompletedLogs(JSON.parse(savedCompletedLogs));
      }
    } catch (error) {
      console.log("Failed to load workout data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplates = async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.WORKOUT_TEMPLATES,
        JSON.stringify(templates)
      );
    } catch (error) {
      console.log("Failed to save workout templates:", error);
    }
  };

  const saveCompletedLogs = async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.COMPLETED_WORKOUT_LOGS,
        JSON.stringify(completedLogs)
      );
    } catch (error) {
      console.log("Failed to save completed workout logs:", error);
    }
  };

  const addTemplate = (template: WorkoutTemplate) => {
    setTemplates((prev) => [...prev, template]);
  };

  const updateTemplate = (updatedTemplate: WorkoutTemplate) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === updatedTemplate.id ? updatedTemplate : template
      )
    );
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates((prev) => prev.filter((template) => template.id !== templateId));
  };

  const completeWorkout = (template: WorkoutTemplate, notes = "") => {
    const newLog: CompletedWorkoutLog = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      workoutTemplateId: template.id,
      workoutName: template.workoutName,
      notes,
    };

    setCompletedLogs((prev) => [newLog, ...prev]);
  };

  const deleteCompletedLog = (logId: string) => {
    setCompletedLogs((prev) => prev.filter((log) => log.id !== logId));
  };

  const value = useMemo(
    () => ({
      templates,
      completedLogs,
      isLoading,
      setTemplates,
      addTemplate,
      updateTemplate,
      deleteTemplate,
      completeWorkout,
      deleteCompletedLog,
    }),
    [templates, completedLogs, isLoading]
  );

  return (
    <WorkoutsContext.Provider value={value}>
      {children}
    </WorkoutsContext.Provider>
  );
}

export function useWorkouts() {
  const context = useContext(WorkoutsContext);

  if (!context) {
    throw new Error("useWorkouts must be used inside a WorkoutsProvider");
  }

  return context;
}