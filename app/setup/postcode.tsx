import { SetupLayout } from "@/components/setup/SetupLayout";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import { Colors, Radius, Spacing } from "@/constants/theme";
import {
  POSTCODE_REGEX,
  postcodeDistrict,
  updateProfile,
} from "@/lib/setup";
import { useAuth } from "@/stores/auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

const c = Colors.light;

export default function SetupPostcode() {
  const router = useRouter();
  const { session } = useAuth();
  const [saving, setSaving] = useState(false);
  const [postcode, setPostcode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const trimmed = postcode.trim();
  const valid = POSTCODE_REGEX.test(trimmed);
  const showInvalid = !valid && trimmed.length >= 5;
  const goNext = () => router.push("/setup/stores");

  const handleContinue = async () => {
    if (!valid || !session || saving) return;

    setSaving(true);
    setError(null);
    try {
      await updateProfile(session.user.id, {
        postcode: postcodeDistrict(trimmed),
      });
      goNext();
    } catch {
      setError(
        "Couldn't save your postcode. Check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SetupLayout
      step={1}
      title="Where do you shop"
      subtitle="Your postcode lets us show prices from shoppers near you"
      onSkip={goNext}
      footer={
        <Button
          label={saving ? "Saving" : "Continue"}
          disabled={!valid || saving}
          onPress={handleContinue}
        />
      }
    >
      <View style={styles.field}>
        <Text variant="label">Postcode</Text>
        <TextField
          icon="pin"
          mono
          value={postcode}
          onChangeText={setPostcode}
          placeholder="e.g. SR0 0YZ"
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="postal-code"
          textContentType="postalCode"
          returnKeyType="done"
          onSubmitEditing={handleContinue}
          invalid={showInvalid}
          accessibilityLabel="Postcode"
        />
        {showInvalid ? (
          <Text variant="caption" color={c.accentText}>
            Enter a UK postcode, like SR0 1XY{" "}
          </Text>
        ) : null}
        {error ? (
          <Text variant="caption" color={c.accentText}>
            {error}
          </Text>
        ) : null}
      </View>

      <View style={styles.note}>
        <Icon name="lock" size={20} color={c.inkMuted} />
        <Text variant="bodySm" color={c.inkMuted} style={styles.noteText}>
          We only keep the first half
          {valid ? `, ${postcodeDistrict(trimmed)},` : ""} to show prices near
          you. We never store your full address.
        </Text>
      </View>
    </SetupLayout>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  note: {
    flexDirection: "row",
    gap: Spacing.s12,
    backgroundColor: c.surfaceRaised,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: Radius.card,
  },
  noteText: { flex: 1 },
});
