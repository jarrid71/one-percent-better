import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import { useAppTheme } from "@/context/ThemeContext";

type FloatingAddButtonProps = {
  onPress: () => void;
};

export default function FloatingAddButton({
  onPress,
}: FloatingAddButtonProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={styles.text}>+</Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    button: {
      position: "absolute",
      right: 20,
      bottom: 100,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary, // ✅ now theme controlled
      alignItems: "center",
      justifyContent: "center",

      shadowColor: "#000",
      shadowOpacity: 0.3,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
    },

    text: {
      color: "#FFFFFF",
      fontSize: 32,
      fontWeight: "700",
      marginTop: -2,
    },
  });