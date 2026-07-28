import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { formatCurrency } from '../../utils/formatters';
import { brand } from '../../theme/theme';

// Mirrors frontend/src/components/dashboard/CashFlowChart.jsx — net cash flow per
// month, positive in teal, negative in red, centered on a zero baseline.
const CashFlowChart = ({ trends }) => {
  const max = Math.max(1, ...trends.map((t) => Math.abs(t.netFlow)));

  return (
    <Surface style={styles.card} elevation={1}>
      <Text variant="titleMedium" style={styles.title}>
        Net Cash Flow
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartRow}>
          {trends.map((t) => {
            const positive = t.netFlow >= 0;
            const heightPct = (Math.abs(t.netFlow) / max) * 50;
            return (
              <View key={t.label} style={styles.monthCol}>
                <View style={styles.barTrack}>
                  <View style={styles.zeroLine} />
                  {positive ? (
                    <View
                      style={[styles.bar, { height: `${heightPct}%`, bottom: '50%', backgroundColor: brand.teal }]}
                    />
                  ) : (
                    <View
                      style={[styles.bar, { height: `${heightPct}%`, top: '50%', backgroundColor: '#EF4444' }]}
                    />
                  )}
                </View>
                <Text variant="labelSmall" style={styles.monthLabel}>
                  {t.label}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 16, backgroundColor: '#FFFFFF' },
  title: { fontWeight: '700', color: brand.navy, marginBottom: 12 },
  chartRow: { flexDirection: 'row', alignItems: 'flex-start', height: 140 },
  monthCol: { width: 44, alignItems: 'center' },
  barTrack: { width: 16, height: 100, position: 'relative' },
  zeroLine: { position: 'absolute', top: '50%', left: 0, right: 0, height: 1, backgroundColor: '#E2E8F0' },
  bar: { position: 'absolute', width: 16, borderRadius: 3, left: 0 },
  monthLabel: { color: '#94A3B8', marginTop: 8 },
});

export default CashFlowChart;
