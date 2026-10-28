import { useCallback, useEffect, useState } from "react";
import {
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Icon, IconName } from "@/components/ui/Icon";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useProfile } from "@/hooks/useProfile";
import { PRIVACY_POLICY_URL } from "@/lib/links";
import { requestNotificationPermissions } from "@/lib/notifications";
import { formatPostcode, POSTCODE_REGEX, updateProfile } from "@/lib/setup";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/stores/auth";
import { getConsent, setConsent } from "@/lib/consents";

const c = Colors.light;

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, signOut } = useAuth();
  const { profile, refetch } = useProfile();

  const [name, setName] = useState("");
  const [postcode, setPostcode] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alertsOn, setAlertsOn] = useState<boolean | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [sharing, setSharing] = useState<boolean | null>(false);

  const email = session?.user?.email ?? "";

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      getConsent(session.user.id, "price_sharing")
        .then(setSharing)
        .catch(() => setSharing(false));
    }, [session]),
  );

  // Fill the form once the profile loads.
  useEffect(() => {
    if (!profile) return;
    setName(profile.full_name ?? "");
    setPostcode(profile.postcode ?? "");
  }, [profile]);

  // The phone's real notification setting, re-checked when you come back from Settings.
  useFocusEffect(
    useCallback(() => {
      Notifications.getPermissionsAsync().then(({ status }) =>
        setAlertsOn(status === "granted"),
      );
    }, []),
  );

  const changed =
    name.trim() !== (profile?.full_name ?? "").trim() ||
    postcode.trim().toUpperCase() !== (profile?.postcode ?? "").toUpperCase();
  const postcodeOk =
    postcode.trim() === "" || POSTCODE_REGEX.test(postcode.trim());

  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("") ||
    email.charAt(0).toUpperCase() ||
    "?";

  const toggleSharing = async (next: boolean) => {
    if (!session) return;
    const previous = sharing;
    setSharing(next);
    try {
      await setConsent(session.user.id, "price_sharing", next, "profile");
    } catch {
      setSharing(previous);
      setError(
        "Couldn't update price sharing. Check your connection and try again.",
      );
    }
  };

  const save = async () => {
    if (!session || !changed || !postcodeOk || saving) return;
    setSaving(true);
    setError(null);
    try {
      await updateProfile(session.user.id, {
        full_name: name.trim(),
        postcode: postcode.trim() ? formatPostcode(postcode.trim()) : null,
      });
      await refetch();
      setSaved(true);
    } catch {
      setError(
        "Couldn't save your changes. Check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAlerts = async () => {
    if (alertsOn) {
      Linking.openSettings(); // only the phone's Settings can turn alerts off
      return;
    }
    const granted = await requestNotificationPermissions();
    if (granted) setAlertsOn(true);
    else Linking.openSettings(); // already refused once: iOS only allows changing it in Settings
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    const { error: rpcError } = await supabase.rpc("delete_my_account");
    if (rpcError) {
      setDeleting(false);
      setDeleteError(
        "Couldn't delete your account. Check your connection and try again.",
      );
      return;
    }
    setConfirming(false);
    await signOut();
    router.replace("/");
  };

  const shops = profile?.preferred_stores?.length
    ? profile.preferred_stores.join(", ")
    : "None yet";
  const version = Constants.expoConfig?.version;

  return (
    <>
      <Screen
        compact
        title="Profile"
        footer={
          <>
            {error ? (
              <Text variant="label" color={c.accentText} style={styles.center}>
                {error}
              </Text>
            ) : null}
            <Button
              label={
                saving
                  ? "Saving…"
                  : saved && !changed
                    ? "Saved"
                    : changed
                      ? "Save changes"
                      : "No changes to save"
              }
              disabled={!changed || !postcodeOk || saving}
              onPress={save}
            />
          </>
        }
      >
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text variant="heading" color={c.onInverse}>
              {initials}
            </Text>
          </View>
          <View style={styles.flex}>
            <Text variant="heading" numberOfLines={1}>
              {name.trim() || "Your profile"}
            </Text>
            <Text variant="bodySm" color={c.inkMuted} numberOfLines={1}>
              {email}
            </Text>
          </View>
        </View>

        <Section title="Your details">
          <View style={styles.formCard}>
            <Field
              label="Your name"
              value={name}
              onChangeText={(t) => {
                setName(t);
                setSaved(false);
              }}
              autoCapitalize="words"
              autoComplete="name"
            />
            <Field
              label="Postcode"
              icon="pin"
              mono
              value={postcode}
              onChangeText={(t) => {
                setPostcode(t);
                setSaved(false);
              }}
              placeholder="e.g. SW16 1AA"
              autoCapitalize="characters"
              autoCorrect={false}
              autoComplete="postal-code"
              hint="Used to show prices from shoppers near you."
              error={postcodeOk ? null : "Enter a UK postcode, like SW16 1AA"}
            />
          </View>
        </Section>

        <Section title="Shopping">
          <View style={styles.listCard}>
            <Row icon="store" title="Your shops" detail={shops} first />
            <Row
              icon="bell"
              title="Low-stock alerts"
              detail={
                alertsOn === null
                  ? "Checking…"
                  : alertsOn
                    ? "On. Change this in your phone's Settings."
                    : "Off. Tap to turn on."
              }
              onPress={handleAlerts}
              trailing={
                <View style={[styles.track, alertsOn && styles.trackOn]}>
                  <View style={styles.knob} />
                </View>
              }
            />
          </View>

          <View style={[styles.row, styles.divider]}>
            <Icon name="budget" size={22} />
            <View style={styles.flex}>
              <Text variant="item">Share my prices</Text>
              <Text variant="caption" color={c.inkMuted}>
                Anonymous averages, shown once 5 or more people share a price
              </Text>
            </View>
            <Switch
              value={!!sharing}
              disabled={sharing === null}
              onValueChange={toggleSharing}
              trackColor={{ false: c.lineStrong, true: c.inverse }}
              thumbColor={c.surfaceRaised}
              accessibilityLabel="Share my prices"
            />
          </View>
        </Section>

        <Section title="Account">
          <View style={styles.listCard}>
            {PRIVACY_POLICY_URL ? (
              <Row
                icon="lock"
                title="Privacy policy"
                first
                onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
                chevron
              />
            ) : null}
            <Row
              icon="logout"
              title="Sign out"
              first={!PRIVACY_POLICY_URL}
              onPress={handleSignOut}
            />
          </View>
        </Section>

        <View style={styles.dangerZone}>
          <Button
            label="Delete account"
            variant="ghost"
            labelStyle={{ color: c.accentText }}
            onPress={() => setConfirming(true)}
          />
          {version ? (
            <Text variant="code" color={c.inkMuted}>
              stoQr {version}
            </Text>
          ) : null}
        </View>
      </Screen>

      <Modal
        visible={confirming}
        transparent
        animationType="fade"
        onRequestClose={() => !deleting && setConfirming(false)}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => !deleting && setConfirming(false)}
            accessibilityLabel="Close"
          />
          <View
            style={[
              styles.sheet,
              { paddingBottom: insets.bottom + Spacing.s16 },
            ]}
            accessibilityViewIsModal
          >
            <View style={styles.handle} />
            <Text variant="titleSm" accessibilityRole="header">
              Delete your account?
            </Text>
            <Text variant="body" color={c.inkMuted}>
              This permanently deletes your cupboard, shopping lists and
              purchase history. You can't undo it.
            </Text>
            {deleteError ? (
              <Text variant="label" color={c.accentText}>
                {deleteError}
              </Text>
            ) : null}
            <Pressable
              onPress={handleDelete}
              disabled={deleting}
              accessibilityRole="button"
              style={[styles.dangerButton, deleting && styles.dangerButtonBusy]}
            >
              <Text variant="button" color={c.onAccent}>
                {deleting ? "Deleting…" : "Delete my account"}
              </Text>
            </Pressable>
            <Button
              label="Keep my account"
              variant="ghost"
              disabled={deleting}
              onPress={() => setConfirming(false)}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text variant="overline" color={c.inkMuted}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function Row({
  icon,
  title,
  detail,
  first,
  onPress,
  chevron,
  trailing,
}: {
  icon: IconName;
  title: string;
  detail?: string;
  first?: boolean;
  onPress?: () => void;
  chevron?: boolean;
  trailing?: React.ReactNode;
}) {
  const content = (
    <>
      <Icon name={icon} size={22} />
      <View style={styles.flex}>
        <Text variant="item">{title}</Text>
        {detail ? (
          <Text variant="caption" color={c.inkMuted}>
            {detail}
          </Text>
        ) : null}
      </View>
      {trailing}
      {chevron ? (
        <Icon name="chevron" size={20} strokeWidth={2} color={c.inkSubtle} />
      ) : null}
    </>
  );
  const style = [styles.row, !first && styles.divider];
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" style={style}>
      {content}
    </Pressable>
  ) : (
    <View style={style}>{content}</View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  center: { textAlign: "center" },
  identity: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    backgroundColor: c.inverse,
    alignItems: "center",
    justifyContent: "center",
  },
  section: { gap: Spacing.s8 },
  formCard: {
    backgroundColor: c.surfaceRaised,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: Radius.card,
    padding: Spacing.s16,
    gap: 14,
  },
  listCard: {
    backgroundColor: c.surfaceRaised,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: Radius.card,
    overflow: "hidden",
  },
  row: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s12,
    paddingVertical: 10,
    paddingHorizontal: Spacing.s16,
  },
  divider: { borderTopWidth: 1, borderTopColor: c.lineSoft },
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 3,
    backgroundColor: c.lineStrong,
    alignItems: "flex-start",
  },
  trackOn: { backgroundColor: c.inverse, alignItems: "flex-end" },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: c.surfaceRaised,
  },
  dangerZone: { alignItems: "center", gap: 4 },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(23,23,27,0.45)",
  },
  sheet: {
    backgroundColor: c.surfaceRaised,
    borderTopLeftRadius: Radius.hero,
    borderTopRightRadius: Radius.hero,
    paddingTop: Spacing.s12,
    paddingHorizontal: Spacing.s20,
    gap: Spacing.s12,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: c.line,
  },
  dangerButton: {
    height: 56,
    borderRadius: Radius.button,
    backgroundColor: c.accentText,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerButtonBusy: { opacity: 0.6 },
});
