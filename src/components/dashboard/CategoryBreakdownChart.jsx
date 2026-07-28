import { View, StyleSheet } from 'react-native';
import { Text, Surface, SegmentedButtons } from 'react-native-paper';
import { formatCurrency } from '../../utils/formatters';
import { brand } from '../../theme/theme';

// Mirrors frontend/src/components/dashboard/CategoryBreakdownChart.jsx — ranked
// category list with a colored progress bar per category's share of the total.
const CategoryBreakdownChart = ({ breakdown, type, onTypeChange }) => (
  <Surface style={styles.card} elevation={1}>
    <View style={styles.headerRow}>
      <Text variant="titleMedium" style={styles.title}>
        Category Breakdown
      </Text>
    </View>
    <SegmentedButtons
      value={type}
      onValueChange={onTypeChange}
      style={{ marginBottom: 12 }}
      buttons={[
        { value: 'expense', label: 'Expense' },
        { value: 'income', label: 'Income' },
      ]}
    />
    {breakdown.length === 0 ? (
      <Text variant="bodyMedium" style={styles.empty}>
        No {type} transactions yet
      </Text>
    ) : (
      breakdown.slice(0, 8).map((c) => (
        <View key={c.categoryId} style={styles.row}>
          <View style={styles.rowHeader}>
            <View style={styles.labelRow}>
              <View style={[styles.dot, { backgroundColor: c.color }]} />
              <Text variant="bodyMedium">{c.name}</Text>
            </View>
            <Text variant="bodyMedium" style={styles.amount}>
              {formatCurrency(c.total)}
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${c.percentage}%`, backgroundColor: c.color }]} />
          </View>
          <Text variant="labelSmall" style={styles.pct}>
            {c.percentage}%
          </Text>
        </View>
      ))
    )}
  </Surface>
);

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 16, backgroundColor: '#FFFFFF' },
  headerRow: { marginBottom: 8 },
  title: { fontWeight: '700', color: brand.navy },
  empty: { color: '#94A3B8', paddingVertical: 12 },
  row: { marginBottom: 14 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  amount: { fontWeight: '600' },
  track: { height: 6, borderRadius: 3, backgroundColor: '#F1F5F9', overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  pct: { color: '#94A3B8', marginTop: 2 },
});

export default CategoryBreakdownChart;
