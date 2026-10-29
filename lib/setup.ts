import { supabase } from "./supabase";

export const POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i;

// Accepts a full postcode or just the first half.
export const POSTCODE_OR_DISTRICT_REGEX =
  /^[A-Z]{1,2}[0-9][0-9A-Z]?(\s?[0-9][A-Z]{2})?$/i;

// "SW16 1AA" -> "SW16", "sw161aa" -> "SW16", "SW16" -> "SW16"
export const postcodeDistrict = (value: string) => {
  const postcode = value.replace(/\s+/g, "").toUpperCase();
  return postcode.length >= 5 && /[0-9][A-Z]{2}$/.test(postcode) ? postcode.slice(0, -3) : postcode;
};

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
