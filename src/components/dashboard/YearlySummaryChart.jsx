import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Chip } from 'react-native-paper';
import { formatCurrency } from '../../utils/formatters';
import { brand } from '../../theme/theme';

// Mirrors frontend/src/components/dashboard/YearlySummaryChart.jsx
const YearlySummaryChart = ({ data, year, onYearChange, years }) => {
  const max = Math.max(1, ...data.months.map((m) => Math.max(m.income, m.expense)));

  return (
    <Surface style={styles.card} elevation={1}>
      <View style={styles.headerRow}>
        <Text variant="titleMedium" style={styles.title}>
          Yearly Summary
        </Text>
        <View style={styles.chipRow}>
          {years.map((y) => (
            <Chip key={y} compact selected={y === year} onPress={() => onYearChange(y)} style={styles.chip}>
              {y}
            </Chip>
          ))}
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartRow}>
          {data.months.map((m) => (
            <View key={m.month} style={styles.monthCol}>
              <View style={styles.barGroup}>
                <View style={[styles.bar, { height: (m.income / max) * 90, backgroundColor: '#22C55E' }]} />
                <View style={[styles.bar, { height: (m.expense / max) * 90, backgroundColor: '#EF4444' }]} />
              </View>
              <Text variant="labelSmall" style={styles.monthLabel}>
                {m.label}
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 },
  title: { fontWeight: '700', color: brand.navy },
  chipRow: { flexDirection: 'row', gap: 6 },
  chip: { height: 32 },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', height: 130 },
  monthCol: { width: 40, alignItems: 'center' },
  barGroup: { flexDirection: 'row', alignItems: 'flex-end', height: 90, gap: 3 },
  bar: { width: 10, borderRadius: 2, minHeight: 2 },
  monthLabel: { color: '#94A3B8', marginTop: 6 },
});

export default YearlySummaryChart;
