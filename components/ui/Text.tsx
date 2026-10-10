import { Colors, Type } from "@/constants/theme";
import { Text as RNText, TextProps } from "react-native";

type Props = TextProps & {
  variant?: keyof typeof Type;
  color?: string;
};

export const Text = ({
  variant = "body",
  color = Colors.light.ink,
  style,
  ...rest
}: Props) => <RNText {...rest} style={[Type[variant], { color }, style]} />;
