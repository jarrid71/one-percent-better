import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SuggestionsSection from "@/components/profile/SuggestionsSection";
import { ACCENT_COLOR_OPTIONS, AppAccentColor } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { useUserProfile } from "../../context/UserProfileContext";

type ChoiceButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: {
    background: string;
    card: string;
    surface: string;
    surfaceSoft: string;
    border: string;
    text: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    primary: string;
    primaryLight: string;
    success: string;
    danger: string;
  };
};

type ProfileViewMode = "profile" | "settings" | "suggestions";

function ChoiceButton({
  label,
  selected,
  onPress,
  colors,
}: ChoiceButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.choiceButton,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        selected && {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.choiceButtonText,
          { color: colors.text },
          selected && styles.choiceButtonTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function getAccentPreviewColor(colorOption: AppAccentColor) {
  if (colorOption === "blue") return "#2563EB";
  if (colorOption === "green") return "#16A34A";
  if (colorOption === "orange") return "#EA580C";
  return "#9333EA";
}

export default function ProfileScreen() {
  const { profile, updateProfile, resetProfile } = useUserProfile();
  const { themeMode, setThemeMode, accentColor, setAccentColor, colors } =
    useAppTheme();
  const [viewMode, setViewMode] = useState<ProfileViewMode>("profile");

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={styles.screen}>
        <View
          style={[
            styles.topTabsWrap,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.topTab,
              viewMode === "profile" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setViewMode("profile")}
          >
            <Text
              style={[
                styles.topTabText,
                { color: colors.textSecondary },
                viewMode === "profile" && styles.topTabTextActive,
              ]}
            >
              Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.topTab,
              viewMode === "settings" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setViewMode("settings")}
          >
            <Text
              style={[
                styles.topTabText,
                { color: colors.textSecondary },
                viewMode === "settings" && styles.topTabTextActive,
              ]}
            >
              Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.topTab,
              viewMode === "suggestions" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setViewMode("suggestions")}
          >
            <Text
              style={[
                styles.topTabText,
                { color: colors.textSecondary },
                viewMode === "suggestions" && styles.topTabTextActive,
              ]}
            >
              Suggestions
            </Text>
          </TouchableOpacity>
        </View>

        {viewMode === "suggestions" ? (
          <View style={styles.suggestionsWrap}>
            <SuggestionsSection />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            {viewMode === "profile" && (
              <>
                <View
                  style={[
                    styles.heroCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.heroTitle, { color: colors.text }]}>
                    Profile
                  </Text>
                  <Text
                    style={[
                      styles.heroSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Set your details once and use them across the whole app.
                  </Text>
                </View>

                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Basic Details
                  </Text>

                  <Text
                    style={[styles.label, { color: colors.textSecondary }]}
                  >
                    Name
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    placeholder="Your name"
                    placeholderTextColor={colors.textMuted}
                    value={profile.name}
                    onChangeText={(text) => updateProfile({ name: text })}
                  />

                  <Text
                    style={[styles.label, { color: colors.textSecondary }]}
                  >
                    Sex
                  </Text>
                  <View style={styles.rowWrap}>
                    <ChoiceButton
                      label="Male"
                      selected={profile.sex === "Male"}
                      onPress={() => updateProfile({ sex: "Male" })}
                      colors={colors}
                    />
                    <ChoiceButton
                      label="Female"
                      selected={profile.sex === "Female"}
                      onPress={() => updateProfile({ sex: "Female" })}
                      colors={colors}
                    />
                    <ChoiceButton
                      label="Other"
                      selected={profile.sex === "Other"}
                      onPress={() => updateProfile({ sex: "Other" })}
                      colors={colors}
                    />
                  </View>

                  <Text
                    style={[styles.label, { color: colors.textSecondary }]}
                  >
                    Age
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    placeholder="Age"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={profile.age}
                    onChangeText={(text) => updateProfile({ age: text })}
                  />

                  <Text
                    style={[styles.label, { color: colors.textSecondary }]}
                  >
                    Weight (kg)
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    placeholder="Weight in kg"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={profile.weightKg}
                    onChangeText={(text) => updateProfile({ weightKg: text })}
                  />
                </View>

                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Fitness Goals
                  </Text>

                  <Text
                    style={[styles.label, { color: colors.textSecondary }]}
                  >
                    Goal
                  </Text>
                  <View style={styles.rowWrap}>
                    <ChoiceButton
                      label="Lose Fat"
                      selected={profile.goal === "Lose Fat"}
                      onPress={() => updateProfile({ goal: "Lose Fat" })}
                      colors={colors}
                    />
                    <ChoiceButton
                      label="Build Muscle"
                      selected={profile.goal === "Build Muscle"}
                      onPress={() => updateProfile({ goal: "Build Muscle" })}
                      colors={colors}
                    />
                    <ChoiceButton
                      label="Maintain"
                      selected={profile.goal === "Maintain"}
                      onPress={() => updateProfile({ goal: "Maintain" })}
                      colors={colors}
                    />
                    <ChoiceButton
                      label="Get Fitter"
                      selected={profile.goal === "Get Fitter"}
                      onPress={() => updateProfile({ goal: "Get Fitter" })}
                      colors={colors}
                    />
                  </View>

                  <Text
                    style={[styles.label, { color: colors.textSecondary }]}
                  >
                    Experience
                  </Text>
                  <View style={styles.rowWrap}>
                    <ChoiceButton
                      label="Beginner"
                      selected={profile.experience === "Beginner"}
                      onPress={() => updateProfile({ experience: "Beginner" })}
                      colors={colors}
                    />
                    <ChoiceButton
                      label="Intermediate"
                      selected={profile.experience === "Intermediate"}
                      onPress={() =>
                        updateProfile({ experience: "Intermediate" })
                      }
                      colors={colors}
                    />
                    <ChoiceButton
                      label="Advanced"
                      selected={profile.experience === "Advanced"}
                      onPress={() => updateProfile({ experience: "Advanced" })}
                      colors={colors}
                    />
                  </View>

                  <Text
                    style={[styles.label, { color: colors.textSecondary }]}
                  >
                    Training days per week
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    placeholder="3"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={profile.trainingDays}
                    onChangeText={(text) =>
                      updateProfile({ trainingDays: text })
                    }
                  />

                  <Text
                    style={[styles.label, { color: colors.textSecondary }]}
                  >
                    Session length (minutes)
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    placeholder="45"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={profile.sessionMinutes}
                    onChangeText={(text) =>
                      updateProfile({ sessionMinutes: text })
                    }
                  />

                  <View
                    style={[
                      styles.switchRow,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.switchTextWrap}>
                      <Text style={[styles.switchTitle, { color: colors.text }]}>
                        Pregnancy-safe mode
                      </Text>
                      <Text
                        style={[
                          styles.switchSubtitle,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Use safer workout filtering where needed.
                      </Text>
                    </View>
                    <Switch
                      value={profile.pregnancySafe}
                      onValueChange={(value) =>
                        updateProfile({ pregnancySafe: value })
                      }
                    />
                  </View>
                </View>

                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Current Profile Summary
                  </Text>

                  <Text style={[styles.summaryText, { color: colors.text }]}>
                    Name: {profile.name || "Not set"}
                  </Text>
                  <Text style={[styles.summaryText, { color: colors.text }]}>
                    Sex: {profile.sex}
                  </Text>
                  <Text style={[styles.summaryText, { color: colors.text }]}>
                    Age: {profile.age || "Not set"}
                  </Text>
                  <Text style={[styles.summaryText, { color: colors.text }]}>
                    Weight:{" "}
                    {profile.weightKg ? `${profile.weightKg} kg` : "Not set"}
                  </Text>
                  <Text style={[styles.summaryText, { color: colors.text }]}>
                    Goal: {profile.goal}
                  </Text>
                  <Text style={[styles.summaryText, { color: colors.text }]}>
                    Experience: {profile.experience}
                  </Text>
                  <Text style={[styles.summaryText, { color: colors.text }]}>
                    Training days: {profile.trainingDays || "Not set"}
                  </Text>
                  <Text style={[styles.summaryText, { color: colors.text }]}>
                    Session length: {profile.sessionMinutes || "Not set"} mins
                  </Text>
                  <Text style={[styles.summaryText, { color: colors.text }]}>
                    Pregnancy-safe mode: {profile.pregnancySafe ? "On" : "Off"}
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.resetButton,
                      { backgroundColor: colors.danger },
                    ]}
                    onPress={resetProfile}
                  >
                    <Text style={styles.resetButtonText}>Reset Profile</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {viewMode === "settings" && (
              <>
                <View
                  style={[
                    styles.heroCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.heroTitle, { color: colors.text }]}>
                    Settings
                  </Text>
                  <Text
                    style={[
                      styles.heroSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Control how the app looks and feels.
                  </Text>
                </View>

                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Appearance
                  </Text>

                  <View
                    style={[
                      styles.switchRow,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.switchTextWrap}>
                      <Text style={[styles.switchTitle, { color: colors.text }]}>
                        Light Mode
                      </Text>
                      <Text
                        style={[
                          styles.switchSubtitle,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Toggle between light and dark theme
                      </Text>
                    </View>

                    <Switch
                      value={themeMode === "light"}
                      onValueChange={(value) =>
                        setThemeMode(value ? "light" : "dark")
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.label,
                      { color: colors.textSecondary, marginTop: 16 },
                    ]}
                  >
                    Accent Color
                  </Text>

                  <View style={styles.rowWrap}>
                    {ACCENT_COLOR_OPTIONS.map((colorOption) => {
                      const isSelected = accentColor === colorOption;

                      return (
                        <TouchableOpacity
                          key={colorOption}
                          onPress={() => setAccentColor(colorOption)}
                          style={[
                            styles.accentCircle,
                            {
                              borderColor: isSelected
                                ? colors.primary
                                : colors.border,
                              borderWidth: isSelected ? 3 : 1,
                              backgroundColor: colors.surface,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.accentInner,
                              {
                                backgroundColor:
                                  getAccentPreviewColor(colorOption),
                              },
                            ]}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  topTabsWrap: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 18,
    padding: 6,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  topTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  topTabText: {
    fontSize: 14,
    fontWeight: "700",
  },
  topTabTextActive: {
    color: "#FFFFFF",
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 10,
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  choiceButton: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  choiceButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  choiceButtonTextSelected: {
    color: "#FFFFFF",
  },
  switchRow: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  switchTextWrap: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  switchSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 4,
  },
  resetButton: {
    marginTop: 14,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  accentCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  accentInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  suggestionsWrap: {
    flex: 1,
  },
});