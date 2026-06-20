import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { passwordRegex, passwordRequirementMessage } from "@/lib/validation";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ExchangeStatus = "exchanging" | "ready" | "error";

export default function ResetPassword() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [status, setStatus] = useState<ExchangeStatus>("exchanging");
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const exchange = async () => {
      if (!code) {
        setStatus("error");
        setExchangeError("This reset link is missing or malformed!");
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        setStatus("error");
        setExchangeError("This link has expired or already been used");
        return;
      }

      setStatus("ready");
    };

    exchange();
  }, [code]);

  const handleSubmit = async () => {
    if (!password) {
      setFormError("Password is required");
      return;
    }

    if (!passwordRegex.test(password)) {
      setFormError(passwordRequirementMessage);
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    router.replace("/(tabs)");
  };

  if (status === "exchanging") {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (status === "error") {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.background,
          padding: Spacing.lg,
        }}
      >
        <Text
          style={{
            fontSize: FontSize.md,
            color: Colors.status.danger,
            textAlign: "center",
            marginBottom: Spacing.lg,
          }}
        >
          {exchangeError}
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/forgot-password")}
          style={{
            backgroundColor: Colors.primary,
            borderRadius: BorderRadius.md,
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.lg,
          }}
        >
          <Text
            style={{ color: "#fff", fontSize: FontSize.md, fontWeight: "600" }}
          >
            Request a new link
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        padding: Spacing.lg,
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: FontSize.xl,
          fontWeight: "600",
          color: Colors.text.primary,
          marginBottom: Spacing.sm,
        }}
      >
        Set a new password
      </Text>
      <Text
        style={{
          fontSize: FontSize.md,
          color: Colors.text.secondary,
          marginBottom: Spacing.lg,
        }}
      >
        Choose a new password for your account.
      </Text>

      <TextInput
        placeholder="New password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        style={inputStyle}
      />
      <TextInput
        placeholder="Confirm password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        autoCapitalize="none"
        style={[inputStyle, { marginTop: Spacing.sm }]}
      />

      {formError && (
        <Text
          style={{
            color: Colors.status.danger,
            marginTop: Spacing.sm,
            fontSize: FontSize.sm,
          }}
        >
          {formError}
        </Text>
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={submitting}
        style={{
          backgroundColor: Colors.primary,
          borderRadius: BorderRadius.md,
          paddingVertical: Spacing.md,
          alignItems: "center",
          marginTop: Spacing.lg,
          opacity: submitting ? 0.6 : 1,
        }}
      >
        <Text
          style={{ color: "#fff", fontSize: FontSize.md, fontWeight: "600" }}
        >
          {submitting ? "Updating..." : "Update password"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: Colors.border,
  borderRadius: BorderRadius.md,
  padding: Spacing.md,
  fontSize: FontSize.md,
  color: Colors.text.primary,
  backgroundColor: Colors.surface,
};
