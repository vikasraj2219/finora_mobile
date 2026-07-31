import { View, Text, StyleSheet } from 'react-native';
import tokens from '../../theme/tokens';

// Semantic-color chip — pass `tone` (income/expense/transfer/savings/warning/
// pending/error) rather than a raw color, so every "Expense" chip in the app
// is the exact same coral, everywhere, forever.
const TONE_MAP = {
  income: { fg: tokens.semantic.income, bg: tokens.semantic.incomeTint },
  expense: { fg: tokens.semantic.expense, bg: tokens.semantic.expenseTint },
  transfer: { fg: tokens.semantic.transfer, bg: tokens.semantic.transferTint },
  savings: { fg: tokens.semantic.savings, bg: tokens.semantic.savingsTint },
  warning: { fg: tokens.semantic.warning, bg: tokens.semantic.warningTint },
  pending: { fg: tokens.semantic.pending, bg: tokens.semantic.pendingTint },
  error: { fg: tokens.semantic.error, bg: tokens.semantic.errorTint },
  neutral: { fg: tokens.neutral.textSecondary, bg: tokens.neutral.surfaceAlt },
  brand: { fg: tokens.brand.ink800, bg: `${tokens.brand.ink800}14` },
};

const FinoraChip = ({ label, tone = 'neutral', icon, style }) => {
  const colors = TONE_MAP[tone] || TONE_MAP.neutral;
  return (
    <View style={[styles.chip, { backgroundColor: colors.bg }, style]}>
      {icon}
      <Text style={[styles.label, { color: colors.fg, marginLeft: icon ? 4 : 0 }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: tokens.space.sm,
    paddingVertical: 4,
    borderRadius: tokens.radius.pill,
  },
  label: { fontSize: 11, fontWeight: '700' },
});

export default FinoraChip;
