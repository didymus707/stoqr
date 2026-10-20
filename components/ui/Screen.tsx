import { Colors, Spacing } from "@/constants/theme";
import { useRouter } from "expo-router";
import { ReactNode } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { IconButton } from "./IconButton";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "./Text";

const c = Colors.light;

type Props = {
  title: string;
  subtitle?: string;
  compact?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  footer?: ReactNode;
  children?: ReactNode;
};

export const Screen = ({
  title,
  subtitle,
  compact,
  showBack,
  onBack,
  footer,
  children,
}: Props) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const goBack =
    onBack ??
    (() => (router.canGoBack() ? router.back() : router.replace("/")));
  const backButton = showBack ? (
    <IconButton icon="back" label="Back" onPress={goBack} />
  ) : null;

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {compact ? (
            <View style={styles.compactHeader}>
              {backButton}
              <Text
                variant="titleSm"
                accessibilityRole="header"
                style={styles.flex}
              >
                {title}
              </Text>
            </View>
          ) : (
            <>
              {backButton}
              <View style={styles.titleBlock}>
                <Text variant="title" accessibilityRole="header">
                  {title}
                </Text>
                {subtitle ? (
                  <Text variant="body" color={c.inkMuted}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>
            </>
          )}
          {children}
        </ScrollView>

        {footer ? (
          <View
            style={[
              styles.footer,
              { paddingBottom: insets.bottom + Spacing.s12 },
            ]}
          >
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.surface },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.s20,
    paddingTop: Spacing.s8,
    paddingBottom: Spacing.s32,
    gap: Spacing.s20,
  },
  compactHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s12,
  },
  titleBlock: { gap: Spacing.s8 },
  footer: {
    backgroundColor: c.surfaceRaised,
    borderTopWidth: 1,
    borderTopColor: c.line,
    paddingHorizontal: Spacing.s20,
    paddingTop: Spacing.s12,
    gap: 4,
  },
});
