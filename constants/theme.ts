import COLORS from "@/constants/colors";

export type AppThemeMode = "light" | "dark";
export type AppAccentColor = "blue" | "green" | "orange" | "purple";

type BaseThemeColors = ReturnType<typeof getBaseColors>;

const ACCENT_COLORS: Record<
  AppAccentColor,
  {
    primary: string;
    primaryLight: string;
  }
> = {
  blue: {
    primary: "#2563EB",
    primaryLight: "#DBEAFE",
  },
  green: {
    primary: "#16A34A",
    primaryLight: "#DCFCE7",
  },
  orange: {
    primary: "#EA580C",
    primaryLight: "#FFEDD5",
  },
  purple: {
    primary: "#9333EA",
    primaryLight: "#F3E8FF",
  },
};

const getBaseColors = (mode: AppThemeMode) => {
  return mode === "light" ? COLORS.light : COLORS.dark;
};

export const getAppColors = (
  mode: AppThemeMode,
  accentColor: AppAccentColor = "blue"
) => {
  const baseColors = getBaseColors(mode);
  const accent = ACCENT_COLORS[accentColor];

  return {
    ...baseColors,
    primary: accent.primary,
    primaryLight: accent.primaryLight,
  };
};

export const ACCENT_COLOR_OPTIONS: AppAccentColor[] = [
  "blue",
  "green",
  "orange",
  "purple",
];