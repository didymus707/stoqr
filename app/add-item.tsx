import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/stores/auth";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useShoppingSession } from "@/stores/shopping-session";
import { Colors } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  emptyItemForm,
  formToItemFields,
  ItemForm,
  ItemFormErrors,
  ItemFormValues,
  validateItemForm,
} from "@/components/items/ItemForm";
import { getOrCreateInventory } from "@/lib/setup";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { unitLabel } from "@/lib/unit";

const c = Colors.light;

const AddItemScreen = () => {
  const router = useRouter();
  const { session } = useAuth();
  const { activeStore } = useShoppingSession();
  const params = useLocalSearchParams<{
    name?: string;
    store?: string;
    manualItemId?: string;
  }>();

  const [values, setValues] = useState<ItemFormValues>(() =>
    emptyItemForm({
      name: params.name ?? "",
      store: params.store ?? activeStore ?? "",
    }),
  );
  const [errors, setErrors] = useState<ItemFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const update = (patch: Partial<ItemFormValues>) => {
    setValues((prev) => ({ ...prev, ...patch }));
    setErrors({});
  };

  const handleAdd = async () => {
    const found = validateItemForm(values);
    setErrors(found);

    if (Object.keys(found).length > 0 || !session || saving) return;

    setSaving(true);
    setFormError(null);

    try {
      const inventoryId = await getOrCreateInventory(session.user.id);
      const { error } = await supabase
        .from("items")
        .insert({ inventory_id: inventoryId, ...formToItemFields(values) });
      if (error) throw error;

      if (params.manualItemId) {
        await AsyncStorage.setItem("completedManualItem", params.manualItemId);
      }
      router.back();
    } catch {
      setFormError(
        "Couldn't add this item. Check your connection and try again",
      );
    } finally {
      setSaving(false);
    }
  };

  const qty = Number(values.quantity) || 0;

  return (
    <Screen
      compact
      title="Add item"
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
            label={saving ? "Adding..." : "Add to cupboard"}
            value={`${qty} ${unitLabel(qty, values.unit)}`}
            disabled={saving}
            onPress={handleAdd}
          />
        </>
      }
    >
      <ItemForm
        values={values}
        onChange={update}
        errors={errors}
        autoFocusName={!params.name}
      />
    </Screen>
  );
};

export default AddItemScreen;
