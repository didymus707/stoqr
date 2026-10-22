import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import BudgetSnapshot from "@/components/features/BudgetSnapshot";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Stepper } from "@/components/ui/Stepper";
import { Text } from "@/components/ui/Text";
import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";
import { useInventory } from "@/hooks/useInventory";
import { useProfile } from "@/hooks/useProfile";
import { postcodeDistrict } from "@/lib/setup";
import { unitLabel } from "@/lib/unit";
import { useAuth } from "@/stores/auth";
import { useShoppingSession } from "@/stores/shopping-session";

const c = Colors.light;
const RUNNING_LOW_LIMIT = 4;

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
};

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { profile } = useProfile();
  const { activeStore } = useShoppingSession();
  const { items, stats, loading, error, refetch, updateQuantity } =
    useInventory();

  const fullName =
    profile?.full_name ?? session?.user?.user_metadata?.full_name ?? "";
  const firstName = fullName.trim().split(" ")[0] || "there";
  const initials =
    fullName
      .trim()
      .split(/\s+/)
      .map((w: string) => w.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("") || "?";
  const place = profile?.postcode
    ? `Home · ${postcodeDistrict(profile.postcode)}`
    : "Home";

  const lowCount = stats.low + stats.out;
  const runningLow = items
    .filter((i) => i.status !== "ok")
    .sort(
      (a, b) => (a.status === "out" ? -1 : 0) - (b.status === "out" ? -1 : 0),
    )
    .slice(0, RUNNING_LOW_LIMIT);

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.flex}>
            <Text variant="label" color={c.inkMuted}>
              {place}
            </Text>
            <Text variant="titleSm" accessibilityRole="header">
              {greeting()}, {firstName}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/profile")}
            accessibilityRole="button"
            accessibilityLabel="Profile"
            style={styles.avatar}
          >
            <Text variant="label" color={c.onInverse}>
              {initials}
            </Text>
          </Pressable>
        </View>

        {activeStore ? (
          <View style={styles.session}>
            <Icon name="store" size={22} color={c.accent} />
            <View style={styles.flex}>
              <Text variant="caption" color={c.inkMuted}>
                Shopping at
              </Text>
              <Text variant="item">{activeStore}</Text>
            </View>
            <Button
              label="Change"
              size="sm"
              variant="outline"
              onPress={() => router.push("/(tabs)/shopping")}
            />
          </View>
        ) : null}

        {loading && items.length === 0 ? (
          <View style={styles.loading}>
            <ActivityIndicator color={c.accent} />
          </View>
        ) : error ? (
          <View style={styles.notice}>
            <Text variant="item">Couldn't load your cupboard</Text>
            <Text variant="bodySm" color={c.inkMuted}>
              Check your connection and try again.
            </Text>
            <Button
              label="Try again"
              size="sm"
              variant="outline"
              onPress={refetch}
              style={styles.start}
            />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.notice}>
            <Text variant="heading">Your cupboard is empty</Text>
            <Text variant="bodySm" color={c.inkMuted}>
              Add the things you keep at home and we'll tell you before they run
              out.
            </Text>
            <Button
              label="Add your first item"
              size="sm"
              onPress={() => router.push("/add-item")}
              style={styles.start}
            />
          </View>
        ) : (
          <>
            <View style={styles.stat}>
              <View style={styles.statTop}>
                <Text variant="numberXl" color={c.onInverse}>
                  {lowCount}
                </Text>
                <View style={styles.statText}>
                  <Text variant="heading" color={c.onInverse}>
                    {lowCount === 0
                      ? "nothing running low"
                      : lowCount === 1
                        ? "thing running low"
                        : "things running low"}
                  </Text>
                  <Text variant="bodySm" color={c.onInverseMuted}>
                    {lowCount === 0
                      ? `All ${stats.total} items are stocked`
                      : stats.out > 0
                        ? `${stats.out} ${stats.out === 1 ? "is" : "are"} out · all on your list`
                        : "All on your shopping list"}
                  </Text>
                </View>
              </View>
              {lowCount > 0 ? (
                <Button
                  label="Open shopping list"
                  onPress={() => router.push("/(tabs)/shopping")}
                />
              ) : null}
            </View>

            {runningLow.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHead}>
                  <Text variant="heading">Running low</Text>
                  <Button
                    label="See cupboard"
                    size="sm"
                    variant="ghost"
                    onPress={() => router.push("/(tabs)/cupboard")}
                  />
                </View>
                <View style={styles.card}>
                  {runningLow.map((item, index) => (
                    <View
                      key={item.id}
                      style={[styles.row, index > 0 && styles.divider]}
                    >
                      <Pressable
                        onPress={() => router.push(`/edit-item?id=${item.id}`)}
                        accessibilityRole="button"
                        style={styles.rowText}
                      >
                        <Text variant="item" numberOfLines={2}>
                          {item.name}
                        </Text>
                        <Text
                          variant="caption"
                          color={c.accentText}
                          style={styles.semi}
                        >
                          {item.status === "out"
                            ? "Out · on your list"
                            : `${item.quantity} ${unitLabel(item.quantity, item.unit)} left`}
                        </Text>
                      </Pressable>
                      <Stepper
                        label={item.name}
                        value={item.quantity}
                        onChange={(q) => updateQuantity(item.id, q)}
                      />
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <BudgetSnapshot />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.surface },
  content: {
    paddingHorizontal: Spacing.s20,
    paddingTop: Spacing.s16,
    paddingBottom: Spacing.s32,
    gap: Spacing.s16,
  },
  flex: { flex: 1, minWidth: 0 },
  semi: { fontFamily: Fonts.bodySemi },
  start: { alignSelf: "flex-start" },
  header: { flexDirection: "row", alignItems: "center", gap: Spacing.s12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: c.inverse,
    alignItems: "center",
    justifyContent: "center",
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
  loading: { paddingVertical: Spacing.s48 },
  notice: {
    gap: Spacing.s8,
    padding: Spacing.s20,
    backgroundColor: c.surfaceRaised,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: Radius.card,
  },
  stat: {
    backgroundColor: c.inverse,
    borderRadius: Radius.hero,
    padding: Spacing.s20,
    gap: Spacing.s16,
  },
  statTop: { flexDirection: "row", alignItems: "flex-end", gap: Spacing.s12 },
  statText: { flex: 1, paddingBottom: 2 },
  section: { gap: Spacing.s8 },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  rowText: { flex: 1, minWidth: 0, gap: 2 },
});
