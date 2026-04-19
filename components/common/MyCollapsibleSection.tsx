import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "@/context/ThemeContext";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function MyCollapsibleSection({ title, children }: Props) {
  const [open, setOpen] = useState(true);

  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
      >
        <Text style={styles.title}>{title}</Text>

        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.text} // ✅ now themed
        />
      </TouchableOpacity>

      {open && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card, // ✅ themed
      borderRadius: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
    },

    title: {
      color: colors.text, // ✅ themed
      fontSize: 16,
      fontWeight: "700",
    },

    content: {
      padding: 16,
    },
  });