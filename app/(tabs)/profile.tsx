import React from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useUserProfile } from "../../context/UserProfileContext";
type ChoiceButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function ChoiceButton({ label, selected, onPress }: ChoiceButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.choiceButton, selected && styles.choiceButtonSelected]}
      onPress={onPress}
    >
      <Text
        style={[styles.choiceButtonText, selected && styles.choiceButtonTextSelected]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { profile, updateProfile, resetProfile } = useUserProfile();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Profile</Text>
        <Text style={styles.heroSubtitle}>
          Set your details once and use them across the whole app.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Basic Details</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor="#94A3B8"
          value={profile.name}
          onChangeText={(text) => updateProfile({ name: text })}
        />

        <Text style={styles.label}>Sex</Text>
        <View style={styles.rowWrap}>
          <ChoiceButton
            label="Male"
            selected={profile.sex === "Male"}
            onPress={() => updateProfile({ sex: "Male" })}
          />
          <ChoiceButton
            label="Female"
            selected={profile.sex === "Female"}
            onPress={() => updateProfile({ sex: "Female" })}
          />
          <ChoiceButton
            label="Other"
            selected={profile.sex === "Other"}
            onPress={() => updateProfile({ sex: "Other" })}
          />
        </View>

        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          placeholder="Age"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={profile.age}
          onChangeText={(text) => updateProfile({ age: text })}
        />

        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Weight in kg"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={profile.weightKg}
          onChangeText={(text) => updateProfile({ weightKg: text })}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Fitness Goals</Text>

        <Text style={styles.label}>Goal</Text>
        <View style={styles.rowWrap}>
          <ChoiceButton
            label="Lose Fat"
            selected={profile.goal === "Lose Fat"}
            onPress={() => updateProfile({ goal: "Lose Fat" })}
          />
          <ChoiceButton
            label="Build Muscle"
            selected={profile.goal === "Build Muscle"}
            onPress={() => updateProfile({ goal: "Build Muscle" })}
          />
          <ChoiceButton
            label="Maintain"
            selected={profile.goal === "Maintain"}
            onPress={() => updateProfile({ goal: "Maintain" })}
          />
          <ChoiceButton
            label="Get Fitter"
            selected={profile.goal === "Get Fitter"}
            onPress={() => updateProfile({ goal: "Get Fitter" })}
          />
        </View>

        <Text style={styles.label}>Experience</Text>
        <View style={styles.rowWrap}>
          <ChoiceButton
            label="Beginner"
            selected={profile.experience === "Beginner"}
            onPress={() => updateProfile({ experience: "Beginner" })}
          />
          <ChoiceButton
            label="Intermediate"
            selected={profile.experience === "Intermediate"}
            onPress={() => updateProfile({ experience: "Intermediate" })}
          />
          <ChoiceButton
            label="Advanced"
            selected={profile.experience === "Advanced"}
            onPress={() => updateProfile({ experience: "Advanced" })}
          />
        </View>

        <Text style={styles.label}>Training days per week</Text>
        <TextInput
          style={styles.input}
          placeholder="3"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={profile.trainingDays}
          onChangeText={(text) => updateProfile({ trainingDays: text })}
        />

        <Text style={styles.label}>Session length (minutes)</Text>
        <TextInput
          style={styles.input}
          placeholder="45"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={profile.sessionMinutes}
          onChangeText={(text) => updateProfile({ sessionMinutes: text })}
        />

        <View style={styles.switchRow}>
          <View style={styles.switchTextWrap}>
            <Text style={styles.switchTitle}>Pregnancy-safe mode</Text>
            <Text style={styles.switchSubtitle}>
              Use safer workout filtering where needed.
            </Text>
          </View>
          <Switch
            value={profile.pregnancySafe}
            onValueChange={(value) => updateProfile({ pregnancySafe: value })}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Current Profile Summary</Text>

        <Text style={styles.summaryText}>Name: {profile.name || "Not set"}</Text>
        <Text style={styles.summaryText}>Sex: {profile.sex}</Text>
        <Text style={styles.summaryText}>Age: {profile.age || "Not set"}</Text>
        <Text style={styles.summaryText}>
          Weight: {profile.weightKg ? `${profile.weightKg} kg` : "Not set"}
        </Text>
        <Text style={styles.summaryText}>Goal: {profile.goal}</Text>
        <Text style={styles.summaryText}>Experience: {profile.experience}</Text>
        <Text style={styles.summaryText}>
          Training days: {profile.trainingDays || "Not set"}
        </Text>
        <Text style={styles.summaryText}>
          Session length: {profile.sessionMinutes || "Not set"} mins
        </Text>
        <Text style={styles.summaryText}>
          Pregnancy-safe mode: {profile.pregnancySafe ? "On" : "Off"}
        </Text>

        <TouchableOpacity style={styles.resetButton} onPress={resetProfile}>
          <Text style={styles.resetButtonText}>Reset Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  heroCard: {
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 24,
    padding: 18,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 6,
  },
  heroSubtitle: {
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 24,
    padding: 16,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 14,
  },
  label: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 6,
  },
  input: {
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#334155",
    color: "#FFFFFF",
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
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  choiceButtonSelected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  choiceButtonText: {
    color: "#E2E8F0",
    fontSize: 13,
    fontWeight: "600",
  },
  choiceButtonTextSelected: {
    color: "#FFFFFF",
  },
  switchRow: {
    marginTop: 10,
    backgroundColor: "#172033",
    borderWidth: 1,
    borderColor: "#334155",
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
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  switchSubtitle: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 18,
  },
  summaryText: {
    color: "#E2E8F0",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 4,
  },
  resetButton: {
    marginTop: 14,
    backgroundColor: "#7F1D1D",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});