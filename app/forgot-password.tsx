import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { canGoBack } from "expo-router/build/global-state/routing";
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const canUserGoBack = canGoBack();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleReset() {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: "s://reset-password",
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.sentContainer}>
          <Text style={styles.sentEmoji}>📧</Text>
          <Text style={styles.sentTitle}>Check your email</Text>
          <Text style={styles.sentSubtitle}>
            We've sent a password reset link to{"\n"}
            <Text style={styles.sentEmail}>{email}</Text>
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace("/sign-in")}
          >
            <Text style={styles.buttonText}>Back to sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => (canUserGoBack ? router.back() : router.replace("/sign-in"))}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.subtitle}>
          Enter your email and we'll send you a reset link
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={Colors.text.muted}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError("");
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            autoFocus
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Send reset link</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  backButton: {
    marginBottom: Spacing.lg,
  },
  backText: {
    fontSize: FontSize.md,
    color: Colors.primary,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
  },
  form: {
    gap: Spacing.md,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "500",
    color: Colors.text.primary,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.status.danger,
  },
  sentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  sentEmoji: {
    fontSize: 48,
  },
  sentTitle: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  sentSubtitle: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
  sentEmail: {
    color: Colors.primary,
    fontWeight: "600",
  },
});
