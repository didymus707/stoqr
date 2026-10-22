import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Item } from "@/types/database";
import { useAuth } from "@/stores/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ManualItem = {
  id: string;
  name: string;
  checked: boolean;
};

type UseShoppingListReturn = {
  lowStockItems: Item[];
  manualItems: ManualItem[];
  loading: boolean;
  error: string | null;
  addManualItem: (name: string) => void;
  removeManualItem: (id: string) => void;
  toggleManualItem: (id: string) => void;
};

export function useShoppingList(): UseShoppingListReturn {
  const { session } = useAuth();
  const [lowStockItems, setLowStockItems] = useState<Item[]>([]);
  const [manualItems, setManualItems] = useState<ManualItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manualLoaded, setManualLoaded] = useState(false);

  const storageKey = session?.user
    ? `shoppingList.manual.${session.user.id}`
    : null;

  useEffect(() => {
    if (!storageKey) return;
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (raw) setManualItems(JSON.parse(raw));
      })
      .finally(() => setManualLoaded(true));
  }, [storageKey]);

  useEffect(() => {
    if (storageKey && manualLoaded)
      AsyncStorage.setItem(storageKey, JSON.stringify(manualItems));
  }, [storageKey, manualLoaded, manualItems]);

  const fetchLowStockItems = useCallback(async () => {
    if (!session?.user) return;

    setLoading(true);
    setError(null);

    try {
      const { data: inventories, error: invError } = await supabase
        .from("inventories")
        .select("id")
        .eq("user_id", session.user.id);

      if (invError) throw invError;

      if (!inventories || inventories.length === 0) {
        setLowStockItems([]);
        setLoading(false);
        return;
      }

      const inventoryIds = inventories.map((inv) => inv.id);

      const { data: itemsData, error: itemsError } = await supabase
        .from("items")
        .select("*")
        .in("inventory_id", inventoryIds)
        .in("status", ["low", "out"])
        .order("status", { ascending: true });

      if (itemsError) throw itemsError;

      setLowStockItems(itemsData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      fetchLowStockItems();
    }, [fetchLowStockItems]),
  );

  function addManualItem(name: string) {
    if (!name.trim()) return;
    const newItem: ManualItem = {
      id: Date.now().toString(),
      name: name.trim(),
      checked: false,
    };
    setManualItems((prev) => [...prev, newItem]);
  }

  function removeManualItem(id: string) {
    setManualItems((prev) => prev.filter((item) => item.id !== id));
  }

  function toggleManualItem(id: string) {
    setManualItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  }

  return {
    lowStockItems,
    manualItems,
    loading,
    error,
    addManualItem,
    removeManualItem,
    toggleManualItem,
  };
}
