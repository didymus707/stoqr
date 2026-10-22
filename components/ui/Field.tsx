import { Colors } from "@/constants/theme";
import { ComponentProps } from "react";
import { TextField } from "./TextField";
import { StyleSheet, View } from "react-native";
import { Text } from "./Text";

const c = Colors.light;

type Props = ComponentProps<typeof TextField> & {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string | null;
};

export function Field({
  label,
  required,
  hint,
  error,
  invalid,
  accessibilityLabel,
  ...input
}: Props) {
  return (
    <View style={styles.field}>
      <Text variant="label">
        {label}
        {required ? (
          <Text variant="label" color={c.accentText}>
            {" "}
            *
          </Text>
        ) : null}
      </Text>
      <TextField
        {...input}
        invalid={!!error || invalid}
        accessibilityLabel={
          accessibilityLabel ?? (required ? `${label}, required` : label)
        }
      />
      {error ? (
        <Text variant="caption" color={c.accentText}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color={c.inkMuted}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
});
