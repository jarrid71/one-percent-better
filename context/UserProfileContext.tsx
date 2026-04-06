import React, { createContext, useContext, useMemo, useState } from "react";

export type UserProfile = {
  name: string;
  sex: "Male" | "Female" | "Other";
  age: string;
  weightKg: string;
  goal: "Lose Fat" | "Build Muscle" | "Maintain" | "Get Fitter";
  experience: "Beginner" | "Intermediate" | "Advanced";
  trainingDays: string;
  sessionMinutes: string;
  pregnancySafe: boolean;
};

type UserProfileContextType = {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  resetProfile: () => void;
};

const defaultProfile: UserProfile = {
  name: "",
  sex: "Male",
  age: "",
  weightKg: "",
  goal: "Build Muscle",
  experience: "Beginner",
  trainingDays: "3",
  sessionMinutes: "45",
  pregnancySafe: false,
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined
);

export function UserProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const resetProfile = () => {
    setProfile(defaultProfile);
  };

  const value = useMemo(
    () => ({
      profile,
      updateProfile,
      resetProfile,
    }),
    [profile]
  );

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);

  if (!context) {
    throw new Error("useUserProfile must be used inside UserProfileProvider");
  }

  return context;
}