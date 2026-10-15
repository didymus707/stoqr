import {
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useEffect } from "react";
import { useAuth } from "@/stores/auth";
import { useRouter } from "expo-router";
import { Colors, Spacing } from "../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { Logo } from "@/components/ui/Logo";
import { WelcomeQR } from "@/components/brand/WelcomeQR";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";

const c = Colors.light;

export default function WelcomeScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) {
      router.replace("/(tabs)");
    }
  }, [session, loading, router]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={c.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Logo size={40} />

      <View style={styles.hero}>
        <WelcomeQR />
      </View>

      <View style={styles.copy}>
        <Text variant="display" accessibilityRole="header">
          Never run out{"\n"}of milk again
        </Text>
        <Text variant="body" color={c.inkMuted}>
          stoQr knows what's in your cupboards, warns you before you run low,
          and shows which shop near you is cheapest, priced by people in your
          area.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button label="Get Started" onPress={() => router.push("/sign-up")} />
        <Button
          label="I already have an account"
          variant="ghost"
          onPress={() => router.push("/sign-up")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.surface,
  },
  screen: {
    flex: 1,
    backgroundColor: c.surface,
    paddingHorizontal: Spacing.s24,
    paddingVertical: Spacing.s16,
    gap: Spacing.s28,
  },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { gap: Spacing.s12 },
  actions: { gap: Spacing.s8 },
});
