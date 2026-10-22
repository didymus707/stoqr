import { ComponentProps, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Colors } from "@/constants/theme";
import { Field } from "./Field";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import { Text } from "./Text";

const c = Colors.light;

type Props = Omit<ComponentProps<typeof Field>, "secureTextEntry" | "trailing">;

export function PasswordField(props: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <Field
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
      secureTextEntry={!visible}
      trailing={
        <IconButton
          icon={visible ? "eyeOff" : "eye"}
          label={visible ? "Hide password" : "Show password"}
          variant="ghost"
          iconSize={20}
          onPress={() => setVisible((v) => !v)}
          style={styles.eye}
        />
      }
    />
  );
}

export const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
];

export const passwordIsStrong = (p: string) =>
  PASSWORD_RULES.every((rule) => rule.test(p));

export function PasswordChecks({ password }: { password: string }) {
  return (
    <View style={styles.checks}>
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <View key={rule.label} style={styles.check}>
            <Icon
              name={ok ? "check" : "minus"}
              size={14}
              strokeWidth={2.5}
              color={ok ? c.ok : c.inkSubtle}
            />
            <Text variant="caption" color={ok ? c.ok : c.inkMuted}>
              {rule.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  eye: { marginRight: -10 },
  checks: { gap: 4, marginTop: -2 },
  check: { flexDirection: "row", alignItems: "center", gap: 6 },
});
