import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { supabase } from "@/lib/supabase";
import { useInventory } from "@/hooks/useInventory";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors, FontSize, Spacing, Radius } from "@/constants/theme";
import {
  formToItemFields,
  ItemForm,
  ItemFormErrors,
  ItemFormValues,
  itemToForm,
  validateItemForm,
} from "@/components/items/ItemForm";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { Item } from "@/types/database";

const c = Colors.light;

const EditItemScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items } = useInventory();

  const item = items.find((item) => item.id === id);

  const [values, setValues] = useState<ItemFormValues | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<ItemFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data, error }) => {
          if (error || !data)
            setLoadError("Couldn't load this item. Go back and try again.");
          else setValues(itemToForm(data as Item));
        });
    }
  }, [id]);

  const update = (patch: Partial<ItemFormValues>) => {
    setValues((prev) => (prev ? { ...prev, ...patch } : prev));
    setErrors({});
  };

  const handleSave = async () => {
    if (!values || saving) return;
    const found = validateItemForm(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    setFormError(null);

    try {
      const { error } = await supabase
        .from("items")
        .update(formToItemFields(values))
        .eq("id", id);

      if (error) throw error;
      router.back();
    } catch {
      setFormError(
        "Couldn't save your changes. Check your connection and try again",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!values) {
    return (
      <Screen compact title="Edit Item">
        {loadError ? (
          <Text variant="bodySm" color={c.accentText}>
            {loadError}
          </Text>
        ) : (
          <View style={{ paddingVertical: 48 }}>
            <ActivityIndicator color={c.accent} />
          </View>
        )}
      </Screen>
    );
  }

  return (
    <Screen
      compact
      title="Edit Item"
      footer={
        <>
          {formError ? (
            <Text
              variant="caption"
              color={c.accentText}
              style={{ textAlign: "center" }}
            >
              {formError}
            </Text>
          ) : null}
        </>
      }
    >
      <ItemForm values={values} onChange={update} errors={errors} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: Spacing.s48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.s24,
    paddingVertical: Spacing.s12,
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
    paddingHorizontal: Spacing.s24,
    paddingTop: Spacing.s24,
    gap: Spacing.s12,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputGroup: {
    gap: Spacing.s4,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "500",
    color: Colors.text.primary,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.s12,
    fontSize: FontSize.md,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.s12,
  },
  unitScroll: {
    flexDirection: "row",
  },
  unitChip: {
    width: 56,
    height: 56,
    borderWidth: 1,
    alignItems: "center",
    marginRight: Spacing.s8,
    justifyContent: "center",
    borderColor: Colors.border,
    paddingVertical: Spacing.s8,
    paddingHorizontal: Spacing.s12,
    borderRadius: Radius.pill,
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
    marginTop: Spacing.s4,
  },
  priceModeToggle: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 3,
    marginBottom: Spacing.s4,
  },
  priceModeButton: {
    flex: 1,
    paddingVertical: Spacing.s4,
    alignItems: "center",
    borderRadius: Radius.sm,
  },
  priceModeButtonActive: {
    backgroundColor: Colors.primary,
  },
  priceModeText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  priceModeTextActive: {
    color: "#ffffff",
  },
});

export default EditItemScreen;
