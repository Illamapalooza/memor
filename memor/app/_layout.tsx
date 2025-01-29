import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@/components/core/ThemeProvider";
import { AuthProvider } from "@/services/auth/AuthProvider";
import { NotesProvider } from "@/features/notes/context/NotesContext";
import { StripeProvider } from "@stripe/stripe-react-native";
import { PaywallProvider } from "@/contexts/PaywallContext";

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
        <StripeProvider
          publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
        >
          <AuthProvider>
            <PaywallProvider>
              <NotesProvider>
                <StatusBar style="auto" />
                <Slot />
              </NotesProvider>
            </PaywallProvider>
          </AuthProvider>
        </StripeProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
