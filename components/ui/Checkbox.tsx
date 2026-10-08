import { Colors, Radius } from "@/constants/theme";
import { StyleSheet, View } from "react-native";
import { Icon } from "./Icon";

const c = Colors.light;

export const Checkbox = ({ checked }: { checked: boolean }) => (
  <View style={[styles.box, checked && styles.checked]}>
    {checked ? (
      <Icon name="check" size={16} strokeWidth={2.5} color={c.inverse} />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  box: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    alignItems: "center",
    borderRadius: Radius.sm,
    justifyContent: "center",
    borderColor: c.lineStrong,
    backgroundColor: c.surfaceRaised,
  },
  checked: {
    backgroundColor: c.inverse,
    borderColor: c.inverse,
  },
});
