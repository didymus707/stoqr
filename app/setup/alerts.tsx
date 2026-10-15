import { SetupLayout } from "@/components/setup/SetupLayout";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { Text } from "@/components/ui/Text";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { requestNotificationPermissions } from "@/lib/notifications";
import { finishSetup } from "@/lib/setup";
import { useAuth } from "@/stores/auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

const c = Colors.light;

export default function SetupAlerts() {
  const router = useRouter();
  const { session } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finish = async (askForAlerts: boolean) => {
    if (!session || busy) return;
    setBusy(true);
    setError(null);

    try {
      if (askForAlerts) await requestNotificationPermissions();
      await finishSetup(session.user.id);
      router.replace("/(tabs)");
    } catch {
      setError("Something went wrong finishing setup. Try again.");
      setBusy(false);
    }
  };

  return (
    <SetupLayout
      step={4}
      title="Want a heads-up before you run out?"
      subtitle="We'll send one alert when something gets low and add it to your shopping list for you"
      footer={
        <>
          {error ? (
            <Text variant="caption" color={c.accentText} style={styles.center}>
              {error}
            </Text>
          ) : null}
          <Button
            label="Turn on alerts"
            disabled={busy}
            onPress={() => finish(true)}
          />
          <Button
            label="Not now"
            variant="ghost"
            disabled={busy}
            onPress={() => finish(false)}
          />
        </>
      }
    >
      <View
        style={styles.examples}
        accessibilityLabel="Example alert: Milk is running low, 1 left, added to your shopping list."
      >
        <ExampleAlert
          title="Milk is running low"
          body="1 left. Added to your shopping list."
          time="now"
        />
        <ExampleAlert
          title="Toilet roll is out"
          body="Added to your shopping list."
          time="Tue"
          faded
        />
      </View>
      <Text variant="bodySm" color={c.inkMuted} style={styles.center}>
        Only stock alerts. No marketing, ever.
      </Text>
    </SetupLayout>
  );
}

function ExampleAlert({
  title,
  body,
  time,
  faded,
}: {
  title: string;
  body: string;
  time: string;
  faded?: boolean;
}) {
  return (
    <View
      style={[styles.alert, faded ? styles.alertFaded : styles.alertFront]}
      importantForAccessibility="no-hide-descendants"
    >
      <Logo size={40} variant="mark" />
      <View style={styles.alertText}>
        <View style={styles.alertTop}>
          <Text variant="label">stoQr</Text>
          <Text variant="caption" color={c.inkMuted}>
            {time}
          </Text>
        </View>
        <Text variant="item">{title}</Text>
        <Text variant="bodySm" color={c.inkMuted}>
          {body}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  examples: { gap: Spacing.s12, paddingVertical: Spacing.s16 },
  alert: {
    flexDirection: "row",
    gap: Spacing.s12,
    padding: 14,
    backgroundColor: c.surfaceRaised,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: Radius.hero,
  },
  alertFront: {
    transform: [{ rotate: "-1.5deg" }],
    shadowColor: c.ink,
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 4,
  },
  alertFaded: {
    opacity: 0.6,
    transform: [{ rotate: "1deg" }, { scale: 0.96 }],
  },
  alertText: { flex: 1, minWidth: 0, gap: 2 },
  alertTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  center: { textAlign: "center" },
});
