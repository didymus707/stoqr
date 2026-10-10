import { Colors, Fonts } from "@/constants/theme";
import { StyleSheet, TextStyle, View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { Text } from "./Text";

const c = Colors.light;

type Props = {
  size?: number;
  variant?: "lockup" | "mark" | "wordmark";
};

export const Logo = ({ size = 40, variant = "lockup" }: Props) => {
  const wordStyle: TextStyle = {
    fontFamily: Fonts.display,
    fontSize: Math.round(size * 0.65),
    lineHeight: Math.round(size * 0.8),
    letterSpacing: -size * 0.02,
  };

  return (
    <View
      style={[styles.row, { gap: Math.round(size * 0.25) }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel="stoQr"
    >
      {variant !== "wordmark" ? (
        <View
          style={[
            styles.tile,
            { width: size, height: size, borderRadius: Math.round(size * 34) },
          ]}
        >
          <Svg width={size * 0.66} height={size * 0.66} viewBox="0 0 24 24">
            <Rect
              x={3}
              y={3}
              width={13}
              height={13}
              rx={2.5}
              fill="none"
              stroke={c.onInverse}
              strokeWidth={2.4}
            />
            <Rect x={7} y={7} width={5} height={5} rx={1} fill={c.onInverse} />
            <Rect x={16} y={16} width={5} height={5} rx={1} fill={c.accent} />
          </Svg>
        </View>
      ) : null}

      {variant !== "mark" ? (
        <Text style={wordStyle}>
          sto
          <Text style={wordStyle} color={c.accent}>
            Q
          </Text>
          r
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  tile: {
    backgroundColor: c.inverse,
    alignItems: "center",
    justifyContent: "center",
  },
});
