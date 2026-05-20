import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useBudget } from "@/hooks/useBudget";
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme";

export default function BudgetSnapshot() {
  const { budget, loading, error } = useBudget();
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size={16} color={Colors.primary} />
      </View>
    );
  }

  if (error || !budget || budget.total_value === null) {
    return null;
  }

  const { store_breakdown } = budget;
  const maxStoreTotal = store_breakdown?.[0]?.store_total ?? 1;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerEmoji}>💰</Text>
          <View>
            <Text style={styles.headerTitle}>Inventory Value</Text>
            <Text style={styles.headerSubtitle}>
              {budget.item_count} priced{" "}
              {budget.item_count === 1 ? "item" : "items"}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.totalValue}>
            £{(budget.total_value ?? 0).toFixed(2)}
          </Text>
          <Text style={styles.expandIcon}>{expanded ? "▲" : "▼"}</Text>
        </View>
      </View>

      {expanded && (
        <View style={styles.details}>
          {budget.store_breakdown && budget.store_breakdown.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>By Store</Text>
              {budget.store_breakdown.map((store) => (
                <View key={store.store} style={styles.storeRow}>
                  <Text style={styles.storeName}>{store.store}</Text>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          width: `${(store.store_total / maxStoreTotal) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.storeTotal}>
                    £{store.store_total.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {budget.top_items && budget.top_items.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Most Valuable Items</Text>
              {budget.top_items.map((item, index) => (
                <View key={index} style={styles.topItemRow}>
                  <View style={styles.topItemRank}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.topItemInfo}>
                    <Text style={styles.topItemName}>{item.name}</Text>
                    <Text style={styles.topItemMeta}>
                      {item.quantity} {item.unit ?? ""}
                      {item.store ? ` · ${item.store}` : ""}
                      {` · £${item.price.toFixed(2)} each`}
                    </Text>
                  </View>
                  <Text style={styles.topItemValue}>
                    £{item.item_value.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Based on current inventory quantities and prices
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  headerEmoji: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  totalValue: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.primary,
  },
  expandIcon: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
  },
  details: {
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  storeName: {
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    width: 80,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  storeTotal: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text.primary,
    width: 55,
    textAlign: "right",
  },
  topItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  topItemRank: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
  topItemInfo: {
    flex: 1,
  },
  topItemName: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  topItemMeta: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    marginTop: 2,
  },
  topItemValue: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  footer: {
    paddingTop: Spacing.xs,
  },
  footerText: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    textAlign: "center",
  },
});
