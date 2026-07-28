import { View, StyleSheet } from 'react-native';
import { Text, Surface, Divider } from 'react-native-paper';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { brand } from '../../theme/theme';

const Row = ({ label, value, sub }) => (
  <View style={styles.row}>
    <Text variant="bodyMedium" style={styles.label}>
      {label}
    </Text>
    <View style={{ alignItems: 'flex-end', flexShrink: 1 }}>
      <Text variant="bodyMedium" style={styles.value} numberOfLines={1}>
        {value}
      </Text>
      {sub && (
        <Text variant="labelSmall" style={styles.sub} numberOfLines={1}>
          {sub}
        </Text>
      )}
    </View>
  </View>
);

// Mirrors frontend/src/components/dashboard/HighlightsCard.jsx
const HighlightsCard = ({ summary }) => (
  <Surface style={styles.card} elevation={1}>
    <Text variant="titleMedium" style={styles.title}>
      Highlights
    </Text>
    <Divider style={{ marginVertical: 8 }} />
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
  </Surface>
);

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 16, backgroundColor: '#FFFFFF' },
  title: { fontWeight: '700', color: brand.navy },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  label: { color: '#64748B', flexShrink: 1, marginRight: 8 },
  value: { fontWeight: '600' },
  sub: { color: '#94A3B8' },
});

export default HighlightsCard;
