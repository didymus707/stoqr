import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { Chip } from "@/components/ui/Chip";
import { IconButton } from "@/components/ui/IconButton";
import { Stepper } from "@/components/ui/Stepper";
import { Text } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";
import { useInventory } from "@/hooks/useInventory";
import { supabase } from "@/lib/supabase";
import { unitLabel } from "@/lib/unit";
import { Item } from "@/types/database";

const c = Colors.light;

type Filter = "all" | "low" | "out" | "ok";

const STATUS_WORD: Record<Item["status"], string> = {
  ok: "Stocked",
  low: "Low",
  out: "Out",
};

export default function CupboardScreen() {
  const router = useRouter();
  const { showActionSheetWithOptions } = useActionSheet();
  const { items, loading, error, refetch, updateQuantity } = useInventory();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const counts = {
    low: items.filter((i) => i.status === "low").length,
    out: items.filter((i) => i.status === "out").length,
  };

  const query = search.trim().toLowerCase();
  const visible = items
    .filter((i) => i.name.toLowerCase().includes(query))
    .filter((i) => filter === "all" || i.status === filter);

  const editItem = (item: Item) => router.push(`/edit-item?id=${item.id}`);

  const deleteItem = (item: Item) =>
    Alert.alert(
      `Delete ${item.name}?`,
      "It will be removed from your cupboard.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error: deleteError } = await supabase
              .from("items")
              .delete()
              .eq("id", item.id);
            if (deleteError)
              Alert.alert(
                "Couldn't delete",
                "Check your connection and try again.",
              );
            refetch();
          },
        },
      ],
    );

  const openOptions = (item: Item) =>
    showActionSheetWithOptions(
      {
        title: item.name,
        options: ["Edit", "Delete", "Cancel"],
        destructiveButtonIndex: 1,
        cancelButtonIndex: 2,
      },
      (index) => {
        if (index === 0) editItem(item);
        if (index === 1) deleteItem(item);
      },
    );

  const emptyText = query
    ? { title: "Nothing found", body: `No items match "${search.trim()}".` }
    : filter !== "all"
      ? { title: "Nothing here", body: "No items match this filter." }
      : {
          title: "Your cupboard is empty",
          body: "Tap + to add the things you keep at home.",
        };

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <View style={styles.top}>
        <View style={styles.titleRow}>
          <View style={styles.titleText}>
            <Text variant="title" accessibilityRole="header">
              Cupboard
            </Text>
            {items.length > 0 ? (
              <Text variant="code" color={c.inkMuted}>
                {items.length} {items.length === 1 ? "item" : "items"}
              </Text>
            ) : null}
          </View>
          <IconButton
            icon="add"
            label="Add an item"
            variant="inverse"
            onPress={() => router.push("/add-item")}
          />
        </View>

        <TextField
          icon="search"
          value={search}
          onChangeText={setSearch}
          placeholder="Search milk, rice, nappies…"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search your cupboard"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          <Chip
            label="All"
            selected={filter === "all"}
            onPress={() => setFilter("all")}
          />
          <Chip
            label="Low"
            count={counts.low}
            selected={filter === "low"}
            onPress={() => setFilter("low")}
          />
          <Chip
            label="Out"
            count={counts.out}
            selected={filter === "out"}
            onPress={() => setFilter("out")}
          />
          <Chip
            label="Stocked"
            selected={filter === "ok"}
            onPress={() => setFilter("ok")}
          />
        </ScrollView>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {loading && items.length === 0 ? (
          <Text variant="bodySm" color={c.inkMuted} style={styles.center}>
            Loading your cupboard…
          </Text>
        ) : error ? (
          <Text variant="bodySm" color={c.accentText} style={styles.center}>
            Couldn't load your cupboard. Pull down or reopen the tab to try
            again.
          </Text>
        ) : visible.length === 0 ? (
          <View style={styles.empty}>
            <Text variant="heading">{emptyText.title}</Text>
            <Text variant="bodySm" color={c.inkMuted} style={styles.center}>
              {emptyText.body}
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            {visible.map((item, index) => (
              <CupboardRow
                key={item.id}
                item={item}
                first={index === 0}
                onOpen={() => editItem(item)}
                onOptions={() => openOptions(item)}
                onDelete={() => deleteItem(item)}
                onQuantityChange={(qty) => updateQuantity(item.id, qty)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

type RowProps = {
  item: Item;
  first: boolean;
  onOpen: () => void;
  onOptions: () => void;
  onDelete: () => void;
  onQuantityChange: (qty: number) => void;
};

function CupboardRow({
  item,
  first,
  onOpen,
  onOptions,
  onDelete,
  onQuantityChange,
}: RowProps) {
  const statusColor = item.status === "ok" ? c.ok : c.accentText;
  const meta = [
    `${item.quantity} ${unitLabel(item.quantity, item.unit)}`.trim(),
    item.store,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View style={[styles.row, !first && styles.divider]}>
      <Pressable
        onPress={onOpen}
        onLongPress={onOptions}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${meta}, ${STATUS_WORD[item.status]}`}
        accessibilityHint="Opens the item. Long press for more options."
        accessibilityActions={[{ name: "delete", label: "Delete item" }]}
        onAccessibilityAction={(e) =>
          e.nativeEvent.actionName === "delete" && onDelete()
        }
        style={styles.rowMain}
      >
        <Text variant="item" numberOfLines={2}>
          {item.name}
        </Text>
        <Text variant="caption" color={c.inkMuted}>
          {meta ? `${meta} · ` : ""}
          <Text variant="caption" color={statusColor} style={styles.semi}>
            {STATUS_WORD[item.status]}
          </Text>
        </Text>
      </Pressable>
      <Stepper
        label={item.name}
        value={item.quantity}
        onChange={onQuantityChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.surface },
  flex: { flex: 1 },
  center: { textAlign: "center" },
  semi: { fontFamily: Fonts.bodySemi },
  top: {
    paddingHorizontal: Spacing.s20,
    paddingTop: Spacing.s16,
    gap: Spacing.s12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleText: { flexDirection: "row", alignItems: "baseline", gap: 10 },
  chips: { gap: Spacing.s8, paddingBottom: 2 },
  listContent: {
    paddingHorizontal: Spacing.s20,
    paddingTop: Spacing.s12,
    paddingBottom: Spacing.s32,
  },
  card: {
    backgroundColor: c.surfaceRaised,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: Radius.card,
    overflow: "hidden",
  },
  row: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: Spacing.s8,
    paddingLeft: Spacing.s16,
    paddingRight: 10,
  },
  divider: { borderTopWidth: 1, borderTopColor: c.lineSoft },
  rowMain: { flex: 1, minWidth: 0, gap: 2 },
  empty: {
    alignItems: "center",
    gap: Spacing.s8,
    paddingVertical: Spacing.s48,
  },
});
