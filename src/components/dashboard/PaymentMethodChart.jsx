import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { formatCurrency } from '../../utils/formatters';
import { brand } from '../../theme/theme';

const COLORS = [brand.navy, brand.teal, '#3B82F6', '#F59E0B', '#EC4899', brand.navyLight];

// Mirrors frontend/src/components/dashboard/PaymentMethodChart.jsx
const PaymentMethodChart = ({ distribution }) => {
  const total = distribution.reduce((sum, d) => sum + d.total, 0) || 1;

  return (
    <Surface style={styles.card} elevation={1}>
      <Text variant="titleMedium" style={styles.title}>
        Payment Method Split
      </Text>
      {distribution.length === 0 ? (
        <Text variant="bodyMedium" style={styles.empty}>
          No data yet
        </Text>
      ) : (
        distribution.map((d, i) => {
          const pct = Math.round((d.total / total) * 100);
          const color = COLORS[i % COLORS.length];
          return (
            <View key={d.method} style={styles.row}>
              <View style={styles.rowHeader}>
                <View style={styles.labelRow}>
                  <View style={[styles.dot, { backgroundColor: color }]} />
                  <Text variant="bodyMedium" style={{ textTransform: 'capitalize' }}>
                    {d.method}
                  </Text>
                </View>
                <Text variant="bodyMedium" style={styles.amount}>
                  {formatCurrency(d.total)}
                </Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
              </View>
            </View>
          );
        })
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 16, backgroundColor: '#FFFFFF' },
  title: { fontWeight: '700', color: brand.navy, marginBottom: 8 },
  empty: { color: '#94A3B8', paddingVertical: 12 },
  row: { marginBottom: 12 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  amount: { fontWeight: '600' },
  track: { height: 6, borderRadius: 3, backgroundColor: '#F1F5F9', overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
});

export default PaymentMethodChart;
