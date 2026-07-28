import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { formatCurrency } from '../../utils/formatters';
import { brand } from '../../theme/theme';

// Mirrors frontend/src/components/dashboard/IncomeExpenseTrendChart.jsx — grouped
// income/expense bars per month. Built from plain Views rather than a charting
// library so Phase 2 doesn't introduce another native dependency to debug.
const IncomeExpenseTrendChart = ({ trends }) => {
  const max = Math.max(1, ...trends.map((t) => Math.max(t.income, t.expense)));

  return (
    <Surface style={styles.card} elevation={1}>
      <Text variant="titleMedium" style={styles.title}>
        Income vs Expense
      </Text>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#22C55E' }]} />
          <Text variant="bodySmall">Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
          <Text variant="bodySmall">Expense</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartRow}>
          {trends.map((t) => (
            <View key={t.label} style={styles.monthCol}>
              <View style={styles.barGroup}>
                <View style={[styles.bar, { height: (t.income / max) * 100, backgroundColor: '#22C55E' }]} />
                <View style={[styles.bar, { height: (t.expense / max) * 100, backgroundColor: '#EF4444' }]} />
              </View>
              <Text variant="labelSmall" style={styles.monthLabel}>
                {t.label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 16, backgroundColor: '#FFFFFF' },
  title: { fontWeight: '700', color: brand.navy, marginBottom: 8 },
  legendRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', height: 140, paddingTop: 8 },
  monthCol: { width: 56, alignItems: 'center' },
  barGroup: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 4 },
  bar: { width: 12, borderRadius: 3, minHeight: 2 },
  monthLabel: { color: '#94A3B8', marginTop: 6 },
});

export default IncomeExpenseTrendChart;
