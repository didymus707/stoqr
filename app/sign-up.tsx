import { useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import {
  PasswordChecks,
  PasswordField,
  passwordIsStrong,
} from "@/components/ui/PasswordField";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { Colors, Fonts, Spacing } from "@/constants/theme";
import { PRIVACY_POLICY_URL, TERMS_URL } from "@/lib/links";
import { supabase } from "@/lib/supabase";

const c = Colors.light;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const emailOk = EMAIL.test(email.trim());
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit =
    name.trim() !== "" &&
    emailOk &&
    passwordIsStrong(password) &&
    confirm === password &&
    !loading;

  const handleSignUp = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() } },
    });
    setLoading(false);

    if (signUpError) {
      const m = signUpError.message.toLowerCase();
      setError(
        m.includes("already") || m.includes("registered")
          ? "There's already an account with this email. Sign in instead."
          : "Couldn't create your account. Check your connection and try again.",
      );
      return;
    }

    // Email confirmation off: signed in straight away, and the tabs guard sends them to setup.
    // Email confirmation on: they need to confirm first.
    if (data.session) router.replace("/(tabs)");
    else setCheckEmail(true);
  };

  if (checkEmail) {
    return (
      <Screen
        title="Check your email"
        subtitle={`We've sent a link to ${email.trim()}. Open it to confirm your account, then sign in.`}
        footer={
          <Button
            label="Go to sign in"
            onPress={() => router.replace("/sign-in")}
          />
        }
      />
    );
  }

  const link = (label: string, url: string) =>
    url ? (
      <Text
        variant="caption"
        style={styles.link}
        onPress={() => Linking.openURL(url)}
        accessibilityRole="link"
      >
        {label}
      </Text>
    ) : (
      label
    );

  return (
    <Screen
      title="Create your account"
      subtitle="It takes a minute. Then we'll set up your cupboard."
      footer={
        <>
          {error ? (
            <Text variant="label" color={c.accentText} style={styles.center}>
              {error}
            </Text>
          ) : null}
          <Text variant="caption" color={c.inkMuted} style={styles.center}>
            By creating an account you agree to our {link("Terms", TERMS_URL)}{" "}
            and {link("Privacy policy", PRIVACY_POLICY_URL)}.
          </Text>
          <Button
            label={loading ? "Creating account…" : "Create account"}
            disabled={!canSubmit}
            onPress={handleSignUp}
          />
          <Button
            label="Already have an account? Sign in"
            variant="ghost"
            onPress={() => router.replace("/sign-in")}
          />
        </>
      }
    >
      <View style={styles.fields}>
        <Field
          label="Your name"
          value={name}
          onChangeText={setName}
          placeholder="Ada Okafor"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
        />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          error={
            email.trim() && !emailOk
              ? "Enter an email like you@example.com"
              : null
          }
        />
        <View style={styles.passwordBlock}>
          <PasswordField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Choose a password"
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <PasswordChecks password={password} />
        </View>
        <PasswordField
          label="Confirm password"
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Type it again"
          autoComplete="new-password"
          textContentType="newPassword"
          error={mismatch ? "Passwords don't match" : null}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fields: { gap: Spacing.s16 },
  passwordBlock: { gap: Spacing.s8 },
  center: { textAlign: "center" },
  link: {
    color: c.ink,
    fontFamily: Fonts.bodySemi,
    textDecorationLine: "underline",
  },
});
