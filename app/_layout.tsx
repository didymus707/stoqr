import { Stack } from "expo-router";
import { AuthProvider } from "@/stores/auth";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ShoppingSessionProvider } from "@/stores/shopping-session";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";

export default function RootLayout() {
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
