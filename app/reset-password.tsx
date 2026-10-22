import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  PasswordChecks,
  PasswordField,
  passwordIsStrong,
} from "@/components/ui/PasswordField";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { supabase } from "@/lib/supabase";

const c = Colors.light;

type Status = "checking" | "ready" | "expired";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setStatus("expired");
      return;
    }
    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error: exchangeError }) => {
        setStatus(exchangeError ? "expired" : "ready");
      });
  }, [code]);

  const mismatch = confirm.length > 0 && confirm !== password;
  const canSave = passwordIsStrong(password) && confirm === password && !saving;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (updateError) setError("Couldn't save your new password. Try again.");
    else router.replace("/(tabs)");
  };

  if (status === "checking") {
    return (
      <Screen showBack={false} title="Checking your link…">
        <View style={styles.loading}>
          <ActivityIndicator color={c.accent} />
        </View>
      </Screen>
    );
  }

  if (status === "expired") {
    return (
      <Screen
        showBack={false}
        title="This link has expired"
        footer={
          <>
            <Button
              label="Send a new link"
              onPress={() => router.replace("/forgot-password")}
            />
            <Button
              label="Back to sign in"
              variant="ghost"
              onPress={() => router.replace("/sign-in")}
            />
          </>
        }
      >
        <View style={styles.tile}>
          <Icon name="clock" size={30} color={c.accentText} />
        </View>
        <Text variant="body" color={c.inkMuted}>
          Reset links only work once, for a short time. Ask for a new one and
          use it straight away.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen
      showBack={false}
      title="Choose a new password"
      subtitle="You'll use it next time you sign in."
      footer={
        <>
          {error ? (
            <Text variant="label" color={c.accentText} style={styles.center}>
              {error}
            </Text>
          ) : null}
          <Button
            label={saving ? "Saving…" : "Save new password"}
            disabled={!canSave}
            onPress={save}
          />
        </>
      }
    >
      <View style={styles.fields}>
        <View style={styles.passwordBlock}>
          <PasswordField
            label="New password"
            value={password}
            onChangeText={setPassword}
            placeholder="Choose a password"
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <PasswordChecks password={password} />
        </View>
        <PasswordField
          label="Confirm new password"
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
  loading: { paddingVertical: Spacing.s48 },
  fields: { gap: Spacing.s16 },
  passwordBlock: { gap: Spacing.s8 },
  center: { textAlign: "center" },
  tile: {
    width: 64,
    height: 64,
    borderRadius: Radius.card,
    backgroundColor: c.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
