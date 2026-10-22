import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useBudget } from "@/hooks/useBudget";

const c = Colors.light;
const SEGMENT_COLOURS = [c.chart1, c.chart2, c.chart3, c.chart4];

const money = (n: number) => `£${n.toFixed(2)}`;

export default function BudgetSnapshot() {
  const { budget, loading, error } = useBudget();
  const [showTop, setShowTop] = useState(false);

  if (
    loading ||
    error ||
    !budget ||
    !budget.total_value ||
    budget.item_count === 0
  ) {
    return null;
  }

  const total = budget.total_value;

  // Up to three shops, then everything else as "Other".
  const stores = [...(budget.store_breakdown ?? [])].sort(
    (a, b) => b.store_total - a.store_total,
  );
  const segments = stores
    .slice(0, 3)
    .map((s) => ({ label: s.store || "No shop", value: s.store_total }));
  const rest = stores.slice(3).reduce((sum, s) => sum + s.store_total, 0);
  if (rest > 0) segments.push({ label: "Other", value: rest });

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text variant="bodySm" color={c.inkMuted}>
          What's in your cupboard is worth
        </Text>
        <Text variant="numberLg">{money(total)}</Text>
        <Text variant="bodySm" color={c.inkMuted}>
          across {budget.item_count} priced{" "}
          {budget.item_count === 1 ? "item" : "items"}
        </Text>
      </View>

      {segments.length > 0 ? (
        <>
          <View
            style={styles.bar}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {segments.map((s, i) => (
              <View
                key={s.label}
                style={{
                  flex: s.value / total,
                  backgroundColor: SEGMENT_COLOURS[i % SEGMENT_COLOURS.length],
                }}
              />
            ))}
          </View>

          <View style={styles.legend}>
            {segments.map((s, i) => (
              <View key={s.label} style={styles.legendItem}>
                <View
                  style={[
                    styles.swatch,
                    {
                      backgroundColor:
                        SEGMENT_COLOURS[i % SEGMENT_COLOURS.length],
                    },
                    i === 3 && styles.swatchOutlined,
                  ]}
                />
                <Text variant="bodySm" numberOfLines={1} style={styles.flex}>
                  {s.label}
                </Text>
                <Text variant="code">{money(s.value)}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}

      {budget.top_items?.length ? (
        <>
          <Button
            label={showTop ? "Hide top items" : "Show top items"}
            size="sm"
            variant="ghost"
            onPress={() => setShowTop((v) => !v)}
            style={styles.toggle}
          />
          {showTop ? (
            <View style={styles.topList}>
              {budget.top_items.map((item, index) => (
                <View
                  key={`${item.name}-${index}`}
                  style={[styles.topRow, index > 0 && styles.divider]}
                >
                  <Text variant="code" color={c.inkMuted}>
                    {String(index + 1).padStart(2, "0")}
                  </Text>
                  <Text variant="bodySm" numberOfLines={1} style={styles.flex}>
                    {item.name}
                  </Text>
                  <Text variant="code">{money(item.item_value)}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  card: {
    backgroundColor: c.surfaceRaised,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: Radius.hero,
    padding: Spacing.s20,
    gap: Spacing.s16,
  },
  head: { gap: Spacing.s4 },
  bar: {
    flexDirection: "row",
    gap: 2,
    height: 14,
    borderRadius: 7,
    overflow: "hidden",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
    columnGap: Spacing.s16,
  },
  legendItem: {
    width: "46%",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s8,
  },
  swatch: { width: 10, height: 10, borderRadius: 3 },
  swatchOutlined: { borderWidth: 1, borderColor: c.lineStrong },
  toggle: { alignSelf: "flex-start", marginLeft: -Spacing.s12 },
  topList: { marginTop: -Spacing.s8 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s12,
    paddingVertical: 10,
  },
  divider: { borderTopWidth: 1, borderTopColor: c.lineSoft },
});
