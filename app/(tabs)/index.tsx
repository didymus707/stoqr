import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useEffect } from "react";
import { Item } from "@/types/database";
import { useRouter, Redirect } from "expo-router";
import { useAuth } from "@/stores/auth";
import { useInventory } from "@/hooks/useInventory";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const { showActionSheetWithOptions } = useActionSheet();
  const { items, stats, loading, error, refetch } = useInventory();

  const fullName = session?.user?.user_metadata?.full_name ?? "there";
  const firstName = fullName.split(" ")[0];

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const handleAvatarPress = () => {
    const options = ["Proile & Settings", "Sign Out", "Cancel"];
    const destructiveButtonIndex = 1;
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
        title: firstName,
        message: session?.user?.email ?? "",
      },
      (selectedIndex) => {
        switch (selectedIndex) {
          case 0:
            router.push("/(tabs)/inventory");
            break;
          case 1:
            signOut();
            break;
          case 2:
            break;
        }
      },
    );
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Something went wrong</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()} 👋</Text>
          <Text style={styles.name}>{firstName}</Text>
        </View>
        <TouchableOpacity style={styles.avatar} onPress={handleAvatarPress}>
          <Text style={styles.avatarText}>
            {firstName.charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <SummaryCard label="Total Items" value={String(stats.total)} />
        <SummaryCard label="Low Stock" value={String(stats.low)} alert />
        <SummaryCard label="Out of Stock" value={String(stats.out)} danger />
      </View>

      <Text style={styles.sectionTitle}>Inventory</Text>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📦</Text>
          <Text style={styles.emptyTitle}>No items yet</Text>
          <Text style={styles.emptySubtitle}>
            Add your first item to start tracking your inventory
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/(tabs)/inventory")}
          >
            <Text style={styles.addButtonText}>Add your first item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        items.map((item) => <InventoryItem key={item.id} item={item} />)
      )}
    </ScrollView>
  );
}

function InventoryItem({ item }: { item: Item }) {
  const statusColor =
    item.status === "out"
      ? Colors.status.danger
      : item.status === "low"
        ? Colors.status.warning
        : Colors.status.success;

  const statusLabel =
    item.status === "out"
      ? "Out of stock"
      : item.status === "low"
        ? "Low stock"
        : "In stock";

  return (
    <TouchableOpacity style={styles.inventoryItem}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemQuantity}>
          {item.quantity} {item.unit ?? ""}
        </Text>
      </View>
      <View style={styles.itemRight}>
        <View
          style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
        {item.store && (
          <Text style={styles.itemStore}>
            {item.store}
            {item.price ? ` · £${item.price.toFixed(2)}` : ""}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function SummaryCard({
  label,
  value,
  alert,
  danger,
}: {
  label: string;
  value: string;
  alert?: boolean;
  danger?: boolean;
}) {
  const valueColor = danger
    ? Colors.status.danger
    : alert
      ? Colors.status.warning
      : Colors.text.primary;

  return (
    <View style={styles.summaryCard}>
      <Text style={[styles.summaryValue, { color: valueColor }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function DashboardSkeleton() {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.skeletonBlock,
          { width: "40%", height: 20, marginBottom: 8 },
        ]}
      />
      <View
        style={[
          styles.skeletonBlock,
          { width: "60%", height: 32, marginBottom: 24 },
        ]}
      />
      <View style={styles.summaryRow}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.summaryCard, styles.skeletonBlock]} />
        ))}
      </View>
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={[styles.skeletonBlock, { height: 72, marginBottom: 8 }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  name: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: FontSize.md,
  },
  summaryRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: FontSize.xl,
    fontWeight: "700",
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  inventoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  itemQuantity: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  itemRight: {
    alignItems: "flex-end",
    gap: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  itemStore: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: FontSize.sm,
  },
  skeletonBlock: {
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.md,
  },
  errorText: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
