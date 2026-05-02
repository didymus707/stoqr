import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/stores/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme";

const UNITS = [
  "pc",
  "kg",
  "g",
  "litre",
  "ml",
  "can",
  "bottle",
  "bag",
  "box",
  "loaf",
];

const AddItemScreen = () => {
  const router = useRouter();
  const { session } = useAuth();

  const [name, setName] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [store, setStore] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState("1");
  const insets = useSafeAreaInsets();

  const [errors, setErrors] = useState({
    name: "",
    quantity: "",
    form: "",
  });

  const calculateStatus = (
    qty: number,
    thresh: number,
  ): "ok" | "low" | "out" => {
    if (qty <= 0) return "out";
    if (qty <= thresh) return "low";
    return "ok";
  };

  const handleAddItem = async () => {
    const newErrors = { name: "", quantity: "", form: "" };

    if (!name.trim()) {
      newErrors.name = "Item name is required";
    }

    const parsedQty = parseFloat(quantity);
    if (isNaN(parsedQty) || parsedQty < 0) {
      newErrors.quantity = "Please enter a valid quantity";
    }

    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);

    try {
      // First get or create the user's default inventory
      let { data: inventories, error: invError } = await supabase
        .from("inventories")
        .select("id")
        .eq("user_id", session!.user.id)
        .limit(1);

      if (invError) throw invError;

      let inventoryId: string;

      if (!inventories || inventories.length === 0) {
        // Create a default inventory for this user
        const { data: newInv, error: createError } = await supabase
          .from("inventories")
          .insert({
            user_id: session!.user.id,
            name: "My Inventory",
          })
          .select("id")
          .single();

        if (createError) throw createError;
        inventoryId = newInv.id;
      } else {
        inventoryId = inventories[0].id;
      }

      const parsedThreshold = parseFloat(threshold) || 1;
      const parsedPrice = price ? parseFloat(price) : null;
      const status = calculateStatus(parsedQty, parsedThreshold);

      const { error: itemError } = await supabase.from("items").insert({
        inventory_id: inventoryId,
        name: name.trim(),
        quantity: parsedQty,
        unit: unit,
        low_stock_threshold: parsedThreshold,
        status,
        store: store.trim() || null,
        price: parsedPrice,
      });

      if (itemError) throw itemError;

      router.back();
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, form: err.message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add Item</Text>
          <TouchableOpacity onPress={handleAddItem} disabled={loading}>
            {loading ? (
              <ActivityIndicator size={16} color={Colors.primary} />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Item Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Whole Milk"
              placeholderTextColor={Colors.text.muted}
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors((prev) => ({ ...prev, name: "" }));
              }}
              autoCapitalize="words"
              autoFocus
            />
            {errors.name ? (
              <Text style={styles.errorText}>{errors.name}</Text>
            ) : null}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Quantity *</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                placeholderTextColor={Colors.text.muted}
                value={quantity}
                onChangeText={(text) => {
                  setQuantity(text);
                  setErrors((prev) => ({ ...prev, quantity: "" }));
                }}
                keyboardType="numeric"
              />
              {errors.quantity ? (
                <Text style={styles.errorText}>{errors.quantity}</Text>
              ) : null}
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Unit</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.unitScroll}
              >
                {UNITS.map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[
                      styles.unitChip,
                      unit === u && styles.unitChipActive,
                    ]}
                    onPress={() => setUnit(u)}
                  >
                    <Text
                      style={[
                        styles.unitChipText,
                        unit === u && styles.unitChipTextActive,
                      ]}
                    >
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Alert me when below</Text>
            <TextInput
              style={styles.input}
              placeholder="1"
              placeholderTextColor={Colors.text.muted}
              value={threshold}
              onChangeText={setThreshold}
              keyboardType="numeric"
            />
            <Text style={styles.hint}>
              We'll alert you when quantity drops to this level
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store & Price (optional)</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Store</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Lidl, Tesco, Aldi"
              placeholderTextColor={Colors.text.muted}
              value={store}
              onChangeText={setStore}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price (£)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={Colors.text.muted}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {errors.form ? (
          <Text style={styles.errorText}>{errors.form}</Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  cancelText: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
  },
  saveText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "500",
    color: Colors.text.primary,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  unitScroll: {
    flexDirection: "row",
  },
  unitChip: {
    width: 56,
    height: 56,
    borderWidth: 1,
    alignItems: "center",
    marginRight: Spacing.sm,
    justifyContent: "center",
    borderColor: Colors.border,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
  },
  unitChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  unitChipText: {
    textAlign: "center",
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  unitChipTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  hint: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.status.danger,
    marginTop: Spacing.xs,
  },
});

export default AddItemScreen;
