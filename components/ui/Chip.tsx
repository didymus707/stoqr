import { Colors, Radius } from "@/constants/theme";
import { Pressable, StyleSheet } from "react-native";
import { Text } from "./Text";

const c = Colors.light;

type Props = {
  label: string;
  count?: number;
  selected?: boolean;
  onPress: () => void;
};

export const Chip = ({ label, count, selected, onPress }: Props) => {
  const text = count !== undefined ? `${label} · ${count}` : label;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={text}
      hitSlop={{ top: 4, bottom: 4 }}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text variant="label" color={selected ? c.onInverse : c.ink}>
        {text}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  selected: { backgroundColor: c.inverse, borderColor: c.inverse },
});
