import { Colors, Fonts, BorderRadius, FontSize } from "@/constants/theme";
import { Pressable, StyleSheet, Text } from "react-native";

const c = Colors.light;

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

export const Button = ({
  label,
  onPress,
  variant = "primary",
  disabled,
}: Props) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    style={[styles.base, styles[variant], disabled && styles.disabled]}
  >
    <Text
      style={[
        styles.label,
        variant === "primary" ? styles.onAccent : styles.onInverse,
      ]}
    >
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: c.accent },
  secondary: { backgroundColor: c.ink },
  disabled: { backgroundColor: c.line },
  disabledLabel: { backgroundColor: c.inkMuted },
  label: { fontFamily: Fonts.bodySemi, fontSize: FontSize.md },
  onAccent: { color: c.onAccent },
  onInverse: { color: c.onInverse },
});
