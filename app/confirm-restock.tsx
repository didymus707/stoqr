import { supabase } from "@/lib/supabase";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useEffect, useMemo, useState } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { useShoppingSession } from "@/stores/shopping-session";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Radius, Colors, FontSize, Spacing, Fonts } from "@/constants/theme";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { TextField } from "@/components/ui/TextField";
import { Screen } from "@/components/ui/Screen";
import { Field } from "@/components/ui/Field";
import { unitLabel } from "@/lib/unit";
import { Stepper } from "@/components/ui/Stepper";

const c = Colors.light;

type RestockItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  price: number | null;
  pack_size: number;
  pack_price: number | null;
  low_stock_threshold: number;
};

type RowState = { packs: number; packPrice: string };

const toPrice = (value: string) => {
  const num = Number(value.replace(",", "."));
  return value.trim() !== "" && Number.isFinite(num) && num >= 0 ? num : null;
};

const suggestedPacks = (item: RestockItem) => {
  const size = item.pack_size || 1;
  const needed = item.low_stock_threshold + 1 - item.quantity;
  return Math.max(1, Math.ceil(needed / size));
};

const lastPackPrice = (item: RestockItem) => {
  const size = item.pack_size || 1;
  const price =
    item.pack_price ?? (item.price !== null ? item.price * size : null);
  return price !== null ? String(Number(price.toFixed(2))) : "";
};

const ConfirmRestock = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ ids?: string }>();
  const { activeStore, setActiveStore, setCheckedLowStock } =
    useShoppingSession();

  const itemIds = useMemo(
    () => (params.ids ? params.ids.split(",").filter(Boolean) : []),
    [params.ids],
  );

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [items, setItems] = useState<RestockItem[]>([]);
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [store, setStore] = useState(activeStore ?? "");
  const [removed, setRemoved] = useState<{
    item: RestockItem;
    row: RowState;
    index: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (itemIds.length === 0) {
      setLoading(false);
      return;
    }
    supabase
      .from("items")
      .select(
        "id, name, quantity, price, unit, pack_size, pack_price, low_stock_threshold",
      )
      .in("id", itemIds)
      .then(({ data, error }) => {
        if (error || !data) {
          setLoadError("Couldn't load these items. Go back and try again");
        } else {
          setItems(data);
          const initial: Record<string, RowState> = {};
          data.forEach((item) => {
            initial[item.id] = {
              packs: suggestedPacks(item),
              packPrice: lastPackPrice(item),
            };
          });
          setRows(initial);
        }
        setLoading(false);
      });
  }, [itemIds]);

  const updateRow = (id: string, patch: Partial<RowState>) =>
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const removeItem = (id: string) => {
    const index = items.findIndex((i) => i.id === id);
    if (index < 0) return;
    setRemoved({ item: items[index], row: rows[id], index });
    setItems((prev) => prev.filter((item) => item.id !== id));
    setCheckedLowStock((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const undoRemove = () => {
    if (!removed) return;
    const { item, row, index } = removed;
    setItems((prev) => {
      const next = [...prev];
      next.splice(Math.min(index, next.length), 0, item);
      return next;
    });
    setRows((prev) => ({ ...prev, [item.id]: row }));
    setCheckedLowStock((prev) => new Set(prev).add(item.id));
    setRemoved(null);
  };

  const missingPrices = items.filter(
    (item) => toPrice(rows[item.id]?.packPrice ?? "") === null,
  ).length;

  const total = items.reduce((sum, item) => {
    const row = rows[item.id];
    return sum + (row ? row.packs * (toPrice(row.packPrice) ?? 0) : 0);
  }, 0);

  const canSubmit =
    store.trim() !== "" &&
    items.length > 0 &&
    missingPrices === 0 &&
    !isSubmitting;

  const hint =
    items.length === 0
      ? null
      : !store.trim()
        ? "Enter the shop you bought these from"
        : missingPrices > 0
          ? `And a price for ${missingPrices} more items${missingPrices === 1 ? "" : "s"}`
          : null;

  const handleConfirm = async () => {
    if (!!canSubmit) return;
    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload = items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        unit: item.unit,
        packs: rows[item.id].packs,
        pack_size: item.pack_size || 1,
        pack_price: toPrice(rows[item.id].packPrice),
      }));

      const { error } = await supabase.rpc("restock_items", {
        p_store: store.trim(),
        p_items: payload,
      });

      if (error) throw error;

      // update activeStore constext if it changed durning restock
      if (store.trim() !== activeStore) setActiveStore(store.trim());
      // return to shopping list
      setCheckedLowStock(new Set());
      router.back(); // shopping list refetches on focus
    } catch {
      setFormError(
        "Couldn't save this restock. Check your connection and try again.",
      );
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Screen compact title="Confirm restock">
        <View style={styles.loading}>
          <ActivityIndicator size={Spacing.s12} color={c.accent} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      compact
      title="Confirm restock"
      footer={
        items.length > 0 || removed ? (
          <>
            {removed ? (
              <View style={styles.undoBar}>
                <Text variant="bodySm" color={c.onInverse} style={styles.flex}>
                  {removed.item.name} removed
                </Text>
                <Button
                  label="Undo"
                  size="sm"
                  variant="secondary"
                  onPress={undoRemove}
                />
              </View>
            ) : null}
            {formError ? (
              <Text variant="label" color={c.accentText} style={styles.center}>
                {formError}
              </Text>
            ) : hint ? (
              <Text variant="label" color={c.accentText} style={styles.center}>
                {hint}
              </Text>
            ) : null}
            <Button
              label={isSubmitting ? "Confirming..." : "Confirm restock"}
              value={`£${total.toFixed(2)}`}
              disabled={!canSubmit}
              onPress={handleConfirm}
            />
          </>
        ) : null
      }
    >
      {loadError ? (
        <Text variant="bodySm" color={c.accentText}>
          {loadError}
        </Text>
      ) : null}

      <Field
        label="Shop"
        required
        icon="store"
        value={store}
        onChangeText={setStore}
        placeholder="e.g. Aldi, Lidl"
        autoCapitalize="words"
        hint={
          activeStore && store === activeStore
            ? "Filled in from your shopping session"
            : undefined
        }
      />

      {items.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text variant="overline" color={c.inkMuted}>
              {items.length} {items.length > 1 ? "item" : "items"}
            </Text>
            <Text variant="caption" color={c.inkMuted}>
              Packs · price per pack
            </Text>
          </View>

          <View style={styles.card}>
            {items.map((item, index) => {
              const row = rows[item.id] ?? { packs: 1, packPrice: "" };
              const size = item.pack_size || 1;
              const isPack = size > 1;
              const price = toPrice(row.packPrice);
              const after = item.quantity + row.packs * size;

              return (
                <View
                  key={item.id}
                  style={[styles.row, index > 0 && styles.divider]}
                >
                  <View style={styles.rowHead}>
                    <View style={styles.flexText}>
                      <Text variant="item">{item.name}</Text>
                      <Text variant="caption" color={c.inkMuted}>
                        {isPack
                          ? `Pack of ${size}${price != null ? ` · £${(price / size).toFixed(2)} per ${item.unit ?? "item"}` : ""}`
                          : `Bought singly${price != null ? ` · £${price.toFixed(2)} each` : ""}`}
                      </Text>
                      <Text variant="caption" color={c.inkMuted}>
                        In cupboard {item.quantity} →{" "}
                        <Text
                          variant="caption"
                          color={c.ok}
                          style={styles.semi}
                        >
                          {after} {unitLabel(after, item.unit)}
                        </Text>
                      </Text>
                    </View>
                    <IconButton
                      icon="close"
                      variant="ghost"
                      iconSize={20}
                      label={`Remove ${item.name}, put back on the shelf`}
                      onPress={() => removeItem(item.id)}
                      style={styles.remove}
                    />
                  </View>

                  <View style={styles.controls}>
                    <Stepper
                      label={
                        isPack
                          ? `Packs of ${item.name}`
                          : `How many ${item.name}`
                      }
                      value={row.packs}
                      min={1}
                      onChange={(packs) => updateRow(item.id, { packs })}
                    />
                    <TextField
                      mono
                      size="sm"
                      prefix="£"
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      value={row.packPrice}
                      onChangeText={(packPrice) =>
                        updateRow(item.id, { packPrice })
                      }
                      invalid={price === null}
                      containerStyle={styles.flex}
                      accessibilityLabel={`${isPack ? "Price per pack" : "Price each"} for ${item.name}`}
                      trailing={
                        <Text variant="caption" color={c.inkMuted}>
                          {isPack ? "per pack" : "each"}
                        </Text>
                      }
                    />
                  </View>
                  {price === null ? (
                    <Text
                      variant="caption"
                      color={c.accentText}
                      style={styles.semi}
                    >
                      Price needed to restock
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text variant="heading">Nothing left to restock</Text>
          <Text variant="bodySm" color={c.inkMuted} style={styles.center}>
            Everything went back on the shelf
          </Text>
          <Button
            label="Back to shopping list"
            size="sm"
            variant="outline"
            onPress={() => router.back()}
          />
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: "center" },
  semi: { fontFamily: Fonts.bodySemi },
  loading: { paddingVertical: Spacing.s48 },
  section: { gap: Spacing.s8 },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  card: {
    backgroundColor: c.surfaceRaised,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: Radius.card,
    overflow: "hidden",
  },
  row: {
    paddingTop: Spacing.s8,
    paddingBottom: Spacing.s12,
    paddingLeft: 14,
    paddingRight: 6,
    gap: Spacing.s8,
  },
  divider: { borderTopWidth: 1, borderTopColor: c.lineSoft },
  rowHead: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.s8 },
  flexText: { flex: 1, minWidth: 0, gap: 2, paddingTop: 4 },
  remove: { marginTop: -2 },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingRight: Spacing.s8,
  },
  undoBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s8,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: Radius.control,
    backgroundColor: c.inverse,
  },
  empty: {
    alignItems: "center",
    gap: Spacing.s8,
    paddingVertical: Spacing.s32,
    paddingHorizontal: Spacing.s20,
    backgroundColor: c.surfaceRaised,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: c.lineStrong,
    borderRadius: Radius.card,
  },
});

export default ConfirmRestock;
