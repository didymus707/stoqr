import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/stores/auth";
import { Redirect, useRouter } from "expo-router";

export default function DashboardScreen() {
  const { session } = useAuth();

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good afternoon";
    return "Good Evening";
  };

  if (!session) {
    return <Redirect href="/" />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()} 👋</Text>
          <Text style={styles.name}>Adewale</Text>
        </View>
        <TouchableOpacity style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <SummaryCard label="Total Items" value="24" />
        <SummaryCard label="Low Stock" value="3" alert />
        <SummaryCard label="Out of Stock" value="1" danger />
      </View>

      <Text style={styles.sectionTitle}>Inventory</Text>

      <InventoryItem
        name="Whole Milk"
        quantity="2 litres"
        status="low"
        store="Lidl"
        price="£1.09"
      />
      <InventoryItem
        name="Chicken Breast"
        quantity="0 kg"
        status="out"
        store="Aldi"
        price="£2.15"
      />
      <InventoryItem
        name="Basmati Rice"
        quantity="1.5 kg"
        status="ok"
        store="Tesco"
        price="£2.50"
      />
      <InventoryItem
        name="Eggs"
        quantity="6 left"
        status="low"
        store="Sainsbury's"
        price="£1.79"
      />
    </ScrollView>
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

function InventoryItem({
  name,
  quantity,
  status,
  store,
  price,
}: {
  name: string;
  quantity: string;
  status: "ok" | "low" | "out";
  store: string;
  price: string;
}) {
  const statusColor =
    status === "out"
      ? Colors.status.danger
      : status === "low"
        ? Colors.status.warning
        : Colors.status.success;

  const statusLabel =
    status === "out"
      ? "Out of stock"
      : status === "low"
        ? "Low stock"
        : "In stock";

  return (
    <TouchableOpacity style={styles.inventoryItem}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemName}>{name}</Text>
        <Text style={styles.itemQuantity}>{quantity}</Text>
      </View>
      <View style={styles.itemRight}>
        <View
          style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
        <Text style={styles.itemStore}>
          {store} · {price}
        </Text>
      </View>
    </TouchableOpacity>
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
    color: Colors.text.primary,
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
});
