import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
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
import { Button } from "@/components/ui/Button";

const c = Colors.light;

const EditItemScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [values, setValues] = useState<ItemFormValues | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<ItemFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
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
      title="Edit item"
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
          <Button
            label={saving ? "Saving…" : "Save changes"}
            disabled={saving}
            onPress={handleSave}
          />
        </>
      }
    >
      <ItemForm values={values} onChange={update} errors={errors} />
    </Screen>
  );
};

export default EditItemScreen;
