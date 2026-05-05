import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/stores/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const { session, signOut } = useAuth();

  const [fullName, setFullName] = useState("");
  const [postcode, setPostcode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const email = session?.user?.email ?? "";
  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (email[0]?.toUpperCase() ?? "?");

  useEffect(() => {
    fetchProfile();
  }, [session]);

  async function fetchProfile() {
    if (!session?.user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, postcode")
      .eq("id", session.user.id)
      .single();

    if (error) {
      setError(error.message);
    } else {
      setFullName(data?.full_name ?? "");
      setPostcode(data?.postcode ?? "");
    }

    setLoading(false);
  }

  async function handleSave() {
    if (!session?.user) return;

    if (postcode.trim()) {
      const postcodeRegex = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i;
      if (!postcodeRegex.test(postcode.trim())) {
        setError("Please enter a valid UK postcode (e.g. SR1 1AA)");
        return;
      }
    }

    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        postcode: postcode.trim().toUpperCase(),
      })
      .eq("id", session.user.id);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    Alert.alert("Saved", "Your profile has been updated.");
  }

  async function handleDeleteAccount() {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all your inventory data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await signOut();
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={32} color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator size={16} color={Colors.primary} />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.email}>{email}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Info</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your full name"
                placeholderTextColor={Colors.text.muted}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Postcode</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. SR1 1AA"
                placeholderTextColor={Colors.text.muted}
                value={postcode}
                onChangeText={setPostcode}
                autoCapitalize="characters"
                maxLength={8}
              />
              <Text style={styles.hint}>
                Used to show prices relevant to your area
              </Text>
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>

            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleDeleteAccount}
            >
              <Text style={styles.dangerButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  backText: {
    fontSize: FontSize.md,
    color: Colors.primary,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  saveText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: "600",
  },
  content: {
    paddingBottom: Spacing.xxl,
  },
  avatarContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: FontSize.xxl,
    fontWeight: "700",
  },
  email: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "500",
    color: Colors.text.primary,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hint: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.status.danger,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.lg,
  },
  dangerButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.status.danger,
    alignItems: "center",
  },
  dangerButtonText: {
    color: Colors.status.danger,
    fontWeight: "600",
    fontSize: FontSize.md,
  },
});
