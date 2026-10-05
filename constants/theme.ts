export const Colors = {
  primary: "#4F46E5",
  background: "#FFFFFF",
  surface: "#F9FAFB",
  border: "#E5E7EB",
  text: {
    primary: "#111827",
    secondary: "#6B7280",
    muted: "#9CA3AF",
  },
  status: {
    success: "#059669",
    warning: "#D97706",
    danger: "#DC2626",
  },
  light: {
    surface: "#F3F0E8",
    surfaceRaised: "#FFFFFF",
    surfaceSunken: "#F3F0E8",
    line: "#E2DDD2",
    lineSoft: "#EEEAE1",
    lineStrong: "#C9C2B3",
    ink: "#17171B",
    inkMuted: "#5E5B55",
    inkSubtle: "#6B675F",
    inverse: "#17171B",
    inverseRaised: "#2A2925",
    onInverse: "#FFFFFF",
    onInverseMuted: "#B9B5AC",
    onAccent: "#FFFFFF",
    accent: "#C2410C",
    accentSoft: "#FBE3D6",
    accentText: "#9A3412",
    ok: "#2F5D34",
    okSoft: "#E3EEDF",
    chart1: "#17171B",
    chart2: "#C2410C",
    chart3: "#8A857B",
    chart4: "#D6D0C3",
  },
  dark: {
    surface: "#161614",
    surfaceRaised: "#201F1C",
    surfaceSunken: "#2A2925",
  },
};

export const FontSize = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
};

export const Spacing = {
  s4: 4,
  s8: 8,
  s12: 12,
  s16: 16,
  s20: 20,                                                   
  s24: 24,
  s28: 28,
  s32: 32,
  s36: 36,
  s40: 40,
  s44: 44,
  s48: 48,
};

export const Radius = {
  sm: 4,
  md: 8,
  control: 12,
  button: 16,
  card: 20,
  hero:24,
  pill: 999,
};

export const Fonts = {
  display: "BricolageGrotesque-ExtraBold",
  displaySemi: "BricolageGrotesque-SemiBold",
  body: "IBMPlexSans-Regular",
  bodyMedium: "IBMPlexSans-Medium",
  bodySemi: "IBMPlexSans-SemiBold",
  mono: "IBMPlexMono-Medium",
};

export const Type = {
  display: {
    fontFamily: Fonts.display,
    fontSize: 44,
    lineHeight: 44,
    letterSpacing: -1.3,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  titleSm: {
    fontFamily: Fonts.display,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.6,
  },
  numberXl: {
    fontFamily: Fonts.display,
    fontSize: 56,
    lineHeight: 56,
    letterSpacing: -1.7,
  },
  numberLg: {
    fontFamily: Fonts.display,
    fontSize: 48,
    lineHeight: 48,
    letterSpacing: -1.4,
  },
  numberMd: { fontFamily: Fonts.display, fontSize: 18, lineHeight: 22 },
  heading: { fontFamily: Fonts.bodySemi, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: Fonts.body, fontSize: 16, lineHeight: 24 },
  item: { fontFamily: Fonts.bodySemi, fontSize: 15, lineHeight: 20 },
  bodySm: { fontFamily: Fonts.body, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: Fonts.bodySemi, fontSize: 13, lineHeight: 18 },
  overline: {
    fontFamily: Fonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
  },
  caption: { fontFamily: Fonts.body, fontSize: 12, lineHeight: 16 },
  price: { fontFamily: Fonts.mono, fontSize: 15, lineHeight: 20 },
  code: { fontFamily: Fonts.mono, fontSize: 12, lineHeight: 16 },
};
