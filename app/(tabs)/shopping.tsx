import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import ReanimatedSwipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { useActionSheet } from "@expo/react-native-action-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Text } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useShoppingSession } from "@/stores/shopping-session";

const c = Colors.light;
const COMMON_STORES = [
  "Aldi",
  "Lidl",
  "Tesco",
  "Asda",
  "Sainsbury's",
  "Morrisons",
];
const REMOVE_WIDTH = 96;

export default function ShoppingListScreen() {
  const router = useRouter();
  const { showActionSheetWithOptions } = useActionSheet();
  const {
    lowStockItems,
    manualItems,
    loading,
    error,
    addManualItem,
    removeManualItem,
  } = useShoppingList();
  const { activeStore, setActiveStore, checkedLowStock, setCheckedLowStock } =
    useShoppingSession();

  const [newItemName, setNewItemName] = useState("");
  const [customStoreName, setCustomStoreName] = useState("");
  const [showCustomStore, setShowCustomStore] = useState(false);
  const [dismissedLowStock, setDismissedLowStock] = useState<Set<string>>(
    new Set(),
  );

  const visibleLowStockItems = lowStockItems.filter(
    (i) => !dismissedLowStock.has(i.id),
  );
  const selectedIds = visibleLowStockItems
    .filter((i) => checkedLowStock.has(i.id))
    .map((i) => i.id);
  const totalItems = visibleLowStockItems.length + manualItems.length;

  // Remove any manual item that was added to the cupboard from the add-item screen
  useFocusEffect(
    useCallback(() => {
      const checkCompleted = async () => {
        const completedId = await AsyncStorage.getItem("completedManualItem");
        if (completedId) {
          removeManualItem(completedId);
          await AsyncStorage.removeItem("completedManualItem");
        }
      };
      checkCompleted();
    }, []),
  );

  const toggleLowStock = (id: string) =>
    setCheckedLowStock((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const dismissLowStock = (id: string) => {
    setDismissedLowStock((prev) => new Set(prev).add(id));
    setCheckedLowStock((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleAddManualItem = () => {
    if (!newItemName.trim()) return;
    addManualItem(newItemName);
    setNewItemName("");
  };

  const handleSetCustomStore = () => {
    if (!customStoreName.trim()) return;
    setActiveStore(customStoreName.trim());
    setCustomStoreName("");
    setShowCustomStore(false);
  };

  const handleChooseStore = () => {
    const options = [
      ...COMMON_STORES,
      "Other",
      ...(activeStore ? ["Not shopping"] : []),
      "Cancel",
    ];
    const otherIndex = COMMON_STORES.length;
    const notShoppingIndex = activeStore ? otherIndex + 1 : -1;
    const cancelIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: cancelIndex,
        destructiveButtonIndex: activeStore ? notShoppingIndex : undefined,
        title: "Which shop are you in?",
      },
      (index) => {
        if (index === undefined || index === cancelIndex) return;
        if (index === otherIndex) return setShowCustomStore(true);
        if (index === notShoppingIndex) return setActiveStore(null);
        setActiveStore(COMMON_STORES[index]);
      },
    );
  };

  const handleTickManualItem = (id: string, name: string) => {
    Alert.alert(
      `Bought ${name}?`,
      "Would you like to add it to your cupboard?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "No, just remove", onPress: () => removeManualItem(id) },
        {
          text: "Add to cupboard",
          onPress: () => {
            const params = new URLSearchParams({ name, manualItemId: id });
            if (activeStore) params.append("store", activeStore);
            router.push(`/add-item?${params.toString()}`);
          },
        },
      ],
    );
  };

  const handleRestock = () =>
    router.push(`/confirm-restock?ids=${selectedIds.join(",")}`);

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <View style={styles.header}>
        <Text variant="title">Shopping list</Text>
        {totalItems > 0 ? (
          <Text variant="bodySm" color={c.inkMuted}>
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </Text>
        ) : null}
      </View>

      <View style={styles.sessionArea}>
        {activeStore ? (
          <View style={styles.session}>
            <Icon name="store" size={22} color={c.accent} />
            <View style={styles.flexText}>
              <Text variant="caption" color={c.inkMuted}>
                Shopping at
              </Text>
              <Text variant="item">{activeStore}</Text>
            </View>
            <Button
              label="Change"
              size="sm"
              variant="outline"
              onPress={handleChooseStore}
            />
          </View>
        ) : (
          <Button
            label="Which shop are you in?"
            size="sm"
            variant="outline"
            onPress={handleChooseStore}
            style={{ alignSelf: "flex-start" }}
          />
        )}

        {showCustomStore ? (
          <View style={styles.inlineRow}>
            <TextField
              icon="store"
              containerStyle={{ flex: 1 }}
              placeholder="Shop name"
              value={customStoreName}
              onChangeText={setCustomStoreName}
              onSubmitEditing={handleSetCustomStore}
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
              accessibilityLabel="Shop name"
            />
            <Button
              label="Set"
              size="sm"
              variant="secondary"
              onPress={handleSetCustomStore}
            />
            <IconButton
              icon="close"
              label="Cancel"
              variant="ghost"
              iconSize={20}
              onPress={() => {
                setShowCustomStore(false);
                setCustomStoreName("");
              }}
            />
          </View>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={c.accent} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text variant="bodySm" color={c.accentText} style={styles.centerText}>
            {error}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            selectedIds.length > 0 && styles.listContentWithFooter,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {totalItems === 0 ? (
            <View style={styles.empty}>
              <Text variant="heading">Your list is empty</Text>
              <Text
                variant="bodySm"
                color={c.inkMuted}
                style={styles.centerText}
              >
                Items that run low appear here automatically. You can also add
                things below.
              </Text>
            </View>
          ) : null}

          {visibleLowStockItems.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHead}>
                <Text variant="overline" color={c.inkMuted}>
                  From your cupboard
                </Text>
                <View style={styles.autoPill}>
                  <Text variant="pill" color={c.accentText}>
                    Auto
                  </Text>
                </View>
              </View>
              <View style={styles.card}>
                {visibleLowStockItems.map((item, index) => (
                  <ShoppingRow
                    key={item.id}
                    first={index === 0}
                    name={item.name}
                    detail={
                      item.status === "out" ? "Out" : `${item.quantity} left`
                    }
                    price={item.price}
                    checked={checkedLowStock.has(item.id)}
                    onToggle={() => toggleLowStock(item.id)}
                    onRemove={() => dismissLowStock(item.id)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {manualItems.length > 0 ? (
            <View style={styles.section}>
              <Text variant="overline" color={c.inkMuted}>
                Added by you
              </Text>
              <View style={styles.card}>
                {manualItems.map((item, index) => (
                  <ShoppingRow
                    key={item.id}
                    first={index === 0}
                    name={item.name}
                    price={null}
                    checked={item.checked}
                    onToggle={() => handleTickManualItem(item.id, item.name)}
                    onRemove={() => removeManualItem(item.id)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.inlineRow}>
            <TextField
              containerStyle={styles.addField}
              placeholder="Add something else…"
              value={newItemName}
              onChangeText={setNewItemName}
              onSubmitEditing={handleAddManualItem}
              returnKeyType="done"
              autoCapitalize="words"
              accessibilityLabel="Add an item to your list"
            />
            <Button
              label="Add"
              size="sm"
              variant="secondary"
              onPress={handleAddManualItem}
            />
          </View>
        </ScrollView>
      )}

      {selectedIds.length > 0 ? (
        <View style={styles.footer}>
          <Button
            label={`Restock ${selectedIds.length} ${selectedIds.length === 1 ? "item" : "items"}`}
            onPress={handleRestock}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

type RowProps = {
  name: string;
  detail?: string;
  price: number | null;
  checked: boolean;
  first: boolean;
  onToggle: () => void;
  onRemove: () => void;
};

const ShoppingRow = ({
  name,
  detail,
  price,
  checked,
  first,
  onToggle,
  onRemove,
}: RowProps) => {
  const swipeRef = useRef<SwipeableMethods>(null);

  const handleRemove = () => {
    swipeRef.current?.close();
    onRemove();
  };

  return (
    <View style={!first && styles.rowDivider}>
      <ReanimatedSwipeable
        ref={swipeRef}
        friction={2}
        rightThreshold={REMOVE_WIDTH / 2}
        overshootRight={false}
        renderRightActions={() => (
          <Pressable
            onPress={handleRemove}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${name} from the list`}
            style={styles.removeAction}
          >
            <Icon name="close" size={18} strokeWidth={2} color={c.onInverse} />
            <Text variant="label" color={c.onInverse}>
              Remove
            </Text>
          </Pressable>
        )}
      >
        <Pressable
          onPress={onToggle}
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          accessibilityLabel={detail ? `${name}, ${detail}` : name}
          accessibilityActions={[{ name: "remove", label: "Remove from list" }]}
          onAccessibilityAction={(e) =>
            e.nativeEvent.actionName === "remove" && onRemove()
          }
          style={styles.row}
        >
          <Checkbox checked={checked} />
          <View style={styles.flexText}>
            <Text
              variant="item"
              color={checked ? c.inkMuted : c.ink}
              style={checked && styles.struck}
            >
              {name}
            </Text>
            {detail ? (
              <Text variant="caption" color={c.accentText}>
                {detail}
              </Text>
            ) : null}
          </View>
          {price != null ? (
            <Text variant="code" style={styles.price}>
              £{price.toFixed(2)}
            </Text>
          ) : (
            <Text variant="caption" color={c.inkMuted}>
              no price yet
            </Text>
          )}
        </Pressable>
      </ReanimatedSwipeable>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.surface },
  header: { paddingHorizontal: Spacing.s20, paddingTop: Spacing.s16, gap: 2 },
  sessionArea: {
    paddingHorizontal: Spacing.s20,
    paddingTop: Spacing.s16,
    gap: Spacing.s8,
  },
  session: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s12,
    padding: Spacing.s12,
    paddingLeft: 14,
    backgroundColor: c.surfaceRaised,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 18,
  },
  inlineRow: { flexDirection: "row", alignItems: "center", gap: Spacing.s8 },
  flexText: { flex: 1, minWidth: 0 },
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: Spacing.s20,
    paddingTop: Spacing.s8,
    paddingBottom: Spacing.s24,
    gap: Spacing.s16,
  },
  listContentWithFooter: { paddingBottom: Spacing.s48 },
  section: { gap: Spacing.s8 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: Spacing.s8 },
  autoPill: {
    backgroundColor: c.accentSoft,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.s8,
    paddingVertical: 2,
  },
  card: {
    backgroundColor: c.surfaceRaised,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: Radius.card,
    overflow: "hidden",
  },
  rowDivider: { borderTopWidth: 1, borderTopColor: c.lineSoft },
  row: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s12,
    paddingVertical: Spacing.s8,
    paddingHorizontal: Spacing.s16,
    backgroundColor: c.surfaceRaised,
  },
  struck: { textDecorationLine: "line-through" },
  price: { fontSize: 13 },
  removeAction: {
    width: REMOVE_WIDTH,
    backgroundColor: c.inverse,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  addField: { flex: 1, borderStyle: "dashed", borderColor: c.lineStrong },
  empty: {
    alignItems: "center",
    gap: Spacing.s8,
    paddingVertical: Spacing.s32,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.s24,
  },
  centerText: { textAlign: "center" },
  footer: {
    backgroundColor: c.surfaceRaised,
    borderTopWidth: 1,
    borderTopColor: c.line,
    paddingHorizontal: Spacing.s20,
    paddingVertical: Spacing.s12,
  },
});
