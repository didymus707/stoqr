import { supabase } from "./supabase";

export const POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i;

export const formatPostcode = (value: string) => {
  const s = value.replace(/\s+/g, "").toUpperCase();
  return s.length > 3 ? `${s.slice(0, -3)} ${s.slice(-3)}` : s;
};

export const postcodeDistrict = (value: string) =>
  formatPostcode(value).split(" ")[0];

export const updateProfile = async (
  userId: string,
  fields: Record<string, unknown>,
) => {
  const { error } = await supabase
    .from("profiles")
    .update(fields)
    .eq("id", userId);
};

export const getOrCreateInventory = async (userId: string) => {
  const { data, error } = await supabase
    .from("inventories")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  if (error) throw error;
  if (data && data.length > 0) return data[0].id as string;

  const { data: inventory, error: createError } = await supabase
    .from("inventories")
    .insert({ user_id: userId, name: "My Inventory" })
    .select("id")
    .single();

  if (createError) throw createError;
  return inventory.id as string;
};

export const finishSetup = async (userId: string) =>
  await updateProfile(userId, { onboarded_at: new Date().toISOString() });
