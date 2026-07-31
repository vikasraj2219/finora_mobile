import { MD3LightTheme } from 'react-native-paper';
import tokens from './tokens';

// Back-compat export — every Phase 1-5 screen imports `{ brand }` from this
// file for quick colors (brand.navy, brand.teal, brand.bg, etc). Keep it
// working by mapping the old flat names onto the new token system, so this
// redesign doesn't require touching every existing screen's imports.
export const brand = {
  navy: tokens.brand.ink800,
  navyDark: tokens.brand.ink900,
  navyLight: tokens.brand.ink700,
  teal: tokens.brand.teal500,
  tealLight: tokens.brand.teal400,
  success: tokens.semantic.income,
  warning: tokens.semantic.warning,
  error: tokens.semantic.error,
  info: tokens.semantic.transfer,
  bg: tokens.neutral.bg,
  paper: tokens.neutral.surface,
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: tokens.brand.ink800,
    onPrimary: '#FFFFFF',
    secondary: tokens.brand.teal500,
    onSecondary: '#FFFFFF',
    background: tokens.neutral.bg,
    surface: tokens.neutral.surface,
    error: tokens.semantic.error,
  },
  roundness: 3,
};

export default theme;
