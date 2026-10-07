import { Icon, IconName } from "./Icon";
import { Colors, Fonts, Radius } from "@/constants/theme";
import { useState } from "react";
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { Text } from "./Text";

const c = Colors.light;

type Props = TextInputProps & {
  icon?: IconName;
  prefix?: string;
  invalid?: boolean;
  size?: "sm" | "md";
  mono?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export const TextField = ({
  icon,
  prefix,
  invalid,
  size = "md",
  mono,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...rest
}: Props) => {
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.box,
        size === "sm" && styles.boxSm,
        focused && styles.focused,
        invalid && styles.invalid,
        containerStyle,
      ]}
    >
      {icon && <Icon name={icon} size={20} color={c.accent} />}
      {prefix && <Text variant="price">{prefix}</Text>}
      <TextInput
        {...rest}
        placeholderTextColor={c.inkSubtle}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[styles.input, mono && styles.mono, style]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    gap: 10,
    height: 52,
    borderWidth: 1,
    flexDirection: "row",
    borderColor: c.line,
    alignItems: "center",
    paddingHorizontal: 14,
    borderRadius: Radius.field,
    backgroundColor: c.surfaceRaised,
  },
  boxSm: {
    gap: 4,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: Radius.control,
  },
  focused: { borderColor: c.accent },
  invalid: { borderColor: c.accent, borderWidth: 1.5 },
  input: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    padding: 0,
    fontFamily: Fonts.body,
    fontSize: 16,
    color: c.ink,
  },
  mono: { fontFamily: Fonts.mono, fontSize: 15 },
});
