import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Item } from "@/types/database";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useInventory } from "@/hooks/useInventory";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme";
import { useActionSheet } from "@expo/react-native-action-sheet";

type FilterStatus = "all" | "ok" | "low" | "out";

export default function InventoryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const { items, loading, refetch, updateQuantity } = useInventory();
  const { showActionSheetWithOptions } = useActionSheet();

  const handleMoreOptions = (item: Item) => {
    showActionSheetWithOptions(
      {
        options: ["Edit", "Delete", "Cancel"],
        destructiveButtonIndex: 1,
        cancelButtonIndex: 2,
        title: item.name,
      },
      (selectedIndex) => {
        switch (selectedIndex) {
          case 0:
            router.push(`/edit-item?id=${item.id}`);
            break;
          case 1:
            handleDelete(item);
            break;
        }
      },
    );
  };

  const filtered = items
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    .filter((item) => (filter === "all" ? true : item.status === filter));

  async function handleDelete(item: Item) {
    Alert.alert(`Delete ${item.name}?`, "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("items")
            .delete()
            .eq("id", item.id);

          if (error) {
            Alert.alert("Error", error.message);
            return;
          }

          refetch();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/add-item")}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          placeholderTextColor={Colors.text.muted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.filterRow}>
        {(["all", "ok", "low", "out"] as FilterStatus[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === f && styles.filterChipTextActive,
              ]}
            >
              {f === "all"
                ? "All"
                : f === "ok"
                  ? "In stock"
                  : f === "low"
                    ? "Low stock"
                    : "Out of stock"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centeredContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centeredContainer}>
          <Text style={styles.emptyEmoji}>📦</Text>
          <Text style={styles.emptyTitle}>
            {search ? "No items found" : "No items yet"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {search
              ? `No results for "${search}"`
              : "Tap + to add your first item"}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filtered.map((item) => (
            <InventoryItemRow
              key={item.id}
              item={item}
              onEdit={() => router.push(`/edit-item?id=${item.id}`)}
              onMoreOptions={() => handleMoreOptions(item)}
              onUpdateQuantity={(newQty) => updateQuantity(item.id, newQty)}
            />
          ))}
          <Text style={styles.itemCount}>
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const InventoryItemRow = ({
  item,
  onUpdateQuantity,
  onMoreOptions,
  onEdit,
}: {
  item: Item;
  onUpdateQuantity: (newQty: number) => void;
  onMoreOptions: () => void;
  onEdit: () => void;
}) => {
  const statusColor =
    item.status === "out"
      ? Colors.status.danger
      : item.status === "low"
        ? Colors.status.warning
        : Colors.status.success;

  const handleDecrement = () => {
    if (item.quantity <= 0) return;
    onUpdateQuantity(item.quantity - 1);
  };

  const handleIncrement = () => {
    onUpdateQuantity(item.quantity + 1);
  };

  return (
    <View style={styles.itemRow}>
      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />

      <TouchableOpacity style={styles.itemInfo} onLongPress={onEdit}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemMeta}>
          {item.quantity}
          {item.unit ? ` ${item.unit}` : ""}
          {item.store ? ` · ${item.store}` : ""}
          {item.price ? ` · £${item.price.toFixed(2)}` : ""}
        </Text>
      </TouchableOpacity>

      <View style={styles.qtyGroup}>
        <TouchableOpacity
          style={[
            styles.qtyButton,
            item.quantity <= 0 && styles.qtyButtonDisabled,
          ]}
          onPress={handleDecrement}
          disabled={item.quantity <= 0}
        >
          <Text style={styles.qtyButtonText}>−</Text>
        </TouchableOpacity>

        <Text style={styles.qtyValue}>{item.quantity}</Text>

        <TouchableOpacity style={styles.qtyButton} onPress={handleIncrement}>
          <Text style={styles.qtyButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.moreButton} onPress={onMoreOptions}>
        <Text style={styles.moreButtonText}>⋯</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    fontSize: FontSize.xl,
    color: "#ffffff",
    fontWeight: "300",
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#ffffff",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  itemMeta: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    marginTop: 2,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  statusPill: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusPillText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  actionButton: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  actionButtonText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: "500",
  },
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.text.muted,
  },
  emptyEmoji: {
    fontSize: 40,
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
  },
  itemCount: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    textAlign: "center",
    paddingTop: Spacing.md,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  qtyGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 4,
  },
  // qtyButton: {
  //   width: 32,
  //   height: 32,
  //   borderRadius: BorderRadius.full,
  //   backgroundColor: Colors.surface,
  //   borderWidth: 1,
  //   borderColor: Colors.border,
  //   alignItems: "center",
  //   justifyContent: "center",
  // },
  qtyButton: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonDisabled: {
    opacity: 0.3,
  },
  qtyButtonText: {
    fontSize: FontSize.md,
    color: Colors.text.primary,
    fontWeight: "500",
    lineHeight: 16,
  },
  qtyValue: {
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    fontWeight: "600",
    minWidth: 20,
    textAlign: "center",
  },
  moreButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  moreButtonText: {
    fontSize: FontSize.md,
    color: Colors.text.muted,
    fontWeight: "600",
  },
});
