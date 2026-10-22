import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { PasswordField } from "@/components/ui/PasswordField";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/stores/auth";

const c = Colors.light;

const friendlyError = (message: string) => {
  const m = message.toLowerCase();
  if (m.includes("invalid login"))
    return "That email and password don't match. Check them and try again.";
  if (m.includes("not confirmed"))
    return "Confirm your email first. We sent you a link when you signed up.";
  return "Couldn't sign you in. Check your connection and try again.";
};

export default function SignInScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) router.replace("/(tabs)");
  }, [session]);

  const canSubmit = email.trim() !== "" && password !== "" && !loading;

  const handleSignIn = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signInError) setError(friendlyError(signInError.message));
  };

  return (
    <Screen
      title="Welcome back"
      subtitle="Sign in to see what's in your cupboard."
      footer={
        <>
          <Button
            label={loading ? "Signing in…" : "Sign in"}
            disabled={!canSubmit}
            onPress={handleSignIn}
          />
          <Button
            label="New to stoQr? Create an account"
            variant="ghost"
            onPress={() => router.replace("/sign-up")}
          />
        </>
      }
    >
      <View style={styles.fields}>
        <Field
          label="Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            setError(null);
          }}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
        />
        <PasswordField
          label="Password"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            setError(null);
          }}
          placeholder="Your password"
          autoComplete="password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleSignIn}
        />
        <Button
          label="Forgot password?"
          size="sm"
          variant="ghost"
          onPress={() => router.push("/forgot-password")}
          style={styles.forgot}
        />
      </View>

      {error ? (
        <View style={styles.error} accessibilityRole="alert">
          <Text variant="bodySm" color={c.accentText}>
            {error}
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  fields: { gap: Spacing.s16 },
  forgot: {
    alignSelf: "flex-end",
    marginTop: -Spacing.s8,
    marginRight: -Spacing.s12,
  },
  error: {
    padding: 14,
    borderRadius: Radius.field,
    backgroundColor: c.accentSoft,
  },
});
