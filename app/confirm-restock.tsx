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
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { TextField } from "@/components/ui/TextField";

interface RestockItem {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  price: number | null;
  low_stock_threshold: number;
}

interface ItemFormState {
  quantity: string;
  unitPrice: string;
}

const c = Colors.light;

const ConfirmRestock = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ ids?: string }>();
  const { activeStore, setActiveStore, setCheckedLowStock } =
    useShoppingSession();

  const itemIds = useMemo(() => {
    if (!params.ids) return [];
    return Array.isArray(params.ids) ? params.ids : params.ids.split(",");
  }, [params.ids]);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<RestockItem[]>([]);
  const [store, setStore] = useState(activeStore || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<Record<string, ItemFormState>>({});

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const state = formState[item.id];
      if (!state) return sum;
      const qty = parseFloat(state.quantity) || 0;
      const price = parseFloat(state.unitPrice) || 0;
      return sum + qty * price;
    }, 0);
  }, [items, formState]);

  useEffect(() => {
    async function fetchRestockItems() {
      if (itemIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("items")
        .select("id, name, low_stock_threshold, price, unit, quantity")
        .in("id", itemIds);

      if (error) {
        Alert.alert("Error", "Failed to load items for restock");
      } else if (data) {
        setItems(data);

        const initialForm: Record<string, ItemFormState> = {};
        data.forEach((item) => {
          initialForm[item.id] = {
            quantity: String((item.low_stock_threshold ?? 0) + 1),
            unitPrice: item.price !== null ? String(item.price) : "",
          };
        });

        setFormState(initialForm);
      }

      setLoading(false);
    }
    fetchRestockItems();
  }, [itemIds]);

  const handleItemChange = (
    id: string,
    field: keyof ItemFormState,
    value: string,
  ) => {
    setFormState((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const missingPrices = items.filter((item) => {
    const price = parseFloat(formState[item.id]?.unitPrice ?? "");
    return isNaN(price) || price < 0;
  }).length;

  const storeHint = !store.trim() ? "Enter the store you're shopping at" : null;

  const priceHint =
    missingPrices > 0
      ? `Add a price for ${missingPrices} more item${missingPrices === 1 ? "" : "s"}`
      : null;

  const handleRemoveItem = (id: string) => {
    setCheckedLowStock((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    setItems((prev) => prev.filter((prevItem) => prevItem.id !== id));
    setFormState((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const isFormValid = useMemo(() => {
    if (!store.trim()) return false;
    if (items.length === 0) return false;

    return items.every((item) => {
      const state = formState[item.id];
      if (!state) return false;

      const priceNum = parseFloat(state.unitPrice);
      const qtyNum = parseFloat(state.quantity);

      return !isNaN(qtyNum) && qtyNum > 0 && priceNum >= 0 && !isNaN(priceNum);
    });
  }, [store, items, formState]);

  const handleConfirmRestock = async () => {
    console.log("I was called");
    if (!isFormValid) return;
    setIsSubmitting(true);

    try {
      const payload = items?.map((item) => {
        const state = formState[item.id];
        const unitPrice = parseFloat(state.unitPrice);
        const quantity = parseFloat(state.quantity);

        return {
          item_id: item.id,
          item_name: item.name,
          quantity: quantity,
          unit: item.unit,
          unit_price: unitPrice,
        };
      });

      const { error } = await supabase.rpc("restock_items", {
        p_store: store.trim(),
        p_items: payload,
      });

      if (error) throw error;

      // update activeStore constext if it changed durning restock
      if (store !== activeStore) {
        setActiveStore(store.trim());
      }

      // return to shopping list
      setCheckedLowStock(new Set());
      router.back();
    } catch (error) {
      Alert.alert(
        "Restock Failed",
        error instanceof Error ? error.message : "Failed to complete restock",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size={Spacing.s12} color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: c.surface }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.container}
        >
          <View style={styles.header}>
            <IconButton
              icon="back"
              label="Back to Shopping list"
              onPress={() => router.back()}
            />
            <Text variant="titleSm">Confirm restock</Text>
          </View>

          <View style={styles.fieldGroup}>
            <TextField
              icon="store"
              value={store}
              invalid={!store.trim()}
              onChangeText={(val) => setStore(val)}
              autoCapitalize="words"
              placeholder="e.g. Aldi, Lidl"
              accessibilityLabel="Store, required"
            />
            {activeStore ? (
              <Text variant="caption" color={c.inkMuted}>
                Filled in from your shopping session
              </Text>
            ) : null}
          </View>

          <View style={styles.sectionHeader}>
            <Text variant="heading">{items.length} ITEMS</Text>
            <Text>Qty · price each</Text>
          </View>

          <View style={styles.itemCardWrapper}>
            {/* Items List */}
            {items.map((item, index) => {
              const state = formState[item.id] || {
                quantity: "1",
                unitPrice: "",
              };
              const qtyNum = parseFloat(state.quantity) || 0;
              const priceNum = parseFloat(state.unitPrice) || 0;

              return (
                <View
                  key={item.id}
                  style={[styles.itemCard, index > 0 && styles.itemDivider]}
                >
                  <View style={styles.itemHeader}>
                    <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                      <Text variant="item">{item.name}</Text>
                      <Text variant="caption" color={c.inkMuted}>
                        In cupboard {item.quantity} →{" "}
                        <Text
                          variant="caption"
                          color={c.ok}
                          style={{ fontFamily: Fonts.bodySemi }}
                        >
                          {item.quantity + qtyNum}
                        </Text>
                      </Text>
                    </View>

                    <IconButton
                      icon="close"
                      variant="ghost"
                      label={`Remove ${item.name}`}
                      style={{ marginTop: -8, marginRight: -8 }}
                      onPress={() => handleRemoveItem(item.id)}
                    />
                  </View>

                  <View style={styles.inputsRow}>
                    <View style={{ flex: 1, minWidth: 0, gap: Spacing.s4 }}>
                      <TextField
                        size="sm"
                        keyboardType="decimal-pad"
                        value={state.quantity}
                        onChangeText={(val) =>
                          handleItemChange(item.id, "quantity", val)
                        }
                        accessibilityLabel={`Quantity of ${item.name}`}
                      />
                    </View>

                    <View style={{ flex: 1, minWidth: 0, gap: Spacing.s4 }}>
                      <TextField
                        mono
                        size="sm"
                        prefix="£"
                        keyboardType="decimal-pad"
                        value={state.unitPrice}
                        onChangeText={(val) =>
                          handleItemChange(item.id, "unitPrice", val)
                        }
                        placeholder="0.00"
                        accessibilityLabel={`Price paid for ${item.name}`}
                        invalid={isNaN(parseFloat(state.unitPrice))}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + Spacing.s12 },
          ]}
        >
          {priceHint && (
            <Text
              variant="label"
              color={c.accentText}
              style={{ textAlign: "center" }}
            >
              {priceHint}
            </Text>
          )}
          <Button
            onPress={handleConfirmRestock}
            value={`£${total.toFixed(2)}`}
            disabled={!isFormValid || isSubmitting}
            label={isSubmitting ? "Confirming..." : "Confirm Restock"}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    paddingHorizontal: Spacing.s20,
    paddingBottom: Spacing.s24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s8,
    marginBottom: Spacing.s12,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  fieldGroup: {
    gap: Spacing.s4,
    marginTop: Spacing.s12,
    marginBottom: Spacing.s12,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  inputLabel: {
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    marginBottom: Spacing.s4,
  },
  input: {
    backgroundColor: c.surfaceRaised,
    borderRadius: Radius.md,
    padding: Spacing.s12,
    fontSize: FontSize.md,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: c.line,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: Spacing.s16,
    marginBottom: Spacing.s8,
  },
  itemCardWrapper: {
    borderWidth: 1,
    overflow: "hidden",
    borderColor: c.line,
    borderRadius: Radius.card,
    backgroundColor: c.surfaceRaised,
  },
  itemCard: {
    gap: Spacing.s8,
    padding: Spacing.s16,
  },
  itemDivider: {
    borderTopWidth: 1,
    borderTopColor: c.lineSoft,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: { fontSize: FontSize.md, fontWeight: "600" },
  subtotalText: { color: Colors.text.secondary },
  removeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: Colors.background,
  },
  removeButtonText: {
    color: Colors.status.danger,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  inputsRow: { flexDirection: "row", gap: 12 },
  footer: {
    gap: Spacing.s8,
    borderTopWidth: 1,
    borderTopColor: c.line,
    paddingTop: Spacing.s20,
    paddingHorizontal: Spacing.s20,
    backgroundColor: c.surfaceRaised,
  },
});

export default ConfirmRestock;
