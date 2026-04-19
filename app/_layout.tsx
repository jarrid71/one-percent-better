import { FeatureSuggestionsProvider } from "@/context/FeatureSuggestionsContext";
import { MealsProvider } from "@/context/MealsContext";
import { ShoppingSuggestionsProvider } from "@/context/ShoppingSuggestionsContext";
import {
  ThemeProvider as AppThemeProvider,
  useAppTheme,
} from "@/context/ThemeContext";
import { UserProfileProvider } from "@/context/UserProfileContext";
import { WorkoutsProvider } from "@/context/WorkoutsContext";
import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import "react-native-reanimated";

function AppNavigator() {
  const { navigationTheme, statusBarStyle, colors, isThemeLoaded } =
    useAppTheme();

  if (!isThemeLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            color: colors.text,
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            headerShown: true,
            title: "Modal",
          }}
        />
      </Stack>

      <StatusBar style={statusBarStyle} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <UserProfileProvider>
        <MealsProvider>
          <ShoppingSuggestionsProvider>
            <WorkoutsProvider>
              <FeatureSuggestionsProvider>
                <AppNavigator />
              </FeatureSuggestionsProvider>
            </WorkoutsProvider>
          </ShoppingSuggestionsProvider>
        </MealsProvider>
      </UserProfileProvider>
    </AppThemeProvider>
  );
}