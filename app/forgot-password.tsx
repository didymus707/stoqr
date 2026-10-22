import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { Colors, Radius } from "@/constants/theme";
import { supabase } from "@/lib/supabase";

const c = Colors.light;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const valid = EMAIL.test(email.trim());

  const sendLink = async () => {
    if (!valid || loading) return;
    setLoading(true);
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: Linking.createURL("/reset-password"),
      },
    );
    setLoading(false);
    if (resetError)
      setError("Couldn't send the link. Check your connection and try again.");
    else setSent(true);
  };

  if (sent) {
    return (
      <Screen
        showBack={false}
        title="Check your email"
        footer={
          <>
            <Button
              label="Back to sign in"
              onPress={() => router.replace("/sign-in")}
            />
            <Button
              label={loading ? "Sending…" : "Send it again"}
              variant="ghost"
              disabled={loading}
              onPress={sendLink}
            />
          </>
        }
      >
        <View style={styles.tile}>
          <Icon name="mail" size={30} color={c.ok} />
        </View>
        <Text variant="body" color={c.inkMuted}>
          We've sent a link to <Text variant="body">{email.trim()}</Text>. Open
          it on this phone to choose a new password.
        </Text>
        <Text variant="bodySm" color={c.inkMuted}>
          Nothing there? Check your spam folder, or send it again.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen
      title="Forgot your password?"
      subtitle="Enter the email you signed up with and we'll send you a link to choose a new one."
      footer={
        <Button
          label={loading ? "Sending…" : "Send reset link"}
          disabled={!valid || loading}
          onPress={sendLink}
        />
      }
    >
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
        returnKeyType="send"
        onSubmitEditing={sendLink}
        error={error}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 64,
    height: 64,
    borderRadius: Radius.card,
    backgroundColor: c.okSoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
