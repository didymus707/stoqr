import { Colors, Radius, Type } from "@/constants/theme";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Icon } from "./Icon";
import { Text } from "./Text";

const c = Colors.light;

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  label: string;
  typeable?: boolean;
};

export const Stepper = ({
  value,
  onChange,
  min = 0,
  label,
  typeable,
}: Props) => {
  // what's in the box while typing; null means show value
  const [draft, setDraft] = useState<string | null>(null);
  const atMin = value <= min;
  const valueColor = value === 0 ? c.inkSubtle : c.ink;

  const step = (next: number) => {
    setDraft(null);
    onChange(next);
  };

  const handleType = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "");
    setDraft(digits);
    // an empty box keeps the last number until they type again
    if (digits !== "") onChange(Math.max(min, Number(digits)));
  };

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ now: value }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === "decrement" && !atMin) step(value - 1);
        if (e.nativeEvent.actionName === "increment") step(value + 1);
      }}
    >
      <Pressable
        onPress={() => step(value - 1)}
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
      {typeable ? (
        <TextInput
          value={draft ?? String(value)}
          onChangeText={handleType}
          onBlur={() => setDraft(null)}
          keyboardType="number-pad"
          selectTextOnFocus
          maxLength={4}
          style={[styles.value, styles.input, { color: valueColor }]}
        />
      ) : (
        <Text variant="numberMd" color={valueColor} style={styles.value}>
          {value}
        </Text>
      )}
      <Pressable onPress={() => step(value + 1)} style={styles.button}>
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
  input: {
    minWidth: 40,
    height: 44,
    padding: 0,
    fontFamily: Type.numberMd.fontFamily,
    fontSize: Type.numberMd.fontSize,
  },
});
