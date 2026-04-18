import { useEffect } from "react";
import { useAuth } from "@/stores/auth";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors, FontSize, Spacing, BorderRadius } from "../constants/theme";

export default function WelcomeScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) {
      router.replace("/dashboard");
    }
  }, [session, loading, router]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>📦</Text>
        </View>
        <Text style={styles.title}>StockSense</Text>
        <Text style={styles.tagline}>Your intelligent inventory assistant</Text>
      </View>

      <View style={styles.features}>
        <FeatureRow emoji="🔔" text="Get alerted before you run out" />
        <FeatureRow emoji="💰" text="Compare prices at local stores" />
        <FeatureRow emoji="📸" text="Scan receipts to update stock" />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/sign-up")}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/sign-in")}
        >
          <Text style={styles.secondaryButtonText}>
            I already have an account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function FeatureRow({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    justifyContent: "space-between",
    paddingVertical: Spacing.xxl,
  },
  hero: {
    alignItems: "center",
    marginTop: Spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  features: {
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureText: {
    fontSize: FontSize.md,
    color: Colors.text.primary,
    flex: 1,
  },
  actions: {
    gap: Spacing.sm,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  secondaryButton: {
    padding: Spacing.md,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
  },
});
