import { StyleSheet } from 'react-native';
import { SegmentedButtons, Text } from 'react-native-paper';
import ChartCard from './ChartCard';
import DonutWithLegend from './DonutWithLegend';

// Mirrors frontend/src/components/dashboard/CategoryBreakdownChart.jsx
const CategoryBreakdownChart = ({ breakdown, type, onTypeChange }) => (
  <ChartCard
    title="Category Breakdown"
    action={
      <SegmentedButtons
        value={type}
        onValueChange={onTypeChange}
        density="small"
        style={{ width: 190 }}
        buttons={[
          { value: 'expense', label: 'Expense' },
          { value: 'income', label: 'Income' },
        ]}
      />
    }
  >
    {breakdown.length === 0 ? (
      <Text style={styles.empty}>No {type} transactions with a category yet.</Text>
    ) : (
      <DonutWithLegend data={breakdown} colors={breakdown.map((b) => b.color)} />
    )}
  </ChartCard>
);

const styles = StyleSheet.create({
  empty: { color: '#64748B' },
});

export default CategoryBreakdownChart;
