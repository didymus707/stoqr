import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { supabase } from "@/lib/supabase";

const c = Colors.light;

type PriceResult = {
  store: string;
  unit: string | null;
  avg_unit_price: number;
  contributors: number;
};

const money = (n: number) => `£${Number(n).toFixed(2)}`;

export default function CompareScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<PriceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = search.trim();
  const canSearch = query.length >= 2 && !loading;

  const handleSearch = async () => {
    if (!canSearch) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc(
        "get_price_comparison",
        {
          search_term: query,
        },
      );
      if (rpcError) throw rpcError;
      const rows = ((data ?? []) as PriceResult[])
        .map((r) => ({
          ...r,
          avg_unit_price: Number(r.avg_unit_price),
          contributors: Number(r.contributors),
        }))
        .sort((a, b) => a.avg_unit_price - b.avg_unit_price);
      setResults(rows);
      setTerm(query);
      setSearched(true);
    } catch {
      setError("Couldn't load prices. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const maxPrice =
    results.reduce((m, r) => Math.max(m, r.avg_unit_price), 0) || 1;

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <View style={styles.top}>
        <View style={styles.titleBlock}>
          <Text variant="title" accessibilityRole="header">
            Compare prices
          </Text>
          <Text variant="bodySm" color={c.inkMuted}>
            Average prices shared by stoQr shoppers across the UK, per single
            item.
          </Text>
        </View>
        <View style={styles.searchRow}>
          <TextField
            icon="search"
            containerStyle={styles.flex}
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              if (!text.trim()) {
                setSearched(false);
                setResults([]);
              }
            }}
            onSubmitEditing={handleSearch}
            placeholder="Milk, rice, toilet roll…"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Search for an item"
          />
          <Button
            label="Search"
            size="sm"
            variant="secondary"
            disabled={!canSearch}
            onPress={handleSearch}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={c.accent} />
          </View>
        ) : error ? (
          <Text variant="bodySm" color={c.accentText}>
            {error}
          </Text>
        ) : !searched ? (
          <View style={styles.notice}>
            <Text variant="heading">Find the cheapest shop</Text>
            <Text variant="bodySm" color={c.inkMuted}>
              Search for something you buy to see what other stoQr shoppers paid
              at each shop.
            </Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.notice}>
            <Text variant="heading">Not enough prices for "{term}" yet</Text>
            <Text variant="bodySm" color={c.inkMuted}>
              We show a price once at least 5 shoppers have shared one for the
              same shop. You can help by turning on price sharing in Profile.
            </Text>
            <Button
              label="Open Profile"
              size="sm"
              variant="outline"
              onPress={() => router.push("/profile")}
              style={styles.start}
            />
          </View>
        ) : (
          <View style={styles.section}>
            <Text variant="overline" color={c.inkMuted}>
              Results for "{term}"
            </Text>
            <View style={styles.card}>
              {results.map((r, index) => {
                const cheapest = index === 0 && results.length > 1;
                return (
                  <View
                    key={`${r.store}-${r.unit}`}
                    style={[styles.row, index > 0 && styles.divider]}
                  >
                    <View style={styles.rowTop}>
                      <View style={styles.flex}>
                        <View style={styles.storeLine}>
                          <Text variant="item">{r.store}</Text>
                          {cheapest ? (
                            <View style={styles.pill}>
                              <Text variant="pill" color={c.onAccent}>
                                Cheapest
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <Text variant="caption" color={c.inkMuted}>
                          per {r.unit ?? "item"} · {r.contributors} shoppers
                        </Text>
                      </View>
                      <Text variant="price">{money(r.avg_unit_price)}</Text>
                    </View>
                    <View style={styles.track}>
                      <View
                        style={[
                          styles.fill,
                          {
                            width: `${Math.round((r.avg_unit_price / maxPrice) * 100)}%`,
                            backgroundColor: index === 0 ? c.accent : c.chart3,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
            <Text variant="caption" color={c.inkMuted}>
              Averages of the latest price each shopper paid in the last 90
              days. What you pay may differ.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.surface },
  flex: { flex: 1, minWidth: 0 },
  start: { alignSelf: "flex-start" },
  top: {
    paddingHorizontal: Spacing.s20,
    paddingTop: Spacing.s16,
    gap: Spacing.s12,
  },
  titleBlock: { gap: 2 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: Spacing.s8 },
  content: {
    paddingHorizontal: Spacing.s20,
    paddingTop: Spacing.s16,
    paddingBottom: Spacing.s32,
    gap: Spacing.s16,
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
  section: { gap: Spacing.s8 },
  card: {
    backgroundColor: c.surfaceRaised,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: Radius.card,
    overflow: "hidden",
  },
  row: {
    paddingVertical: Spacing.s12,
    paddingHorizontal: Spacing.s16,
    gap: Spacing.s8,
  },
  divider: { borderTopWidth: 1, borderTopColor: c.lineSoft },
  rowTop: { flexDirection: "row", alignItems: "center", gap: Spacing.s12 },
  storeLine: { flexDirection: "row", alignItems: "center", gap: Spacing.s8 },
  pill: {
    backgroundColor: c.accent,
    borderRadius: Radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  track: { height: 6, borderRadius: 3, backgroundColor: c.lineSoft },
  fill: { height: 6, borderRadius: 3 },
});
