import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { SPACING } from "@/constants/spacing";
import { useAppTheme } from "@/context/ThemeContext";

type DashboardCardProps = {
  title: string;
  value: string;
  subtitle?: string;
};

export default function DashboardCard({
  title,
  value,
  subtitle,
}: DashboardCardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      flex: 1,
      minWidth: 150,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },

    title: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textSecondary,
      marginBottom: SPACING.sm,
    },

    value: {
      fontSize: 26,
      fontWeight: "800",
      color: colors.text,
      marginBottom: SPACING.xs,
    },

    subtitle: {
      fontSize: 13,
      color: colors.textSecondary,
    },
  });