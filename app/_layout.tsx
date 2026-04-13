import { ShoppingSuggestionsProvider } from "@/context/ShoppingSuggestionsContext";
import { UserProfileProvider } from "@/context/UserProfileContext";
import { WorkoutsProvider } from "@/context/WorkoutsContext";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import "react-native-reanimated";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <UserProfileProvider>
      <ShoppingSuggestionsProvider>
        <WorkoutsProvider>
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen
                name="(tabs)"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="modal"
                options={{
                  presentation: "modal",
                  headerShown: true,
                  title: "Modal",
                }}
              />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </WorkoutsProvider>
      </ShoppingSuggestionsProvider>
    </UserProfileProvider>
  );
}