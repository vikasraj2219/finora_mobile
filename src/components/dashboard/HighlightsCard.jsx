import { View, StyleSheet } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { brand } from '../../theme/theme';
import { formatCurrency, formatDate } from '../../utils/formatters';

const Row = ({ label, value, sub }) => (
  <View style={styles.row}>
    <Text variant="bodyMedium" style={styles.rowLabel}>
      {label}
    </Text>
    <View style={{ alignItems: 'flex-end', flexShrink: 1, marginLeft: 12 }}>
      <Text variant="bodyMedium" style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
      {sub && (
        <Text variant="bodySmall" style={styles.rowSub} numberOfLines={1}>
          {sub}
        </Text>
      )}
    </View>
  </View>
);

// Mirrors frontend/src/components/dashboard/HighlightsCard.jsx
const HighlightsCard = ({ summary }) => (
  <View style={styles.card}>
    <Text variant="titleMedium" style={styles.heading}>
      Highlights
    </Text>
    <Divider style={{ marginBottom: 4 }} />
    <Row label="Today's Spending" value={formatCurrency(summary.todaySpending)} />
    <Row
      label="Expense Ratio"
      value={summary.expenseRatio === null ? '—' : `${summary.expenseRatio}%`}
      sub="of this month's income"
    />
    <Row
      label="Most Used Bank"
      value={summary.mostUsedBank?.name || '—'}
      sub={summary.mostUsedBank ? `${summary.mostUsedBank.transactionCount} transactions` : undefined}
    />
    <Row
      label="Most Used UPI"
      value={summary.mostUsedUpi?.name || '—'}
      sub={summary.mostUsedUpi ? `${summary.mostUsedUpi.transactionCount} transactions` : undefined}
    />
    <Row
      label="Top Category"
      value={summary.highestSpendingCategory?.name || '—'}
      sub={summary.highestSpendingCategory ? formatCurrency(summary.highestSpendingCategory.total) : undefined}
    />
    <Row
      label="Largest Expense"
      value={summary.largestExpense ? formatCurrency(summary.largestExpense.amount) : '—'}
      sub={
        summary.largestExpense
          ? `${summary.largestExpense.category || 'Uncategorized'} · ${formatDate(summary.largestExpense.date)}`
          : undefined
      }
    />
    <Row
      label="Largest Income"
      value={summary.largestIncome ? formatCurrency(summary.largestIncome.amount) : '—'}
      sub={
        summary.largestIncome
          ? `${summary.largestIncome.category || 'Uncategorized'} · ${formatDate(summary.largestIncome.date)}`
          : undefined
      }
    />
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: brand.paper,
    borderRadius: 12,
    padding: 14,
    shadowColor: '#0B2643',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  heading: { fontWeight: '700', color: brand.navy, marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  rowLabel: { color: '#64748B', flexShrink: 1 },
  rowValue: { fontWeight: '600', color: brand.navy },
  rowSub: { color: '#94A3B8' },
});

export default HighlightsCard;
