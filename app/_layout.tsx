import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { AuthProvider } from "@/stores/auth";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ShoppingSessionProvider } from "@/stores/shopping-session";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "BricolageGrotesque-ExtraBold": require("../assets/fonts/BricolageGrotesque-ExtraBold.ttf"),
    "BricolageGrotesque-SemiBold": require("../assets/fonts/BricolageGrotesque-SemiBold.ttf"),
    "IBMPlexSans-Regular": require("../assets/fonts/IBMPlexSans-Regular.ttf"),
    "IBMPlexSans-Medium": require("../assets/fonts/IBMPlexSans-Medium.ttf"),
    "IBMPlexSans-SemiBold": require("../assets/fonts/IBMPlexSans-SemiBold.ttf"),
    "IBMPlexMono-Medium": require("../assets/fonts/IBMPlexMono-Medium.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  return (
    <SafeAreaProvider>
      <ActionSheetProvider>
        <AuthProvider>
          <ShoppingSessionProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </ShoppingSessionProvider>
        </AuthProvider>
      </ActionSheetProvider>
    </SafeAreaProvider>
  );
}
