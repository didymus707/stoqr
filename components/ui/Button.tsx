import {
  Colors,
  Fonts,
  Radius,
  FontSize,
  Spacing,
  Type,
} from "@/constants/theme";
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";

const c = Colors.light;

type Props = Omit<PressableProps, "style" | "children"> & {
  label: string;
  value?: string;
  style?: StyleProp<ViewStyle>;
  variant?: "primary" | "secondary";
  labelStyle?: StyleProp<TextStyle>;
};

export const Button = ({
  label,
  disabled,
  variant = "primary",
  value,
  style,
  labelStyle,
  ...rest
}: Props) => {
  const textColor = [
    variant === "primary" ? styles.onAccent : styles.onInverse,
    disabled && styles.disabledLabel,
  ];
  return (
    <Pressable
      {...rest}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      accessibilityLabel={value ? `${label} ${value}` : label}
      style={({ pressed }) => [
        styles.base,
        value != null && styles.split,
        styles[variant],
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, textColor, labelStyle]}>{label}</Text>
      {value && <Text style={[styles.value, textColor]}>{value}</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.button,
    paddingHorizontal: Spacing.s20,
  },
  pressed: { opacity: 0.85 },
  onAccent: { color: c.onAccent },
  onInverse: { color: c.onInverse },
  disabledLabel: { color: c.inkMuted },
  disabled: { backgroundColor: c.line },
  primary: { backgroundColor: c.accent },
  secondary: { backgroundColor: c.inverse },
  value: {
    fontFamily: Fonts.mono,
    fontSize: FontSize.md,
    fontVariant: ["tabular-nums"],
  },
  label: { ...Type.button },
  split: { flexDirection: "row", justifyContent: "space-between" },
});
