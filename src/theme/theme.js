import { MD3LightTheme } from 'react-native-paper';

// Mirrors frontend/src/theme/palette.js exactly — same navy + teal brand tokens.
export const brand = {
  navy: '#0B2643',
  navyDark: '#071A30',
  navyLight: '#123A63',
  teal: '#12A59D',
  tealLight: '#3FC7BE',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  bg: '#F5F7FA',
  paper: '#FFFFFF',
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brand.navy,
    onPrimary: '#FFFFFF',
    secondary: brand.teal,
    onSecondary: '#FFFFFF',
    background: brand.bg,
    surface: brand.paper,
    error: brand.error,
  },
  roundness: 3,
};

export default theme;
