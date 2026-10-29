import { Colors } from "@/constants/theme";
import { Switch, SwitchProps } from "react-native";

const c = Colors.light;

type Props = Omit<
  SwitchProps,
  "trackColor" | "thumbColor" | "ios_backgroundColor"
>;

export const Toggle = (props: Props) => (
  <Switch
    {...props}
    trackColor={{ false: c.lineStrong, true: c.inverse }}
    thumbColor={c.surfaceRaised}
    ios_backgroundColor={c.lineStrong}
  />
);
