import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/stores/auth";

export type ProfileData = {
  full_name: string | null;
  postcode: string | null;
  preferred_stores: string[];
};

export const useProfile = () => {
  const { session } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!session?.user) return;
    const { data } = await supabase
      .from("profiles")
      .select("full_name, postcode, preferred_stores")
      .eq("id", session.user.id)
      .single();
    setProfile(data ?? null);
    setLoading(false);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile]),
  );

  return { profile, loading, refetch: fetchProfile };
}
