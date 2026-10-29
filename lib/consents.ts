import { supabase } from "./supabase";

export const POLICY_VERSION = "2026-10-28";

export type ConsentPurpose = "price_sharing" | "product_analytics";

export const getConsent = async (userId: string, purpose: ConsentPurpose) => {
  const { data, error } = await supabase
    .from("consents")
    .select("granted")
    .eq("user_id", userId)
    .eq("purpose", purpose)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data?.[0]?.granted ?? false;
};

export const setConsent = async (
  userId: string,
  purpose: ConsentPurpose,
  granted: boolean,
  source: "setup" | "profile",
) => {
  const { error } = await supabase.from("consents").insert({
    user_id: userId,
    purpose,
    granted,
    policy_version: POLICY_VERSION,
    source,
  });

  if (error) throw error;
};
