import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { Colors, FontSize, Spacing, Radius } from "@/constants/theme";
import { useRouter } from "expo-router";

type PriceResult = {
  store: string;
  avg_price: number;
  min_price: number;
  max_price: number;
  data_points: number;
};

export default function CompareScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<PriceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!search.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(false);

    try {
      const { data, error } = await supabase.rpc("get_price_comparison", {
        search_term: search.trim(),
      });

      if (error) throw error;

      setResults(data || []);
      setSearched(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Compare Prices</Text>
        <Text style={styles.subtitle}>Based on prices logged by S users</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for an item..."
          placeholderTextColor={Colors.text.muted}
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            if (!text.trim()) {
              setSearched(false);
              setResults([]);
            }
          }}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.searchButton, loading && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size={16} color="#ffffff" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.results}
        contentContainerStyle={styles.resultsContent}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View style={styles.centeredContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : !searched ? (
          <View style={styles.centeredContainer}>
            <Text style={styles.emptyEmoji}>💰</Text>
            <Text style={styles.emptyTitle}>Compare prices</Text>
            <Text style={styles.emptySubtitle}>
              Search for any item to see where it's cheapest near you
            </Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.centeredContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>
              No one has logged prices for "{search}" yet.{"\n"}
              Add it to your inventory with a store and price to be the first!
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/add-item")}
            >
              <Text style={styles.addButtonText}>
                Add {search} to your inventory
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.resultsTitle}>Results for "{search}"</Text>
            {results.map((result, index) => (
              <PriceCard
                key={result.store}
                result={result}
                rank={index + 1}
                isCheapest={index === 0}
              />
            ))}
            <Text style={styles.disclaimer}>
              Prices are averaged from user-submitted data. Actual prices may
              vary by location.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function PriceCard({
  result,
  rank,
  isCheapest,
}: {
  result: PriceResult;
  rank: number;
  isCheapest: boolean;
}) {
  const medal =
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`;

  return (
    <View style={[styles.priceCard, isCheapest && styles.priceCardCheapest]}>
      <View style={styles.priceCardLeft}>
        <Text style={styles.medal}>{medal}</Text>
        <View>
          <Text style={styles.storeName}>{result.store}</Text>
          <Text style={styles.dataPoints}>
            {result.data_points}{" "}
            {result.data_points === 1 ? "price logged" : "prices logged"}
          </Text>
        </View>
      </View>

      <View style={styles.priceCardRight}>
        <Text style={[styles.avgPrice, isCheapest && styles.avgPriceCheapest]}>
          £{result.avg_price.toFixed(2)}
        </Text>
        {result.min_price !== result.max_price && (
          <Text style={styles.priceRange}>
            £{result.min_price.toFixed(2)} – £{result.max_price.toFixed(2)}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.s24,
    paddingTop: Spacing.s12,
    paddingBottom: Spacing.s8,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.muted,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.s24,
    gap: Spacing.s8,
    marginBottom: Spacing.s12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.s12,
    fontSize: FontSize.md,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.s24,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: FontSize.sm,
  },
  results: {
    flex: 1,
  },
  resultsContent: {
    paddingHorizontal: Spacing.s24,
    paddingBottom: Spacing.s48,
    flexGrow: 1,
  },
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing.s48,
    gap: Spacing.s8,
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
  resultsTitle: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text.secondary,
    marginBottom: Spacing.s12,
  },
  priceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.s12,
    marginBottom: Spacing.s8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceCardCheapest: {
    borderColor: Colors.status.success,
    backgroundColor: Colors.status.success + "08",
  },
  priceCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s8,
  },
  medal: {
    fontSize: 24,
  },
  storeName: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  dataPoints: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    marginTop: 2,
  },
  priceCardRight: {
    alignItems: "flex-end",
  },
  avgPrice: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  avgPriceCheapest: {
    color: Colors.status.success,
  },
  priceRange: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    marginTop: 2,
  },
  disclaimer: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    textAlign: "center",
    paddingTop: Spacing.s12,
    lineHeight: 18,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.status.danger,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.s24,
    paddingVertical: Spacing.s8,
    borderRadius: Radius.pill,
    marginTop: Spacing.s8,
  },
  addButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: FontSize.sm,
  },
});
