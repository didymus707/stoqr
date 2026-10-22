import { SetupLayout } from "@/components/setup/SetupLayout";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import { Text } from "@/components/ui/Text";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { getOrCreateInventory, updateProfile } from "@/lib/setup";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/stores/auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

const c = Colors.light;

const starterItems = [
  { key: "milk", name: "Milk, 4 pints", unit: "bottle", alertAt: 1 },
  { key: "bread", name: "Bread", unit: "loaf", alertAt: 0 },
  { key: "eggs", name: "Eggs", unit: "pc", alertAt: 3 },
  { key: "rice", name: "Rice, 5kg", unit: "bag", alertAt: 0 },
  { key: "tomatoes", name: "Tinned tomatoes", unit: "can", alertAt: 1 },
  { key: "oil", name: "Cooking oil", unit: "bottle", alertAt: 0 },
  { key: "loo", name: "Toilet roll", unit: "pc", alertAt: 4 },
  { key: "soap", name: "Washing-up liquid", unit: "bottle", alertAt: 0 },
  { key: "plantain", name: "Plantain", unit: "pc", alertAt: 1 },
];

export default function SetupCupboard() {
  const router = useRouter();
  const { session } = useAuth();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const chosen = starterItems.filter((item) => (quantities[item.key] ?? 0) > 0);
  const goNext = () => router.push("/setup/alerts");

  const handleAdd = async () => {
    if (!session || saving || chosen.length === 0) return;
    setSaving(true);
    setError(null);

    try {
      const inventoryId = await getOrCreateInventory(session.user.id);
      const { error: insertError } = await supabase.from("items").insert(
        chosen.map((item) => ({
          inventory_id: inventoryId,
          name: item.name,
          unit: item.unit,
          quantity: quantities[item.key],
          low_stock_threshold: item.alertAt,
        })),
      );
      if (insertError) throw insertError;
      goNext();
    } catch {
      setError("Couldn't add your items. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const count = chosen.length;

  return (
    <SetupLayout
      step={3}
      title="What's in your cupboard?"
      subtitle="Tap + for anything you have now. You can add the rest later"
      onSkip={goNext}
      footer={
        <>
          {error ? (
            <Text variant="caption" color={c.accentText} style={styles.center}>
              {error}
            </Text>
          ) : null}
          <Button
            label={`Add ${count} ${count === 1 ? "item" : "items"} to cupboard`}
            disabled={saving || count === 0}
            onPress={handleAdd}
          />
        </>
      }
    >
      <View style={styles.card}>
        {starterItems.map((item, index) => (
          <View
            key={item.key}
            style={[styles.row, index > 0 && styles.divider]}
          >
            <View style={styles.flexText}>
              <Text variant="item">{item.name}</Text>
              <Text variant="caption" color={c.inkMuted}>
                {item.alertAt > 0
                  ? `We'll warn you at ${item.alertAt}`
                  : "We'll warn you when its out"}
              </Text>
            </View>
            <Stepper
              label={item.name}
              value={quantities[item.key] ?? 0}
              onChange={(value) =>
                setQuantities((prev) => ({ ...prev, [item.key]: value }))
              }
            />
          </View>
        ))}
      </View>
    </SetupLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: c.surfaceRaised,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: Radius.card,
    overflow: "hidden",
  },
  row: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
    paddingLeft: Spacing.s16,
    paddingRight: 6,
  },
  divider: { borderTopWidth: 1, borderTopColor: c.lineSoft },
  flexText: { flex: 1, minWidth: 0, gap: 1 },
  center: { textAlign: "center" },
});
