import { useAuth } from "@/stores/auth";
import { Item } from "@/types/database";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "expo-router";

type InventoryStats = {
  total: number;
  low: number;
  out: number;
};

type UseInventoryReturn = {
  items: Item[];
  stats: InventoryStats;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export const useInventory = (): UseInventoryReturn => {
  const { session } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!session?.user) return;

    setLoading(true);
    setError(null);

    try {
      const { data: invetories, error: invError } = await supabase
        .from("inventories")
        .select("id")
        .eq("user_id", session.user.id);

      if (invError) throw invError;

      if (!invetories || invetories.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      const inventoryIds = invetories.map((inv) => inv.id);

      const { data: itemsData, error: itemsError } = await supabase
        .from("items")
        .select("*")
        .in("inventory_id", inventoryIds)
        .order("created_at", { ascending: false });

      if (itemsError) throw itemsError;

      setItems(itemsData || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const refetchOnFocus = useCallback(() => {
    fetchItems();
  }, [fetchItems]);

  useFocusEffect(refetchOnFocus);

  const stats: InventoryStats = {
    total: items.length,
    low: items.filter((i) => i.status === "low").length,
    out: items.filter((i) => i.status === "out").length,
  };

  return { items, stats, loading, error, refetch: fetchItems };
};
