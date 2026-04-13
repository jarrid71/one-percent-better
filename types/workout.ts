export type WorkoutExercise = {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
  pregnancySafe: boolean;
  lowImpact: boolean;
};

export type WorkoutTemplate = {
  id: string;
  workoutName: string;
  duration: string;
  exercises: WorkoutExercise[];
  assignedDays: string[];
};

export type CompletedWorkoutLog = {
  id: string;
  date: string;
  workoutTemplateId: string;
  workoutName: string;
  notes: string;
};