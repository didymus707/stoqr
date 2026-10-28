import { SetupLayout } from "@/components/setup/SetupLayout";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { setConsent } from "@/lib/consents";
import { updateProfile } from "@/lib/setup";
import { useAuth } from "@/stores/auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";

const c = Colors.light;

const commonStores = [
  "Aldi",
  "Lidl",
  "Tesco",
  "Asda",
  "Sainsbury's",
  "Morrisons",
  "Co-op",
];

export default function SetupStores() {
  const router = useRouter();
  const { session } = useAuth();
  const [stores, setStores] = useState(commonStores);
  const [pickedStores, setPickedStores] = useState<string[]>([]);
  const [otherStores, setOtherStores] = useState("");
  const [addingOtherStores, setAddingOtherStores] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sharePrice, setSharePrice] = useState(false);

  const goNext = () => router.push("/setup/cupboard");

  const toggle = (store: string) =>
    setPickedStores((prev) =>
      prev.includes(store)
        ? prev.filter((name) => name !== store)
        : [...prev, store],
    );

  const addOtherStores = () => {
    const storeName = otherStores.trim();
    if (!storeName) return;
    if (!stores.includes(storeName)) setStores((prev) => [...prev, storeName]);
    if (!pickedStores.includes(storeName))
      setPickedStores((prev) => [...prev, storeName]);
    setOtherStores("");
    setAddingOtherStores(false);
  };

  const handleContinue = async () => {
    if (pickedStores.length === 0 || !session || saving) return;
    setSaving(true);
    setError(null);
    try {
      await updateProfile(session.user.id, { preferred_stores: pickedStores });
      await setConsent(session.user.id, "price_sharing", sharePrice, "setup");
      goNext();
    } catch {
      setError(
        "Couldn't save your stores. Check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const count = pickedStores.length;

  return (
    <SetupLayout
      step={2}
      title="Which stores do you use?"
      subtitle="We'll compare prices across these, and list them first when you start a shop"
      onSkip={goNext}
      footer={
        <>
          {error ? (
            <Text variant="caption" color={c.accentText} style={styles.center}>
              {error}
            </Text>
          ) : null}
          <Button
            label={
              saving
                ? "Saving..."
                : count === 0
                  ? "Pick at least one store"
                  : `Continue with ${count} ${count === 1 ? "store" : "stores"}`
            }
            disabled={count === 0 || saving}
            onPress={handleContinue}
          />
        </>
      }
    >
      <View style={styles.grid}>
        {stores.map((name) => {
          const selected = pickedStores.includes(name);
          return (
            <Pressable
              key={name}
              onPress={() => toggle(name)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={name}
              style={[styles.tile, selected && styles.tileSelected]}
            >
              <Text
                variant="item"
                color={selected ? c.onInverse : c.ink}
                style={styles.tileName}
              >
                {name}
              </Text>
              <View style={[styles.mark, selected && styles.markSelected]}>
                {selected ? (
                  <Icon name="check" size={14} strokeWidth={3} color={c.ink} />
                ) : null}
              </View>
            </Pressable>
          );
        })}

        {!addingOtherStores ? (
          <Pressable
            accessibilityRole="button"
            style={[styles.tile, styles.tileOther]}
            onPress={() => setAddingOtherStores(true)}
          >
            <Icon name="add" size={18} strokeWidth={2} />
            <Text variant="item">Other Store</Text>
          </Pressable>
        ) : null}

        {addingOtherStores ? (
          <View style={styles.otherRow}>
            <TextField
              icon="store"
              containerStyle={styles.flex}
              value={otherStores}
              onChangeText={setOtherStores}
              placeholder="Store Name"
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={addOtherStores}
              accessibilityLabel="Other store name"
            />
            <Button
              label="Add"
              size="sm"
              variant="secondary"
              onPress={addOtherStores}
            />
          </View>
        ) : null}

        <View style={styles.consent}>
          <View style={styles.consentText}>
            <Text variant="item">Find out where things are cheapest</Text>
            <Text variant="bodySm" color={c.inkMuted}>
              Share the prices you pay and stoQr can show which shops are
              cheapest for the things you buy, using prices from shoppers like
              you.
            </Text>
            <Text variant="bodySm" color={c.inkMuted}>
              Prices only appear as averages, once 5 or more people have shared
              one. Your name is never shown
            </Text>
          </View>

          <View style={styles.consentToggle}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="label">Share my prices</Text>
              <Text variant="caption" color={c.inkMuted}>
                Off unless you turn it on. You can change this in Profile.
              </Text>
            </View>

            <Switch
              value={sharePrice}
              onValueChange={setSharePrice}
              trackColor={{ false: c.lineStrong, true: c.inverse }}
              thumbColor={c.surfaceRaised}
              accessibilityLabel="Share my prices"
              accessibilityHint="Adds the prices you pay to anonymous averages other shoppers see"
            />
          </View>
        </View>
      </View>
    </SetupLayout>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: {
    width: "48.5%",
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s8,
    paddingLeft: Spacing.s16,
    paddingRight: 14,
    backgroundColor: c.surfaceRaised,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: Radius.field,
  },
  tileSelected: { backgroundColor: c.inverse, borderColor: c.inverse },
  tileOther: {
    backgroundColor: "transparent",
    borderStyle: "dashed",
    borderColor: c.lineStrong,
  },
  tileName: { flex: 1 },
  mark: {
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: c.lineStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  markSelected: { backgroundColor: c.onInverse, borderColor: c.onInverse },
  otherRow: { flexDirection: "row", alignItems: "center", gap: Spacing.s8 },
  flex: { flex: 1 },
  center: { textAlign: "center" },
  consent: {
    gap: Spacing.s12,
    padding: Spacing.s16,
    backgroundColor: c.surfaceRaised,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: Radius.card,
  },
  consentText: { gap: 4 },
  consentToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s12,
    paddingTop: Spacing.s12,
    borderTopWidth: 1,
    borderTopColor: c.lineSoft,
  },
});
