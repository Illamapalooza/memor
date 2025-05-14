import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/services/auth/AuthProvider";
import { NotesProvider } from "@/features/notes/context/NotesContext";
import { StripeProvider } from "@stripe/stripe-react-native";
import { PaywallProvider } from "@/contexts/PaywallContext";
import { PaperProvider } from "react-native-paper";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import React from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Nunito: require("../assets/fonts/Nunito-Regular.ttf"),
    "Nunito-Medium": require("../assets/fonts/Nunito-Medium.ttf"),
    "Nunito-Light": require("../assets/fonts/Nunito-Light.ttf"),
    "Nunito-Bold": require("../assets/fonts/Nunito-Bold.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PaperProvider>
          <AuthProvider>
            <OnboardingProvider>
              <PaywallProvider>
                <NotesProvider>
                  <StatusBar style="auto" />
                  <Slot />
                </NotesProvider>
              </PaywallProvider>
            </OnboardingProvider>
          </AuthProvider>
        </PaperProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
