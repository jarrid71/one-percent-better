import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useUserProfile } from "../../context/UserProfileContext";

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
  weekday: string;
  workoutName: string;
  duration: string;
  exercises: Exercise[];
};

type WorkoutStatus = "pending" | "done" | "missed";

type WorkoutLog = {
  date: string;
  templateId: string;
  status: WorkoutStatus;
};

type ProgressEntry = {
  id: string;
  date: string;
  exerciseName: string;
  weight: number;
  reps: number;
  sets: number;
};

type WorkoutTab = "overview" | "plan" | "learn";

type GoalPlan = {
  id: string;
  title: string;
  goal: "Build Muscle" | "Lose Fat" | "Maintain" | "Get Fitter";
  description: string;
  daysPerWeek: string;
  pregnancySafe?: boolean;
  lowImpactOnly?: boolean;
  templates: WorkoutTemplate[];
};

type Tutorial = {
  id: string;
  title: string;
  content: string;
};

type ExerciseLibraryItem = {
  key: string;
  name: string;
  howTo: string[];
  muscles: string[];
  mistakes: string[];
  pregnancySafe: boolean;
  lowImpact: boolean;
};

const WEEKDAY_OPTIONS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const BEGINNER_TUTORIALS: Tutorial[] = [
  {
    id: "t1",
    title: "What are sets and reps?",
    content:
      "Reps are how many times you do an exercise in one go. Sets are how many rounds of those reps you do. Example: 3 sets of 10 reps means 10 reps, rest, then repeat 3 times.",
  },
  {
    id: "t2",
    title: "How heavy should I start?",
    content:
      "Start with a weight you can control with good form. You should finish your set feeling like you could do 1 to 3 more reps.",
  },
  {
    id: "t3",
    title: "How long should I rest?",
    content:
      "For most beginner workouts, rest 60 to 90 seconds between sets. Heavier compound lifts can need 2 to 3 minutes.",
  },
  {
    id: "t4",
    title: "How many days should I train?",
    content:
      "Most beginners do well with 3 days per week. It is enough to make progress without burning out.",
  },
  {
    id: "t5",
    title: "What matters most?",
    content:
      "Consistency, good form, sleep, and gradually improving over time matter more than smashing yourself every workout.",
  },
];

const EXERCISE_LIBRARY: ExerciseLibraryItem[] = [
  {
    key: "bench press",
    name: "Bench Press",
    howTo: [
      "Lie flat with feet planted on the floor.",
      "Grip the bar just wider than shoulder width.",
      "Lower the bar to mid chest with control.",
      "Press back up while keeping your shoulders stable.",
    ],
    muscles: ["Chest", "Front shoulders", "Triceps"],
    mistakes: ["Bouncing the bar", "Flaring elbows too much", "Feet moving around"],
    pregnancySafe: false,
    lowImpact: true,
  },
  {
    key: "squat",
    name: "Squat",
    howTo: [
      "Stand with feet about shoulder width apart.",
      "Brace your core and keep your chest up.",
      "Sit down and back while bending your knees.",
      "Drive through your feet to stand back up.",
    ],
    muscles: ["Quads", "Glutes", "Core"],
    mistakes: ["Knees caving in", "Heels lifting", "Rounding your back"],
    pregnancySafe: true,
    lowImpact: true,
  },
  {
    key: "deadlift",
    name: "Deadlift",
    howTo: [
      "Stand close to the bar with feet under hips.",
      "Hinge at the hips and grip the bar.",
      "Brace hard and keep your back neutral.",
      "Push through the floor and stand tall.",
    ],
    muscles: ["Hamstrings", "Glutes", "Back"],
    mistakes: ["Rounded back", "Bar too far from body", "Yanking the bar"],
    pregnancySafe: false,
    lowImpact: true,
  },
  {
    key: "shoulder press",
    name: "Shoulder Press",
    howTo: [
      "Start with the weight at shoulder height.",
      "Brace your core and keep ribs down.",
      "Press overhead in a straight path.",
      "Lower back down with control.",
    ],
    muscles: ["Shoulders", "Triceps", "Upper chest"],
    mistakes: ["Leaning back too much", "Pressing unevenly", "Shrugging shoulders up"],
    pregnancySafe: true,
    lowImpact: true,
  },
  {
    key: "lat pulldown",
    name: "Lat Pulldown",
    howTo: [
      "Sit tall and secure your legs.",
      "Pull the bar down toward your upper chest.",
      "Drive elbows down and back.",
      "Return slowly to the start.",
    ],
    muscles: ["Lats", "Upper back", "Biceps"],
    mistakes: ["Pulling behind the neck", "Swinging body", "Using too much momentum"],
    pregnancySafe: true,
    lowImpact: true,
  },
  {
    key: "barbell row",
    name: "Barbell Row",
    howTo: [
      "Hinge at the hips with a flat back.",
      "Hold the bar just below your knees.",
      "Row the bar toward your lower ribs.",
      "Lower the bar under control.",
    ],
    muscles: ["Upper back", "Lats", "Rear shoulders"],
    mistakes: ["Standing too upright", "Jerking the weight", "Rounded spine"],
    pregnancySafe: false,
    lowImpact: true,
  },
  {
    key: "push up",
    name: "Push Up",
    howTo: [
      "Start in a straight plank position.",
      "Lower your chest toward the floor.",
      "Keep elbows at a slight angle from the body.",
      "Press back up without sagging your hips.",
    ],
    muscles: ["Chest", "Shoulders", "Triceps", "Core"],
    mistakes: ["Hips sagging", "Half reps", "Head dropping"],
    pregnancySafe: false,
    lowImpact: false,
  },
  {
    key: "leg press",
    name: "Leg Press",
    howTo: [
      "Place feet shoulder width on the platform.",
      "Lower the sled until knees are bent comfortably.",
      "Keep your lower back flat on the pad.",
      "Press the sled back up without locking hard.",
    ],
    muscles: ["Quads", "Glutes", "Hamstrings"],
    mistakes: ["Knees collapsing inward", "Depth too deep", "Bouncing out of the bottom"],
    pregnancySafe: true,
    lowImpact: true,
  },
  {
    key: "goblet squat",
    name: "Goblet Squat",
    howTo: [
      "Hold one dumbbell close to your chest.",
      "Brace your core and squat down.",
      "Keep elbows close and chest upright.",
      "Stand back up through the whole foot.",
    ],
    muscles: ["Quads", "Glutes", "Core"],
    mistakes: ["Holding weight too far forward", "Heels lifting", "Dropping chest"],
    pregnancySafe: true,
    lowImpact: true,
  },
  {
    key: "romanian deadlift",
    name: "Romanian Deadlift",
    howTo: [
      "Start standing tall with soft knees.",
      "Push hips back while lowering the weight.",
      "Keep the weight close to your legs.",
      "Stand tall by squeezing glutes.",
    ],
    muscles: ["Hamstrings", "Glutes", "Lower back"],
    mistakes: ["Turning it into a squat", "Rounded back", "Weight drifting away"],
    pregnancySafe: false,
    lowImpact: true,
  },
  {
    key: "walking",
    name: "Walking",
    howTo: [
      "Stand tall and keep a steady pace.",
      "Swing your arms naturally.",
      "Breathe steadily and keep posture upright.",
      "Slow down if needed and build time slowly.",
    ],
    muscles: ["Legs", "Glutes", "Cardio"],
    mistakes: ["Starting too fast", "Poor posture", "Too much too soon"],
    pregnancySafe: true,
    lowImpact: true,
  },
  {
    key: "step up",
    name: "Step Up",
    howTo: [
      "Use a stable platform.",
      "Step up with one foot and drive through the heel.",
      "Stand tall at the top.",
      "Step down under control.",
    ],
    muscles: ["Quads", "Glutes", "Balance"],
    mistakes: ["Pushing off the bottom leg too much", "Using an unstable surface", "Falling forward"],
    pregnancySafe: true,
    lowImpact: true,
  },
];

const GOAL_PLANS: GoalPlan[] = [
  {
    id: "g1",
    title: "Beginner Muscle Gain",
    goal: "Build Muscle",
    description:
      "A simple 3-day full body plan that is great for beginners who want size and confidence in the gym.",
    daysPerWeek: "3",
    templates: [
      {
        id: "gp1",
        weekday: "Monday",
        workoutName: "Full Body A",
        duration: "60",
        exercises: [
          {
            id: "gp1e1",
            name: "Goblet Squat",
            sets: "3",
            reps: "10",
            weight: "20",
            pregnancySafe: true,
            lowImpact: true,
          },
          {
            id: "gp1e2",
            name: "Bench Press",
            sets: "3",
            reps: "8",
            weight: "40",
            pregnancySafe: false,
            lowImpact: true,
          },
          {
            id: "gp1e3",
            name: "Lat Pulldown",
            sets: "3",
            reps: "10",
            weight: "35",
            pregnancySafe: true,
            lowImpact: true,
          },
        ],
      },
      {
        id: "gp2",
        weekday: "Wednesday",
        workoutName: "Full Body B",
        duration: "60",
        exercises: [
          {
            id: "gp2e1",
            name: "Romanian Deadlift",
            sets: "3",
            reps: "10",
            weight: "40",
            pregnancySafe: false,
            lowImpact: true,
          },
          {
            id: "gp2e2",
            name: "Shoulder Press",
            sets: "3",
            reps: "10",
            weight: "20",
            pregnancySafe: true,
            lowImpact: true,
          },
          {
            id: "gp2e3",
            name: "Barbell Row",
            sets: "3",
            reps: "10",
            weight: "35",
            pregnancySafe: false,
            lowImpact: true,
          },
        ],
      },
      {
        id: "gp3",
        weekday: "Friday",
        workoutName: "Full Body C",
        duration: "60",
        exercises: [
          {
            id: "gp3e1",
            name: "Leg Press",
            sets: "3",
            reps: "12",
            weight: "80",
            pregnancySafe: true,
            lowImpact: true,
          },
          {
            id: "gp3e2",
            name: "Bench Press",
            sets: "3",
            reps: "10",
            weight: "45",
            pregnancySafe: false,
            lowImpact: true,
          },
          {
            id: "gp3e3",
            name: "Lat Pulldown",
            sets: "3",
            reps: "12",
            weight: "30",
            pregnancySafe: true,
            lowImpact: true,
          },
        ],
      },
    ],
  },
  {
    id: "g2",
    title: "Fat Loss Starter",
    goal: "Lose Fat",
    description:
      "A 3-day full body setup with moderate lifting and steady activity. Great for building fitness while dropping body fat.",
    daysPerWeek: "3",
    templates: [
      {
        id: "gp4",
        weekday: "Monday",
        workoutName: "Full Body",
        duration: "50",
        exercises: [
          {
            id: "gp4e1",
            name: "Goblet Squat",
            sets: "3",
            reps: "15",
            weight: "10",
            pregnancySafe: true,
            lowImpact: true,
          },
          {
            id: "gp4e2",
            name: "Push Up",
            sets: "3",
            reps: "10",
            weight: "0",
            pregnancySafe: false,
            lowImpact: false,
          },
          {
            id: "gp4e3",
            name: "Step Up",
            sets: "3",
            reps: "12",
            weight: "0",
            pregnancySafe: true,
            lowImpact: true,
          },
        ],
      },
      {
        id: "gp5",
        weekday: "Wednesday",
        workoutName: "Full Body",
        duration: "50",
        exercises: [
          {
            id: "gp5e1",
            name: "Leg Press",
            sets: "3",
            reps: "12",
            weight: "60",
            pregnancySafe: true,
            lowImpact: true,
          },
          {
            id: "gp5e2",
            name: "Shoulder Press",
            sets: "3",
            reps: "12",
            weight: "20",
            pregnancySafe: true,
            lowImpact: true,
          },
          {
            id: "gp5e3",
            name: "Lat Pulldown",
            sets: "3",
            reps: "12",
            weight: "30",
            pregnancySafe: true,
            lowImpact: true,
          },
        ],
      },
      {
        id: "gp6",
        weekday: "Friday",
        workoutName: "Cardio Strength",
        duration: "45",
        exercises: [
          {
            id: "gp6e1",
            name: "Walking",
            sets: "1",
            reps: "20",
            weight: "0",
            pregnancySafe: true,
            lowImpact: true,
          },
          {
            id: "gp6e2",
            name: "Goblet Squat",
            sets: "3",
            reps: "12",
            weight: "10",
            pregnancySafe: true,
            lowImpact: true,
          },
          {
            id: "gp6e3",
            name: "Step Up",
            sets: "3",
            reps: "12",
            weight: "0",
            pregnancySafe: true,
            lowImpact: true,
          },
        ],
      },
    ],
  },
  {
    id: "g3",
    title: "Beginner Strength",
    goal: "Get Fitter",
    description:
      "A strength-style setup with lower reps on the main lifts and solid rest between sessions.",
    daysPerWeek: "3",
    templates: [
      {
        id: "gp7",
        weekday: "Monday",
        workoutName: "Strength A",
        duration: "65",
        exercises: [
          {
            id: "gp7e1",
            name: "Squat",
            sets: "5",
            reps: "5",
            weight: "60",
            pregnancySafe: true,
            lowImpact: true,
          },
          {
            id: "gp7e2",
            name: "Bench Press",
            sets: "5",
            reps: "5",
            weight: "45",
            pregnancySafe: false,
            lowImpact: true,
          },
          {
            id: "gp7e3",
            name: "Barbell Row",
            sets: "4",
            reps: "6",
            weight: "40",
            pregnancySafe: false,
            lowImpact: true,
          },
        ],
      },
      {
        id: "gp8",
        weekday: "Wednesday",
        workoutName: "Strength B",
        duration: "65",
        exercises: [
          {
            id: "gp8e1",
            name: "Deadlift",
            sets: "3",
            reps: "5",
            weight: "70",
            pregnancySafe: false,
            lowImpact: true,
          },
          {
            id: "gp8e2",
            name: "Shoulder Press",
            sets: "5",
            reps: "5",
            weight: "30",
            pregnancySafe: true,
            lowImpact: true,
          },
          {
            id: "gp8e3",
            name: "Lat Pulldown",
            sets: "4",
            reps: "8",
            weight: "35",
            pregnancySafe: true,
            lowImpact: true,
          },
        ],
      },
      {
        id: "gp9",
        weekday: "Friday",
        workoutName: "Strength A",
        duration: "65",
        exercises: [
          {
            id: "gp9e1",
            name: "Squat",
            sets: "5",
            reps: "5",
            weight: "62.5",
            pregnancySafe: true,
            lowImpact: true,
          },
          {
            id: "gp9e2",
            name: "Bench Press",
            sets: "5",
            reps: "5",
            weight: "47.5",
            pregnancySafe: false,
            lowImpact: true,
          },
          {
            id: "gp9e3",
            name: "Barbell Row",
            sets: "4",
            reps: "6",
            weight: "42.5",
            pregnancySafe: false,
            lowImpact: true,
          },
        ],
      },
    ],
  },
  {
    id: "g4",
    title: "Pregnancy Safe Starter",
    goal: "Maintain",
    description:
      "A gentle low-impact plan using safer exercise choices. This should still be checked with a doctor or midwife before training.",
    daysPerWeek: "3",
    pregnancySafe: true,
    lowImpactOnly: true,
    templates: [
      {
        id: "gp10",
        weekday: "Monday",
        workoutName: "Gentle Lower Body",
        duration: "30",
        exercises: [
          {
            id: "gp10e1",
            name: "Walking",
            sets: "1",
            reps: "15",
            weight: "0",
            pregnancySafe: true,
            lowImpact: true,
          },
          {
            id: "gp10e2",
            name: "Goblet Squat",
            sets: "2",
            reps: "10",
            weight: "5",
            pregnancySafe: true,
            lowImpact: true,
          },
          {
            id: "gp10e3",
            name: "Step Up",
            sets: "2",
            reps: "10",
            weight: "0",
            pregnancySafe: true,
            lowImpact: true,
          },
        ],
      },
      {
        id: "gp11",
        weekday: "Wednesday",
        workoutName: "Upper Body Easy",
        duration: "30",
        exercises: [
          {
            id: "gp11e1",
            name: "Lat Pulldown",
            sets: "2",
            reps: "12",
            weight: "20",
            pregnancySafe: true,
            lowImpact: true,
          },
          {
            id: "gp11e2",
            name: "Shoulder Press",
            sets: "2",
            reps: "10",
            weight: "10",
            pregnancySafe: true,
            lowImpact: true,
          },
          {
            id: "gp11e3",
            name: "Walking",
            sets: "1",
            reps: "10",
            weight: "0",
            pregnancySafe: true,
            lowImpact: true,
          },
        ],
      },
      {
        id: "gp12",
        weekday: "Friday",
        workoutName: "Full Body Light",
        duration: "30",
        exercises: [
          {
            id: "gp12e1",
            name: "Leg Press",
            sets: "2",
            reps: "12",
            weight: "30",
            pregnancySafe: true,
            lowImpact: true,
          },
          {
            id: "gp12e2",
            name: "Lat Pulldown",
            sets: "2",
            reps: "12",
            weight: "20",
            pregnancySafe: true,
            lowImpact: true,
          },
          {
            id: "gp12e3",
            name: "Walking",
            sets: "1",
            reps: "15",
            weight: "0",
            pregnancySafe: true,
            lowImpact: true,
          },
        ],
      },
    ],
  },
];

function TopTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.topTab, active && styles.topTabActive]}
      onPress={onPress}
    >
      <Text style={[styles.topTabText, active && styles.topTabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function WorkoutsScreen() {
  const { profile } = useUserProfile();

  const [activeTab, setActiveTab] = useState<WorkoutTab>("overview");
  const [activePlanName, setActivePlanName] = useState("My Workout Plan");

  const [weekday, setWeekday] = useState("");
  const [workoutName, setWorkoutName] = useState("");
  const [duration, setDuration] = useState("");

  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [exercisePregnancySafe, setExercisePregnancySafe] = useState(false);
  const [exerciseLowImpact, setExerciseLowImpact] = useState(false);

  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [openHowToExerciseId, setOpenHowToExerciseId] = useState<string | null>(null);
  const [selectedProgressExercise, setSelectedProgressExercise] = useState("");

  const [templates, setTemplates] = useState<WorkoutTemplate[]>([
    {
      id: "1",
      weekday: "Monday",
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
        {
          id: "1-2",
          name: "Shoulder Press",
          sets: "3",
          reps: "10",
          weight: "50",
          pregnancySafe: true,
          lowImpact: true,
        },
      ],
    },
    {
      id: "2",
      weekday: "Wednesday",
      workoutName: "Legs",
      duration: "70",
      exercises: [
        {
          id: "2-1",
          name: "Squat",
          sets: "4",
          reps: "8",
          weight: "100",
          pregnancySafe: true,
          lowImpact: true,
        },
      ],
    },
  ]);

  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);

  const isMale = profile.sex === "Male";
  const pregnancySafeMode = !isMale && profile.pregnancySafe;
  const lowImpactOnly = !isMale && profile.pregnancySafe;

  const displayGoal =
    profile.goal === "Lose Fat"
      ? "Lose Fat"
      : profile.goal === "Build Muscle"
      ? "Build Muscle"
      : profile.goal === "Maintain"
      ? "Maintain"
      : "Get Fitter";

  const selectedTemplate =
    templates.find((template) => template.id === selectedTemplateId) ?? null;

  const sortedTemplates = useMemo(() => {
    return [...templates].sort(
      (a, b) => WEEKDAY_OPTIONS.indexOf(a.weekday) - WEEKDAY_OPTIONS.indexOf(b.weekday)
    );
  }, [templates]);

  const suggestedCaloriesBurn = useMemo(() => {
    const bodyWeight = Number(profile.weightKg || 0);
    const minutes = Number(profile.sessionMinutes || 45);

    if (!bodyWeight) {
      return Math.round(5 * (minutes / 60) * 75);
    }

    return Math.round(5 * bodyWeight * (minutes / 60));
  }, [profile.weightKg, profile.sessionMinutes]);

  const filteredGoalPlans = useMemo(() => {
    return GOAL_PLANS.filter((plan) => {
      if (plan.goal !== displayGoal) return false;
      if (pregnancySafeMode && !plan.pregnancySafe) return false;
      if (lowImpactOnly && !plan.lowImpactOnly && plan.pregnancySafe !== true) return false;
      return true;
    });
  }, [displayGoal, pregnancySafeMode, lowImpactOnly]);

  const exerciseLibrary = useMemo(() => {
    return EXERCISE_LIBRARY.filter((item) => {
      if (pregnancySafeMode && !item.pregnancySafe) return false;
      if (lowImpactOnly && !item.lowImpact) return false;
      return true;
    });
  }, [pregnancySafeMode, lowImpactOnly]);

  const pregnancyNotice = useMemo(() => {
    if (isMale) return null;
    if (!pregnancySafeMode) return null;
    return "Pregnancy-safe mode is on, so plans and exercises are filtered more carefully.";
  }, [isMale, pregnancySafeMode]);

  const formatDateKey = (date: Date) => {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${y}-${m}-${d}`;
  };

  const weekdayFromDate = (date: Date) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  };

  const getLogStatus = (date: string, templateId: string): WorkoutStatus => {
    const existing = logs.find((log) => log.date === date && log.templateId === templateId);
    return existing?.status ?? "pending";
  };

  const currentMonthLabel = useMemo(() => {
    const now = new Date();
    return now.toLocaleString("en-AU", { month: "long", year: "numeric" });
  }, []);

  const calendarCells = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0).getDate();

    const jsStartDay = firstDay.getDay();
    const mondayOffset = jsStartDay === 0 ? 6 : jsStartDay - 1;

    const cells: Array<{
      empty: boolean;
      key: string;
      date?: Date;
      day?: number;
      template?: WorkoutTemplate | null;
      status?: WorkoutStatus | null;
    }> = [];

    for (let i = 0; i < mondayOffset; i += 1) {
      cells.push({ empty: true, key: `empty-${i}` });
    }

    for (let d = 1; d <= lastDate; d += 1) {
      const date = new Date(year, month, d);
      const weekdayName = weekdayFromDate(date);
      const template = templates.find((t) => t.weekday === weekdayName) ?? null;
      const key = formatDateKey(date);
      const status = template ? getLogStatus(key, template.id) : null;

      cells.push({
        empty: false,
        date,
        key,
        day: d,
        template,
        status,
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push({ empty: true, key: `end-${cells.length}` });
    }

    return cells;
  }, [templates, logs]);

  const progressExerciseNames = useMemo(() => {
    const names = [...new Set(progressEntries.map((entry) => entry.exerciseName))];
    return names.sort();
  }, [progressEntries]);

  const selectedExerciseProgress = useMemo(() => {
    return progressEntries
      .filter((entry) => entry.exerciseName === selectedProgressExercise)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-8);
  }, [progressEntries, selectedProgressExercise]);

  const maxProgressWeight = useMemo(() => {
    if (selectedExerciseProgress.length === 0) return 1;
    return Math.max(...selectedExerciseProgress.map((entry) => entry.weight), 1);
  }, [selectedExerciseProgress]);

  const weeklyVolume = useMemo(() => {
    return progressEntries
      .slice(-20)
      .reduce((total, entry) => total + entry.weight * entry.reps * entry.sets, 0);
  }, [progressEntries]);

  const estimatedOneRepMax = useMemo(() => {
    if (selectedExerciseProgress.length === 0) return null;
    const last = selectedExerciseProgress[selectedExerciseProgress.length - 1];
    const estimated = last.weight * (1 + last.reps / 30);
    return Math.round(estimated);
  }, [selectedExerciseProgress]);

  const getLibraryItem = (exerciseNameToFind: string) => {
    const lower = exerciseNameToFind.toLowerCase();

    return (
      EXERCISE_LIBRARY.find(
        (item) => lower === item.key || lower.includes(item.key) || item.key.includes(lower)
      ) ?? null
    );
  };

  const getExerciseFlags = (name: string) => {
    const libItem = getLibraryItem(name);

    return {
      pregnancySafe: libItem?.pregnancySafe ?? false,
      lowImpact: libItem?.lowImpact ?? false,
    };
  };

  const resetTemplateForm = () => {
    setEditingTemplateId(null);
    setWeekday("");
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
    if (!weekday || !workoutName || !duration) return;

    const duplicate = templates.some(
      (template) => template.weekday === weekday && template.id !== editingTemplateId
    );

    if (duplicate) return;

    if (editingTemplateId) {
      setTemplates((prev) =>
        prev.map((template) =>
          template.id === editingTemplateId
            ? { ...template, weekday, workoutName, duration }
            : template
        )
      );
    } else {
      const newTemplate: WorkoutTemplate = {
        id: makeId(),
        weekday,
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
    setWeekday(template.weekday);
    setWorkoutName(template.workoutName);
    setDuration(template.duration);
  };

  const deleteTemplate = (id: string) => {
    const updated = templates.filter((template) => template.id !== id);
    setTemplates(updated);
    setLogs((prev) => prev.filter((log) => log.templateId !== id));

    if (selectedTemplateId === id) {
      setSelectedTemplateId(updated[0]?.id ?? "");
    }

    if (editingTemplateId === id) {
      resetTemplateForm();
    }
  };

  const duplicateTemplate = (template: WorkoutTemplate) => {
    const newTemplate: WorkoutTemplate = {
      ...template,
      id: makeId(),
      weekday: "",
      workoutName: `${template.workoutName} Copy`,
      exercises: template.exercises.map((exercise) => ({
        ...exercise,
        id: makeId(),
      })),
    };

    setTemplates((prev) => [...prev, newTemplate]);
    setSelectedTemplateId(newTemplate.id);
    setEditingTemplateId(newTemplate.id);
    setWeekday("");
    setWorkoutName(newTemplate.workoutName);
    setDuration(newTemplate.duration);
  };

  const saveExercise = () => {
    if (!selectedTemplateId || !exerciseName || !sets || !reps || !weight) return;

    if (editingExerciseId) {
      setTemplates((prev) =>
        prev.map((template) =>
          template.id === selectedTemplateId
            ? {
                ...template,
                exercises: template.exercises.map((exercise) =>
                  exercise.id === editingExerciseId
                    ? {
                        ...exercise,
                        name: exerciseName,
                        sets,
                        reps,
                        weight,
                        pregnancySafe: exercisePregnancySafe,
                        lowImpact: exerciseLowImpact,
                      }
                    : exercise
                ),
              }
            : template
        )
      );
    } else {
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
    }

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
              exercises: template.exercises.filter((exercise) => exercise.id !== exerciseId),
            }
          : template
      )
    );

    if (editingExerciseId === exerciseId) {
      resetExerciseForm();
    }

    if (openHowToExerciseId === exerciseId) {
      setOpenHowToExerciseId(null);
    }
  };

  const moveExercise = (templateId: string, exerciseId: string, direction: "up" | "down") => {
    setTemplates((prev) =>
      prev.map((template) => {
        if (template.id !== templateId) return template;

        const index = template.exercises.findIndex((exercise) => exercise.id === exerciseId);
        if (index === -1) return template;

        const newExercises = [...template.exercises];
        const swapIndex = direction === "up" ? index - 1 : index + 1;

        if (swapIndex < 0 || swapIndex >= newExercises.length) return template;

        [newExercises[index], newExercises[swapIndex]] = [
          newExercises[swapIndex],
          newExercises[index],
        ];

        return { ...template, exercises: newExercises };
      })
    );
  };

  const saveProgressSnapshot = (date: string, templateId: string) => {
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;

    const otherEntries = progressEntries.filter(
      (entry) =>
        !(
          entry.date === date &&
          template.exercises.some((exercise) => exercise.name === entry.exerciseName)
        )
    );

    const newEntries: ProgressEntry[] = template.exercises.map((exercise) => ({
      id: `${date}-${templateId}-${exercise.id}`,
      date,
      exerciseName: exercise.name,
      weight: Number(exercise.weight || 0),
      reps: Number(exercise.reps || 0),
      sets: Number(exercise.sets || 0),
    }));

    setProgressEntries([...otherEntries, ...newEntries]);

    if (!selectedProgressExercise && newEntries.length > 0) {
      setSelectedProgressExercise(newEntries[0].exerciseName);
    }
  };

  const updateLogStatus = (date: string, templateId: string, status: WorkoutStatus) => {
    setLogs((prev) => {
      const existing = prev.find((log) => log.date === date && log.templateId === templateId);

      if (existing) {
        return prev.map((log) =>
          log.date === date && log.templateId === templateId ? { ...log, status } : log
        );
      }

      return [...prev, { date, templateId, status }];
    });

    if (status === "done") {
      saveProgressSnapshot(date, templateId);
    }
  };

  const useGoalPlan = (plan: GoalPlan) => {
    const copiedTemplates = plan.templates.map((template) => ({
      ...template,
      id: makeId(),
      exercises: template.exercises.map((exercise) => ({
        ...exercise,
        id: makeId(),
      })),
    }));

    setTemplates(copiedTemplates);
    setActivePlanName(plan.title);
    setSelectedTemplateId(copiedTemplates[0]?.id ?? "");
    setActiveTab("plan");
    resetTemplateForm();
    resetExerciseForm();
  };

  const statusStyle = (status: WorkoutStatus | null | undefined) => {
    if (status === "done") return styles.cellDone;
    if (status === "missed") return styles.cellMissed;
    if (status === "pending") return styles.cellPending;
    return styles.cellNone;
  };

  const summaryTitle =
    pregnancySafeMode
      ? "Pregnancy-Safe Workouts"
      : lowImpactOnly
      ? "Low Impact Workouts"
      : "Workout Overview";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Workouts</Text>

      <View style={styles.topTabRow}>
        <TopTab
          label="Overview"
          active={activeTab === "overview"}
          onPress={() => setActiveTab("overview")}
        />
        <TopTab
          label="Plan"
          active={activeTab === "plan"}
          onPress={() => setActiveTab("plan")}
        />
        <TopTab
          label="Learn"
          active={activeTab === "learn"}
          onPress={() => setActiveTab("learn")}
        />
      </View>

      {activeTab === "overview" && (
        <>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{summaryTitle}</Text>
            <Text style={styles.info}>Name: {profile.name || "Not set"}</Text>
            <Text style={styles.info}>Sex: {profile.sex}</Text>
            <Text style={styles.info}>Goal: {profile.goal}</Text>
            <Text style={styles.info}>Experience: {profile.experience}</Text>
            <Text style={styles.info}>Training days: {profile.trainingDays || "3"}</Text>
            <Text style={styles.info}>Session length: {profile.sessionMinutes || "45"} mins</Text>
            <Text style={styles.info}>Estimated calories burned: {suggestedCaloriesBurn}</Text>

            {!isMale && (
              <Text style={styles.info}>
                Pregnancy-safe mode: {profile.pregnancySafe ? "On" : "Off"}
              </Text>
            )}

            {pregnancyNotice ? <Text style={styles.notice}>{pregnancyNotice}</Text> : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Current Plan</Text>
            <Text style={styles.info}>Plan name: {activePlanName}</Text>
            <Text style={styles.info}>Workout days: {templates.length}</Text>
            <Text style={styles.smallText}>
              Your workouts now follow the shared Profile tab instead of using a separate profile
              inside Workouts.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>This Month</Text>
            <Text style={styles.monthLabel}>{currentMonthLabel}</Text>

            <View style={styles.calendarHeaderRow}>
              {WEEKDAY_HEADERS.map((day) => (
                <Text key={day} style={styles.calendarHeaderText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarCells.map((cell) => {
                if (cell.empty) {
                  return <View key={cell.key} style={[styles.calendarCell, styles.cellEmpty]} />;
                }

                return (
                  <TouchableOpacity
                    key={cell.key}
                    style={[styles.calendarCell, statusStyle(cell.status)]}
                    onPress={() => {
                      if (!cell.template || !cell.date) return;

                      const dateKey = formatDateKey(cell.date);
                      const current = getLogStatus(dateKey, cell.template.id);

                      const next =
                        current === "pending"
                          ? "done"
                          : current === "done"
                          ? "missed"
                          : "pending";

                      updateLogStatus(dateKey, cell.template.id, next);
                    }}
                  >
                    <Text style={styles.calendarDay}>{cell.day}</Text>
                    <Text style={styles.calendarWorkoutText}>
                      {cell.template ? cell.template.workoutName : "-"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.smallText}>
              Tap a workout day to cycle through Pending, Done, and Missed.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Progress</Text>
            <Text style={styles.info}>Weekly Volume: {weeklyVolume} kg</Text>
            <Text style={styles.info}>
              Estimated 1RM: {estimatedOneRepMax ? `${estimatedOneRepMax} kg` : "No data yet"}
            </Text>

            {progressExerciseNames.length > 0 ? (
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.optionRow}
                >
                  {progressExerciseNames.map((name) => (
                    <Chip
                      key={name}
                      label={name}
                      selected={selectedProgressExercise === name}
                      onPress={() => setSelectedProgressExercise(name)}
                    />
                  ))}
                </ScrollView>

                {selectedExerciseProgress.map((entry) => {
                  const widthPercent: `${number}%` = `${(entry.weight / maxProgressWeight) * 100}%`;

                  return (
                    <View key={entry.id} style={styles.progressRow}>
                      <Text style={styles.progressDate}>{entry.date}</Text>

                      <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBarFill, { width: widthPercent }]} />
                      </View>

                      <Text style={styles.progressValue}>{entry.weight} kg</Text>
                    </View>
                  );
                })}
              </>
            ) : (
              <Text style={styles.smallText}>
                Mark workouts as done to start building progress history.
              </Text>
            )}
          </View>
        </>
      )}

      {activeTab === "plan" && (
        <>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              {editingTemplateId ? "Edit Workout Day" : "Add Workout Day"}
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.optionRow}
            >
              {WEEKDAY_OPTIONS.map((day) => (
                <Chip
                  key={day}
                  label={day}
                  selected={weekday === day}
                  onPress={() => setWeekday(day)}
                />
              ))}
            </ScrollView>

            <TextInput
              style={styles.input}
              value={workoutName}
              onChangeText={setWorkoutName}
              placeholder="Workout name"
              placeholderTextColor="#777"
            />

            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="Duration in minutes"
              placeholderTextColor="#777"
              keyboardType="numeric"
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.primaryButton} onPress={addOrUpdateTemplate}>
                <Text style={styles.primaryButtonText}>
                  {editingTemplateId ? "Save Workout Day" : "Add Workout Day"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={resetTemplateForm}>
                <Text style={styles.secondaryButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Goal Plans</Text>

            {filteredGoalPlans.length > 0 ? (
              filteredGoalPlans.map((plan) => (
                <View key={plan.id} style={styles.listCard}>
                  <Text style={styles.listTitle}>{plan.title}</Text>
                  <Text style={styles.smallText}>{plan.description}</Text>
                  <Text style={styles.smallText}>Days per week: {plan.daysPerWeek}</Text>

                  <TouchableOpacity style={styles.primaryButton} onPress={() => useGoalPlan(plan)}>
                    <Text style={styles.primaryButtonText}>Use This Plan</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.smallText}>
                No matching goal plans right now for this profile setup.
              </Text>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Your Workout Days</Text>

            {sortedTemplates.length > 0 ? (
              sortedTemplates.map((template) => (
                <View key={template.id} style={styles.listCard}>
                  <Text style={styles.listTitle}>
                    {template.weekday} - {template.workoutName}
                  </Text>
                  <Text style={styles.smallText}>Duration: {template.duration} mins</Text>
                  <Text style={styles.smallText}>Exercises: {template.exercises.length}</Text>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={() => {
                        setSelectedTemplateId(template.id);
                        startEditingTemplate(template);
                      }}
                    >
                      <Text style={styles.secondaryButtonText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={() => duplicateTemplate(template)}
                    >
                      <Text style={styles.secondaryButtonText}>Duplicate</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.dangerButton}
                      onPress={() => deleteTemplate(template.id)}
                    >
                      <Text style={styles.dangerButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.smallText}>No workout days added yet.</Text>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Choose Workout Day</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.optionRow}
            >
              {sortedTemplates.map((template) => (
                <Chip
                  key={template.id}
                  label={`${template.weekday.slice(0, 3)} ${template.workoutName}`}
                  selected={selectedTemplateId === template.id}
                  onPress={() => setSelectedTemplateId(template.id)}
                />
              ))}
            </ScrollView>

            {selectedTemplate ? (
              <>
                <Text style={styles.info}>
                  Selected: {selectedTemplate.weekday} - {selectedTemplate.workoutName}
                </Text>

                <TextInput
                  style={styles.input}
                  value={exerciseName}
                  onChangeText={(text) => {
                    setExerciseName(text);

                    const flags = getExerciseFlags(text);
                    setExercisePregnancySafe(flags.pregnancySafe);
                    setExerciseLowImpact(flags.lowImpact);
                  }}
                  placeholder="Exercise name"
                  placeholderTextColor="#777"
                />

                <View style={styles.rowInputs}>
                  <TextInput
                    style={[styles.input, styles.smallInput]}
                    value={sets}
                    onChangeText={setSets}
                    placeholder="Sets"
                    placeholderTextColor="#777"
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.smallInput]}
                    value={reps}
                    onChangeText={setReps}
                    placeholder="Reps"
                    placeholderTextColor="#777"
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.smallInput]}
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="Weight"
                    placeholderTextColor="#777"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.secondaryButton,
                      exercisePregnancySafe && styles.secondaryButtonActive,
                    ]}
                    onPress={() => setExercisePregnancySafe((prev) => !prev)}
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
                    onPress={() => setExerciseLowImpact((prev) => !prev)}
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

                  <TouchableOpacity style={styles.secondaryButton} onPress={resetExerciseForm}>
                    <Text style={styles.secondaryButtonText}>Clear</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.exerciseList}>
                  {selectedTemplate.exercises.map((exercise, index) => {
                    const libraryItem = getLibraryItem(exercise.name);
                    const howToOpen = openHowToExerciseId === exercise.id;

                    return (
                      <View key={exercise.id} style={styles.exerciseCard}>
                        <Text style={styles.listTitle}>
                          {index + 1}. {exercise.name}
                        </Text>
                        <Text style={styles.smallText}>
                          {exercise.sets} sets x {exercise.reps} reps @ {exercise.weight} kg
                        </Text>
                        <Text style={styles.smallText}>
                          Pregnancy Safe: {exercise.pregnancySafe ? "Yes" : "No"} | Low Impact:{" "}
                          {exercise.lowImpact ? "Yes" : "No"}
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
                            onPress={() => moveExercise(selectedTemplate.id, exercise.id, "up")}
                          >
                            <Text style={styles.secondaryButtonText}>Up</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => moveExercise(selectedTemplate.id, exercise.id, "down")}
                          >
                            <Text style={styles.secondaryButtonText}>Down</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.dangerButton}
                            onPress={() => deleteExercise(selectedTemplate.id, exercise.id)}
                          >
                            <Text style={styles.dangerButtonText}>Delete</Text>
                          </TouchableOpacity>
                        </View>

                        {libraryItem ? (
                          <>
                            <TouchableOpacity
                              style={styles.secondaryButton}
                              onPress={() =>
                                setOpenHowToExerciseId((prev) =>
                                  prev === exercise.id ? null : exercise.id
                                )
                              }
                            >
                              <Text style={styles.secondaryButtonText}>
                                {howToOpen ? "Hide How To" : "Show How To"}
                              </Text>
                            </TouchableOpacity>

                            {howToOpen ? (
                              <View style={styles.howToBox}>
                                <Text style={styles.subTitle}>How To</Text>
                                {libraryItem.howTo.map((step) => (
                                  <Text key={step} style={styles.smallText}>
                                    • {step}
                                  </Text>
                                ))}

                                <Text style={styles.subTitle}>Muscles</Text>
                                <Text style={styles.smallText}>
                                  {libraryItem.muscles.join(", ")}
                                </Text>

                                <Text style={styles.subTitle}>Common Mistakes</Text>
                                {libraryItem.mistakes.map((mistake) => (
                                  <Text key={mistake} style={styles.smallText}>
                                    • {mistake}
                                  </Text>
                                ))}
                              </View>
                            ) : null}
                          </>
                        ) : null}
                      </View>
                    );
                  })}

                  {selectedTemplate.exercises.length === 0 ? (
                    <Text style={styles.smallText}>No exercises added yet.</Text>
                  ) : null}
                </View>
              </>
            ) : (
              <Text style={styles.smallText}>Pick a workout day first.</Text>
            )}
          </View>
        </>
      )}

      {activeTab === "learn" && (
        <>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Beginner Tips</Text>

            {BEGINNER_TUTORIALS.map((tutorial) => (
              <View key={tutorial.id} style={styles.listCard}>
                <Text style={styles.listTitle}>{tutorial.title}</Text>
                <Text style={styles.smallText}>{tutorial.content}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Exercise Library</Text>

            {exerciseLibrary.map((item) => (
              <View key={item.key} style={styles.listCard}>
                <Text style={styles.listTitle}>{item.name}</Text>
                <Text style={styles.smallText}>Muscles: {item.muscles.join(", ")}</Text>
                <Text style={styles.smallText}>
                  Pregnancy Safe: {item.pregnancySafe ? "Yes" : "No"} | Low Impact:{" "}
                  {item.lowImpact ? "Yes" : "No"}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 16,
  },
  topTabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  topTab: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  topTabActive: {
    backgroundColor: "#2563eb",
  },
  topTabText: {
    color: "#cbd5e1",
    fontWeight: "600",
  },
  topTabTextActive: {
    color: "#ffffff",
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 10,
    marginBottom: 6,
  },
  info: {
    fontSize: 15,
    color: "#e5e7eb",
    marginBottom: 6,
  },
  smallText: {
    fontSize: 14,
    color: "#cbd5e1",
    lineHeight: 20,
    marginBottom: 6,
  },
  notice: {
    marginTop: 10,
    backgroundColor: "#1d4ed8",
    color: "#ffffff",
    padding: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  monthLabel: {
    color: "#93c5fd",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  calendarHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  calendarHeaderText: {
    width: "13.5%",
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "700",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  calendarCell: {
    width: "13.5%",
    minHeight: 72,
    borderRadius: 10,
    padding: 4,
    marginBottom: 8,
    justifyContent: "space-between",
  },
  cellEmpty: {
    backgroundColor: "transparent",
  },
  cellNone: {
    backgroundColor: "#1f2937",
  },
  cellPending: {
    backgroundColor: "#334155",
  },
  cellDone: {
    backgroundColor: "#166534",
  },
  cellMissed: {
    backgroundColor: "#991b1b",
  },
  calendarDay: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
  },
  calendarWorkoutText: {
    color: "#e2e8f0",
    fontSize: 10,
  },
  optionRow: {
    paddingBottom: 8,
  },
  chip: {
    backgroundColor: "#1f2937",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: "#2563eb",
  },
  chipText: {
    color: "#cbd5e1",
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  input: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#ffffff",
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 8,
  },
  smallInput: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#1f2937",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  secondaryButtonActive: {
    backgroundColor: "#0f766e",
  },
  secondaryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  dangerButton: {
    backgroundColor: "#7f1d1d",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  dangerButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  listCard: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  listTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  exerciseList: {
    marginTop: 10,
  },
  exerciseCard: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  howToBox: {
    marginTop: 10,
    backgroundColor: "#111827",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  progressRow: {
    marginBottom: 12,
  },
  progressDate: {
    color: "#cbd5e1",
    fontSize: 13,
    marginBottom: 4,
  },
  progressBarBackground: {
    height: 16,
    backgroundColor: "#1f2937",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 999,
  },
  progressValue: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 13,
  },
});