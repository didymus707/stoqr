import { Pressable, StyleSheet } from "react-native";
import { Icon, IconName } from "./Icon";
import { Radius, Colors } from "@/constants/theme";

const c = Colors.light;

type Props = {
  label: string;
  icon: IconName;
  onPress: () => void;
  variant?: "raised" | "inverse";
};

export const IconButton = ({
  label,
  icon,
  onPress,
  variant = "raised",
}: Props) => {
  const inverse = variant === "inverse";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        inverse ? styles.inverse : styles.raised,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Icon
        name={icon}
        size={22}
        strokeWidth={2}
        color={inverse ? c.onInverse : c.ink}
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
  inverse: { backgroundColor: c.inverse },
});
