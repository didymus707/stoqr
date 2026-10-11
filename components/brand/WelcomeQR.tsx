import { Colors, Radius } from "@/constants/theme";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Svg, { G, Path, Rect } from "react-native-svg";

const c = Colors.light;

const FINDERS = [
  [0, 0],
  [172, 0],
  [0, 172],
];

const MODULES = [
  [84, 4],
  [120, 4],
  [140, 24],
  [100, 44],
  [4, 88],
  [44, 88],
  [24, 128],
  [84, 84],
  [136, 84],
  [176, 96],
  [216, 84],
  [196, 128],
  [104, 128],
  [84, 172],
  [124, 196],
  [84, 216],
];

export const WelcomeQR = () => {
  const { width } = useWindowDimensions();
  const card = Math.min(300, width - 96);

  return (
    <View
      style={[styles.card, { width: card, height: card }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={card * 0.79} height={card * 0.79} viewBox="0 0 236 236">
        {FINDERS.map(([x, y]) => (
          <G key={`${x}-${y}`}>
            <Rect x={x} y={y} width={64} height={64} rx={12} fill={c.ink} />
            <Rect
              x={x + 10}
              y={y + 10}
              width={44}
              height={44}
              rx={7}
              fill={c.surfaceRaised}
            />
            <Rect
              x={x + 20}
              y={y + 20}
              width={24}
              height={24}
              rx={4}
              fill={c.ink}
            />
          </G>
        ))}
        {MODULES.map(([x, y]) => (
          <Rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={16}
            height={16}
            rx={3}
            fill={c.ink}
          />
        ))}
        <Rect x={160} y={160} width={76} height={76} rx={18} fill={c.accent} />
        <Path
          d="M183 198l10 10 20-22"
          fill="none"
          stroke={c.onAccent}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Rect
          x={-8}
          y={115}
          width={252}
          height={4}
          rx={2}
          fill={c.accent}
          opacity={0.85}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.surfaceRaised,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: Radius.hero + 8,
    transform: [{ rotate: "-4deg" }],
    shadowColor: c.ink,
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 24 },
    elevation: 6,
  },
});
