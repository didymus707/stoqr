import { Icon, IconName } from "./Icon";
import { Radius, Colors } from "@/constants/theme";
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";

const c = Colors.light;

type Variant = "raised" | "inverse" | "ghost";

type Props = Omit<PressableProps, "style" | "children"> & {
  label: string;
  icon: IconName;
  variant?: Variant;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
};

const iconColor: Record<Variant, string> = {
  raised: c.ink,
  ghost: c.inkSubtle,
  inverse: c.onInverse,
};

export const IconButton = ({
  label,
  icon,
  iconSize = 22,
  variant = "raised",
  style,
  ...rest
}: Props) => {
  const inverse = variant === "inverse";

  return (
    <Pressable
      {...rest}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        style,
      ]}
    >
      <Icon
        name={icon}
        size={iconSize}
        strokeWidth={2}
        color={iconColor[variant]}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  raised: {
    backgroundColor: c.surfaceRaised,
    borderWidth: 1,
    borderColor: c.line,
  },
  pressed: { opacity: 0.7 },
  inverse: { backgroundColor: c.inverse },
  ghost: { backgroundColor: "transparent" },
});
