import { supabase } from "@/lib/supabase";
import { useAuth } from "@/stores/auth";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export type StoreBreakdown = {
  store: string;
  store_total: number;
};

export type TopItem = {
  name: string;
  price: number;
  quantity: number;
  item_value: number;
  unit: string | null;
  store: string | null;
};

export type BudgetSummary = {
  total_value: number;
  item_count: number;
  top_items: TopItem[];
  store_breakdown: StoreBreakdown[];
};

type UseBudgetReturn = {
  budget: BudgetSummary | null;
  loading: boolean;
  error: string | null;
};

export const useBudget = (): UseBudgetReturn => {
  const { session } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [budget, setBudget] = useState<BudgetSummary | null>(null);

  const fetchBudget = useCallback(async () => {
    if (!session?.user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc("get_budget_summary", {
        user_id_input: session.user.id,
      });

      if (error) throw error;
      setBudget(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      fetchBudget();
    }, [fetchBudget]),
  );

  return { budget, loading, error };
};
