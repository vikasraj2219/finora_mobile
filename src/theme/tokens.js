// Finora Design System — single source of truth for every color, type scale,
// spacing step, radius, and shadow used across the app. No screen should
// hardcode a hex value or a magic spacing number outside this file.

// ---- Brand ----
// Kept navy + teal as the core brand color (rather than replacing it per the
// "complete creative freedom" option) because it's literally the app icon and
// splash screen — a different primary would immediately clash with them.
// Elevated into a fuller premium system: deeper ink tones for text hierarchy,
// a richer accent scale, and semantic colors used consistently everywhere
// (never ad-hoc reds/greens picked per-screen).
const brand = {
  ink900: '#071A30', // deepest navy — headlines, primary buttons
  ink800: '#0B2643', // primary brand navy (logo color)
  ink700: '#123A63',
  ink600: '#1D4E80',
  teal600: '#0E8F87',
  teal500: '#12A59D', // brand teal (logo color) — accents, active states
  teal400: '#3FC7BE',
  teal100: '#E3F7F5', // teal tint for subtle backgrounds/badges
};

// ---- Semantic colors ----
// One meaning per color, used consistently: never "just a nice red" — always
// "this is an expense" / "this is an error" etc.
const semantic = {
  income: '#1AA368', // positive green, calmer than pure #22C55E for a premium feel
  incomeTint: '#E6F7EF',
  expense: '#E5533D', // warm coral-red rather than an alarming pure red
  expenseTint: '#FDEAE7',
  transfer: '#6366F1', // indigo — distinct from both income/expense and brand teal
  transferTint: '#EEEEFD',
  savings: brand.teal500,
  savingsTint: brand.teal100,
  warning: '#D97706',
  warningTint: '#FEF3E2',
  pending: '#94A3B8',
  pendingTint: '#F1F5F9',
  error: '#DC2626',
  errorTint: '#FDECEC',
};

// ---- Neutrals ----
const neutral = {
  white: '#FFFFFF',
  bg: '#F7F8FA', // app background — slightly warmer than pure white/gray
  surface: '#FFFFFF', // card surface
  surfaceAlt: '#F1F4F8', // sunken surface (input fields, chips)
  border: '#E7EBF0',
  textPrimary: '#101828',
  textSecondary: '#5B677A',
  textMuted: '#94A0B2',
  textOnDark: '#FFFFFF',
};

// ---- Typography scale ----
// Sizes/weights only — screens compose these with react-native-paper's
// <Text> variant system isn't used directly here; components pull from this
// scale so every "H2" in the app is identical.
const typography = {
  display: { fontSize: 34, fontWeight: '700', letterSpacing: -0.5 },
  h1: { fontSize: 28, fontWeight: '700', letterSpacing: -0.3 },
  h2: { fontSize: 22, fontWeight: '700', letterSpacing: -0.2 },
  h3: { fontSize: 18, fontWeight: '700' },
  bodyLg: { fontSize: 16, fontWeight: '400' },
  body: { fontSize: 14, fontWeight: '400' },
  bodySm: { fontSize: 13, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '500' },
  button: { fontSize: 15, fontWeight: '700' },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
};

// ---- Spacing scale ----
const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 40 };

// ---- Radius ----
const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };

// ---- Elevation / shadow ----
// react-native's shadow props (iOS) + elevation (Android) bundled together so
// components get consistent depth instead of ad-hoc `elevation={1}` guesses.
const shadow = {
  none: {},
  low: {
    shadowColor: '#0B2643',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  medium: {
    shadowColor: '#0B2643',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  high: {
    shadowColor: '#0B2643',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 8,
  },
};

const tokens = { brand, semantic, neutral, typography, space, radius, shadow };

export default tokens;
