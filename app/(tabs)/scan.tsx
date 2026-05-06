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
} from "react-native";
import { Item } from "@/types/database";
import { useRouter } from "expo-router";
import { useShoppingList } from "@/hooks/useShoppingList";
import { SafeAreaView } from "react-native-safe-area-context";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme";
import { useShoppingSession } from "@/stores/shopping-session";

export default function ShoppingListScreen() {
  const router = useRouter();
  const {
    lowStockItems,
    manualItems,
    loading,
    error,
    addManualItem,
    removeManualItem,
    restockItem,
  } = useShoppingList();
  const [newItemName, setNewItemName] = useState("");
  const [showCustomStore, setShowCustomStore] = useState<boolean>(false);
  const [customStoreName, setCustomStoreName] = useState("");
  const { showActionSheetWithOptions } = useActionSheet();
  const { activeStore, setActiveStore } = useShoppingSession();

  const handleAddManualItem = () => {
    if (!newItemName.trim()) return;
    addManualItem(newItemName);
    setNewItemName("");
  };

  const handleStartShoppingSession = () => {
    const commonStores = [
      "Aldi",
      "Lidl",
      "Tesco",
      "Asda",
      "Sainsbury's",
      "Morrisons",
    ];

    showActionSheetWithOptions(
      {
        options: [...commonStores, "Other", "Cancel"],
        cancelButtonIndex: commonStores.length + 1,
        title: "Which store are you in?",
      },
      (selectedIndex) => {
        if (selectedIndex === undefined) return;
        if (selectedIndex === commonStores.length + 1) return; // Cancel

        if (selectedIndex === commonStores.length) {
          // Other — show a text input alert
          setShowCustomStore(true);
        } else {
          setActiveStore(commonStores[selectedIndex]);
        }
      },
    );
  };

  const handleRestockItem = async (item: Item) => {
    Alert.alert(
      `Bought ${item.name}?`,
      "This will mark it as restocked in your inventory.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, restocked",
          onPress: async () => {
            try {
              await restockItem(item);
            } catch (err: any) {
              Alert.alert("Error", err.message);
            }
          },
        },
      ],
    );
  };

  const handleTickManualItem = (id: string, name: string) => {
    Alert.alert(
      `Bought ${name}?`,
      "Would you like to add it to your inventory?",
      [
        {
          text: "No, just remove",
          style: "cancel",
          onPress: () => removeManualItem(id),
        },
        {
          text: "Add to inventory",
          onPress: () => {
            removeManualItem(id);
            const params = new URLSearchParams({ name });
            if (activeStore) params.append("store", activeStore);
            router.push(`/add-item?name=${encodeURIComponent(name)}`);
          },
        },
      ],
    );
  };

  const totalItems = lowStockItems.length + manualItems.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping List</Text>
        {totalItems > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalItems}</Text>
          </View>
        )}
        <View style={{ marginLeft: "auto" }}>
          {!activeStore && (
            <TouchableOpacity
              style={styles.sessionButton}
              onPress={() => handleStartShoppingSession()}
            >
              <Text style={styles.sessionButtonText}>📍 At a store?</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {activeStore && (
        <View style={styles.storeBanner}>
          <Text style={styles.storeBannerText}>
            📍 Shopping at {activeStore}
          </Text>
          <TouchableOpacity onPress={() => setActiveStore(null)}>
            <Text style={styles.storeBannerClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {showCustomStore && (
        <View style={styles.customStoreContainer}>
          <TextInput
            style={styles.customStoreInput}
            placeholder="Enter store name..."
            placeholderTextColor={Colors.text.muted}
            value={customStoreName}
            onChangeText={setCustomStoreName}
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={() => {
              if (customStoreName.trim()) {
                setActiveStore(customStoreName.trim());
                setCustomStoreName("");
                setShowCustomStore(false);
              }
            }}
          />
          <TouchableOpacity
            style={styles.customStoreButton}
            onPress={() => {
              if (customStoreName.trim()) {
                setActiveStore(customStoreName.trim());
                setCustomStoreName("");
                setShowCustomStore(false);
              }
            }}
          >
            <Text style={styles.customStoreButtonText}>Set</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setShowCustomStore(false);
              setCustomStoreName("");
            }}
          >
            <Text style={styles.storeBannerClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.addContainer}>
        <TextInput
          style={styles.addInput}
          placeholder="Add an item..."
          placeholderTextColor={Colors.text.muted}
          value={newItemName}
          onChangeText={setNewItemName}
          onSubmitEditing={handleAddManualItem}
          returnKeyType="done"
          autoCapitalize="words"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddManualItem}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size={32} color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : totalItems === 0 ? (
        <View style={styles.centeredContainer}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your list is empty</Text>
          <Text style={styles.emptySubtitle}>
            Low stock items appear here automatically.{"\n"}
            Or add items above for your next shop.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {lowStockItems.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>
                Needs restocking ({lowStockItems.length})
              </Text>
              {lowStockItems.map((item) => (
                <LowStockRow
                  key={item.id}
                  item={item}
                  onRestock={() => handleRestockItem(item)}
                />
              ))}
            </View>
          )}

          {manualItems.length > 0 && (
            <View
              style={{ marginTop: lowStockItems.length > 0 ? Spacing.lg : 0 }}
            >
              <Text style={styles.sectionTitle}>
                My list ({manualItems.length})
              </Text>
              {manualItems.map((item) => (
                <ManualItemRow
                  key={item.id}
                  name={item.name}
                  checked={item.checked}
                  onTick={() => handleTickManualItem(item.id, item.name)}
                  onRemove={() => removeManualItem(item.id)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const LowStockRow = ({
  item,
  onRestock,
}: {
  item: Item;
  onRestock: () => void;
}) => {
  const isOut = item.status === "out";
  const statusColor = isOut ? Colors.status.danger : Colors.status.warning;

  return (
    <TouchableOpacity style={styles.itemRow} onPress={onRestock}>
      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemMeta}>
          {isOut
            ? "Out of stock"
            : `Low — ${item.quantity} ${item.unit ?? ""} left`}
          {item.store ? ` · ${item.store}` : ""}
          {item.price ? ` · £${item.price.toFixed(2)}` : ""}
        </Text>
      </View>
      <Text style={styles.checkAction}>✓ Got it</Text>
    </TouchableOpacity>
  );
};

const ManualItemRow = ({
  name,
  checked,
  onTick,
  onRemove,
}: {
  name: string;
  checked: boolean;
  onTick: () => void;
  onRemove: () => void;
}) => {
  return (
    <View style={styles.itemRow}>
      <TouchableOpacity
        style={[styles.checkbox, checked && styles.checkboxChecked]}
        onPress={onTick}
      >
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      <Text style={[styles.itemName, checked && styles.itemNameChecked]}>
        {name}
      </Text>
      <TouchableOpacity onPress={onRemove}>
        <Text style={styles.removeText}>✕</Text>
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
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
  addContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  addInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: FontSize.sm,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
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
    fontWeight: "500",
    color: Colors.text.primary,
  },
  itemNameChecked: {
    textDecorationLine: "line-through",
    color: Colors.text.muted,
  },
  itemMeta: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    marginTop: 2,
  },
  checkAction: {
    fontSize: FontSize.sm,
    color: Colors.status.success,
    fontWeight: "600",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: "#ffffff",
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
  removeText: {
    fontSize: FontSize.sm,
    color: Colors.text.muted,
    padding: Spacing.xs,
  },
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
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
    lineHeight: 20,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.status.danger,
  },
  storeBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.primary + "15",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  storeBannerText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: "500",
  },
  storeBannerClose: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: "600",
  },
  sessionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  sessionButtonText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  customStoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  customStoreInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  customStoreButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  customStoreButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: FontSize.sm,
  },
});
