import { Colors } from "@/constants/theme";
import { ColorValue } from "react-native";
import Svg, { Circle, G, Path, Rect } from "react-native-svg";

const ICONS = {
  home: <Path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
  cupboard: (
    <>
      <Rect x={3} y={3} width={7} height={7} rx={1.5} />
      <Rect x={14} y={3} width={7} height={7} rx={1.5} />
      <Rect x={3} y={14} width={7} height={7} rx={1.5} />
      <Rect x={14} y={14} width={7} height={7} rx={1.5} />
    </>
  ),
  list: (
    <>
      <Path d="M10 6h10M10 12h10M10 18h10" />
      <Path d="M4 6l1.2 1.2L7.5 5M4 12l1.2 1.2L7.5 11M4 18l1.2 1.2L7.5 17" />
    </>
  ),
  budget: (
    <>
      <Path d="M12 3a9 9 0 1 0 9 9h-9z" />
      <Path d="M15 3.5A9 9 0 0 1 20.5 9H15z" />
    </>
  ),
  add: <Path d="M12 5v14M5 12h14" />,
  minus: <Path d="M5 12h14" />,
  back: <Path d="M15 6l-6 6 6 6" />,
  chevron: <Path d="M9 6l6 6-6 6" />,
  arrow: <Path d="M5 12h14M13 6l6 6-6 6" />,
  close: <Path d="M6 6l12 12M18 6L6 18" />,
  check: <Path d="M5 12.5l4.5 4.5L19 7.5" />,
  search: (
    <>
      <Circle cx={11} cy={11} r={7} />
      <Path d="M20 20l-3.5-3.5" />
    </>
  ),
  store: (
    <>
      <Path d="M3 9l1.5-5h15L21 9" />
      <Path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z" />
      <Path d="M5 13v7h14v-7" />
    </>
  ),
  bell: (
    <>
      <Path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <Path d="M10 21a2 2 0 0 0 4 0" />
    </>
  ),
  user: (
    <>
      <Circle cx={12} cy={8} r={4} />
      <Path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  printer: (
    <>
      <Path d="M6 9V3h12v6" />
      <Rect x={3} y={9} width={18} height={8} rx={2} />
      <Path d="M7 14h10v7H7z" />
    </>
  ),
  pin: (
    <>
      <Path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
      <Circle cx={12} cy={9.5} r={2.5} />
    </>
  ),
  lock: (
    <>
      <Rect x={5} y={11} width={14} height={10} rx={2} />
      <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  eye: (
    <>
      <Path d="M2 12c1-2.5 5-7 10-7s9 4.5 10 7c-1 2.5-5 7-10 7S3 14.5 2 12z" />
      <Circle cx={12} cy={12} r={3} />
    </>
  ),
  eyeOff: (
    <>
      <Path d="M3 3l18 18" />
      <Path d="M10.6 5.1A9.8 9.8 0 0 1 12 5c5 0 9 4.5 10 7a12.6 12.6 0 0 1-3 4.2M6.6 6.6C4.4 8 2.8 10.2 2 12c1 2.5 5 7 10 7a9.6 9.6 0 0 0 5.4-1.6" />
      <Path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </>
  ),
  mail: (
    <>
      <Rect x={3} y={5} width={18} height={14} rx={2} />
      <Path d="M3 7l9 6 9-6" />
    </>
  ),
  logout: (
    <>
      <Path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <Path d="M10 17l-5-5 5-5" />
      <Path d="M5 12h11" />
    </>
  ),
  clock: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 7v5l3 2" />
    </>
  ),
};

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  size?: number;
  color?: ColorValue;
  strokeWidth?: number;
};

export const Icon = ({
  name,
  size = 24,
  color = Colors.light.ink,
  strokeWidth = 1.8,
}: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </G>
  </Svg>
);
