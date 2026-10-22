import { Colors, Radius, Spacing } from "@/constants/theme";
import { perUnitText, unitLabel } from "@/lib/unit";
import { Item } from "@/types/database";
import { Stepper } from "../ui/Stepper";
import { TextField } from "../ui/TextField";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Field } from "../ui/Field";
import { Text } from "../ui/Text";
import { Button } from "../ui/Button";
import { ReactNode } from "react";

const c = Colors.light;

export const units = [
  "pc",
  "roll",
  "bar",
  "bottle",
  "can",
  "bag",
  "box",
  "loaf",
  "kg",
  "g",
  "litre",
  "ml",
];
const countableUnits = [
  "pc",
  "roll",
  "bar",
  "bottle",
  "can",
  "bag",
  "box",
  "loaf",
];

export type ItemFormValues = {
  name: string;
  unit: string;
  buyAs: "single" | "pack";
  packSize: number;
  packPrice: string;
  quantity: string;
  warnAt: string;
  store: string;
};

export type ItemFormErrors = Partial<
  Record<"name" | "quantity" | "packPrice", string>
>;

export const emptyItemForm = (
  overrides: Partial<ItemFormValues> = {},
): ItemFormValues => ({
  name: "",
  unit: "pc",
  buyAs: "single",
  packSize: 6,
  packPrice: "",
  quantity: "1",
  warnAt: "1",
  store: "",
  ...overrides,
});

export const itemToForm = (item: Item): ItemFormValues => {
  const packSize = item.pack_size || 1;
  const packPrice =
    item.pack_price ?? (item.price !== null ? item.price * packSize : null);
  return {
    name: item.name,
    unit: item.unit ?? "pc",
    buyAs: packSize > 1 ? "pack" : "single",
    packSize: packSize > 1 ? packSize : 6,
    packPrice: packPrice !== null ? String(packPrice) : "",
    quantity: String(item.quantity),
    warnAt: String(item.low_stock_threshold),
    store: item.store ?? "",
  };
};

const toNumber = (value: string) => {
  const num = Number(value.replace(",", "."));
  return value.trim() !== "" && Number.isFinite(num) ? num : null;
};

export const validateItemForm = (values: ItemFormValues): ItemFormErrors => {
  const errors: ItemFormErrors = {};
  if (!values.name.trim()) errors.name = "Give it a name";
  const qty = toNumber(values.quantity);
  if (qty === null || qty < 0) errors.quantity = "Enter how many you have";
  if (values.packPrice.trim() !== null) {
    const price = toNumber(values.packPrice);
    if (price === null || price < 0) errors.packPrice = "Enter a price pls";
  }
  return errors;
};

export const formToItemFields = (values: ItemFormValues) => {
  const size = values.buyAs === "pack" ? values.packSize : 1;
  const packPrice = toNumber(values.packPrice);
  const quantity = toNumber(values.quantity) ?? 0;
  const unitPrice = packPrice !== null ? packPrice / size : null;

  return {
    name: values.name.trim(),
    unit: values.unit,
    quantity,
    low_stock_threshold: toNumber(values.warnAt) ?? 0,
    store: values.store.trim() || null,
    pack_size: size,
    pack_price: packPrice,
    price: unitPrice,
    totalValue: unitPrice !== null ? unitPrice * quantity : null,
    price_mode: "per_unit",
  };
};

type Props = {
  values: ItemFormValues;
  onChange: (patch: Partial<ItemFormValues>) => void;
  errors?: ItemFormErrors;
  autoFocusName?: boolean;
};

export const ItemForm = ({
  values: v,
  onChange,
  errors = {},
  autoFocusName,
}: Props) => {
  const isPack = v.buyAs === "pack";
  const countable = countableUnits.includes(v.unit);
  const many = unitLabel(2, v.unit);
  const packPrice = toNumber(v.packPrice);

  const amount = (key: "quantity" | "warnAt", label: string) =>
    countable ? (
      <Stepper
        label={label}
        value={toNumber(v[key]) ?? 0}
        onChange={(n) => onChange({ [key]: String(n) })}
      />
    ) : (
      <TextField
        size="sm"
        mono
        value={v[key]}
        keyboardType="decimal-pad"
        onChange={(text) => onChange({ [key]: text })}
        containerStyle={styles.amountField}
        accessibilityLabel={label}
      />
    );

  return (
    <>
      <Field
        label="Name"
        required
        value={v.name}
        onChangeText={(name) => onChange({ name })}
        placeholder="e.g. Toilet roll"
        autoCapitalize="sentences"
        autoFocus={autoFocusName}
        error={errors.name}
      />

      <View style={styles.group}>
        <Text variant="label">What do you count it in?</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {units.map((u) => {
            const selected = v.unit === u;
            return (
              <Pressable
                key={u}
                onPress={() => onChange({ unit: u })}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text variant="label" color={selected ? c.onInverse : c.ink}>
                  {u}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.group}>
        <Text variant="label">How do you buy it?</Text>
        <View style={styles.segment}>
          <Button
            label="Single"
            size="sm"
            variant={isPack ? "outline" : "secondary"}
            onPress={() => onChange({ buyAs: "single" })}
            style={styles.flex}
          />
          <Button
            label="In a pack"
            size="sm"
            variant={isPack ? "secondary" : "outline"}
            onPress={() => onChange({ buyAs: "pack" })}
            style={styles.flex}
          />
        </View>
      </View>

      <View style={styles.card}>
        {isPack ? (
          <Row label={`${capitalise(many)} in a pack`}>
            <Stepper
              label={`${many} in a pack`}
              value={v.packSize}
              min={2}
              onChange={(packSize) => onChange({ packSize })}
            />
          </Row>
        ) : null}

        <Row
          first={!isPack}
          label={isPack ? "Price per pack" : `Price per ${v.unit}`}
          hint={
            errors.packPrice
              ? errors.packPrice
              : errors.packPrice === null
                ? "Optional"
                : isPack
                  ? packPrice !== null
                    ? (perUnitText(packPrice, v.packSize, v.unit) ?? undefined)
                    : undefined
                  : `Each ${v.unit}`
          }
          hintIsError={!!errors.packPrice}
        >
          <TextField
            size="sm"
            mono
            prefix="£"
            keyboardType="decimal-pad"
            placeholder="0.00"
            value={v.packPrice}
            onChangeText={(packPrice) => onChange({ packPrice })}
            invalid={!!errors.packPrice}
            containerStyle={styles.priceField}
            accessibilityLabel={
              isPack ? "Price per pack" : `Price per ${v.unit}`
            }
          />
        </Row>

        <Row
          label={`How many ${many} do you have?`}
          hint={errors.quantity}
          hintIsError={!!errors.quantity}
        >
          {amount("quantity", `Hjow many ${many}`)}
        </Row>

        <Row
          label="Warn me at"
          hint={
            (toNumber(v.warnAt) ?? 0) === 0
              ? "When it's out"
              : `When ${v.warnAt} ${unitLabel(toNumber(v.warnAt) ?? 0, v.unit)} are left`
          }
        >
          {amount("warnAt", "Warn me at")}
        </Row>
      </View>

      <Field
        label="Usual shop"
        icon="store"
        value={v.store}
        onChangeText={(store) => onChange({ store })}
        placeholder="e.g. Aldi"
        autoCapitalize="words"
        hint="Optional"
      />
    </>
  );
};

function Row({
  label,
  hint,
  hintIsError,
  first,
  children,
}: {
  label: string;
  hint?: string;
  hintIsError?: boolean;
  first?: boolean;
  children: ReactNode;
}) {
  return (
    <View style={[styles.row, !first && styles.rowDivider]}>
      <View style={styles.rowText}>
        <Text variant="item">{label}</Text>
        {hint ? (
          <Text
            variant="caption"
            color={hintIsError ? c.accentText : c.inkMuted}
          >
            {hint}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const styles = StyleSheet.create({
  flex: { flex: 1 },
  group: { gap: Spacing.s8 },
  chips: { gap: Spacing.s8 },
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: { backgroundColor: c.inverse, borderColor: c.inverse },
  segment: { flexDirection: "row", gap: Spacing.s8 },
  card: {
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
    gap: 10,
    paddingVertical: Spacing.s8,
    paddingLeft: Spacing.s16,
    paddingRight: Spacing.s8,
  },
  rowDivider: { borderTopWidth: 1, borderTopColor: c.lineSoft },
  rowText: { flex: 1, minWidth: 0, gap: 1 },
  priceField: { width: 120 },
  amountField: { width: 96 },
});
