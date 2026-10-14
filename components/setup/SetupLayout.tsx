import { ReactNode } from "react";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Icon } from "../ui/Icon";
import { IconButton } from "../ui/IconButton";
import { Text } from "../ui/Text";
import { Button } from "../ui/Button";

const c = Colors.light;
const totalSteps = 4;

type Props = {
  step: number;
  title: string;
  subtitle: string;
  onSkip?: () => void;
  footer: ReactNode;
  children: ReactNode;
};

export const SetupLayout = ({
  step,
  title,
  subtitle,
  onSkip,
  children,
  footer,
}: Props) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          {step > 1 ? (
            <IconButton
              icon="back"
              label="Back"
              onPress={() => router.back()}
            />
          ) : (
            <View style={styles.side} />
          )}
          <View
            style={styles.progress}
            accessible
            accessibilityLabel={`Step ${step} of ${totalSteps}`}
          >
            <View style={styles.bars}>
              {Array.from({ length: totalSteps }, (_, i) => (
                <View
                  key={i}
                  style={[styles.bar, i < step && styles.barDone]}
                />
              ))}
            </View>
            <Text variant="caption" color={c.inkMuted}>
              Step {step} of {totalSteps}
            </Text>
          </View>

          {onSkip ? (
            <Button label="Skip" variant="ghost" size="sm" onPress={onSkip} />
          ) : (
            <View style={styles.side} />
          )}
        </View>

        <ScrollView
          style={styles.screen}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleBlock}>
            <Text variant="title" accessibilityRole="header">
              {title}
            </Text>
            <Text variant="body" color={c.inkMuted}>
              {subtitle}
            </Text>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + Spacing.s12 },
          ]}
        >
          {footer}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s12,
    paddingHorizontal: Spacing.s20,
    paddingTop: Spacing.s8,
  },
  side: { width: 44 },
  progress: { flex: 1, gap: 6 },
  bars: { flexDirection: "row", gap: 4 },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: c.line,
  },
  barDone: { backgroundColor: c.accent },
  content: {
    paddingHorizontal: Spacing.s20,
    paddingTop: Spacing.s24,
    paddingBottom: Spacing.s32,
    gap: Spacing.s24,
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
