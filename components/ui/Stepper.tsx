import { Colors, Radius } from "@/constants/theme";
import { Pressable, StyleSheet, View } from "react-native";
import { Icon } from "./Icon";
import { Text } from "./Text";

const c = Colors.light;

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  label: string;
};

export const Stepper = ({ value, onChange, min = 0, label }: Props) => {
  const atMin = value <= min;

  return (
    <View
      style={{}}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ now: value }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === "decrement" && !atMin)
          onChange(value - 1);
        if (e.nativeEvent.actionName === "increment") onChange(value + 1);
      }}
    >
      <Pressable
        onPress={() => onChange(value - 1)}
        disabled={atMin}
        style={styles.button}
      >
        <Icon
          name="minus"
          size={20}
          strokeWidth={2}
          color={atMin ? c.inkSubtle : c.ink}
        />
      </Pressable>
      <Text
        variant="numberMd"
        color={value === 0 ? c.inkSubtle : c.ink}
        style={styles.value}
      ></Text>
      <Pressable onPress={() => onChange(value + 1)} style={styles.button}>
        <Icon name="add" size={20} strokeWidth={2} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.surfaceSunken,
    borderRadius: Radius.control,
  },
  button: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  value: { minWidth: 24, textAlign: "center" },
});
