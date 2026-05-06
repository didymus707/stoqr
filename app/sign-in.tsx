import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import { useAuth } from "@/stores/auth";
import { canGoBack } from "expo-router/build/global-state/routing";
import { Colors, FontSize, Spacing, BorderRadius } from "../constants/theme";

export default function SignInScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const canUserGoBack = canGoBack();

  async function handleSignIn() {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter your email and password");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      setLoading(false);

      if (error) {
        Alert.alert("Sign in failed", error.message);
        return;
      }
    } catch (e) {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session) {
      router.replace("/(tabs)");
    }
  }, [session]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() =>
          canUserGoBack ? router.back() : router.replace("/")
        }
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={Colors.text.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.shwPwd}>
            <TextInput
              style={styles.input}
              placeholder="Your password"
              placeholderTextColor={Colors.text.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable
              onPress={() => setShowPassword((prev) => !prev)}
              style={styles.emojiContainer}
            >
              <Text style={styles.emoji}>{showPassword ? "🙈" : "👁️"}</Text>
            </Pressable>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/forgot-password")}
          style={styles.forgotButton}
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Sign in</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.replace("/sign-up")}
        >
          <Text style={styles.linkText}>
            Don't have an account?{" "}
            <Text style={styles.linkTextBold}>Sign up</Text>
          </Text>
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
  linkButton: {
    alignItems: "center",
    padding: Spacing.sm,
  },
  linkText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  linkTextBold: {
    color: Colors.primary,
    fontWeight: "600",
  },
  emoji: {
    fontSize: 20,
  },
  shwPwd: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
  },
  emojiContainer: {
    position: "absolute",
    right: 12,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.status.danger,
    marginTop: 2,
  },
  forgotButton: {
    alignSelf: "flex-end",
  },
  forgotText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
});
