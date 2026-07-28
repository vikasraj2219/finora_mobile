import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import ChartCard from './ChartCard';
import { brand } from '../../theme/theme';
import { formatCurrency } from '../../utils/formatters';

const UsageBar = ({ label, count, total, max }) => (
  <View style={styles.row}>
    <View style={styles.rowHeader}>
      <Text variant="bodyMedium" style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text variant="bodySmall" style={styles.meta}>
        {count} txns · {formatCurrency(total)}
      </Text>
    </View>
    <ProgressBar progress={max > 0 ? total / max : 0} color={brand.teal} style={styles.bar} />
  </View>
);

// Mirrors frontend/src/components/dashboard/AccountUsageCard.jsx — shared by both
// Bank-wise and UPI-wise usage cards, `items` is whichever list is passed in.
const AccountUsageCard = ({ title, items }) => {
  const max = Math.max(...items.map((i) => i.total), 1);

  return (
    <ChartCard title={title}>
      {items.length === 0 ? (
        <Text style={styles.empty}>No usage data yet.</Text>
      ) : (
        items.map((item) => <UsageBar key={item.id} label={item.name} count={item.count} total={item.total} max={max} />)
      )}
    </ChartCard>
  );
};

const styles = StyleSheet.create({
  row: { marginBottom: 14 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontWeight: '600', color: brand.navy, flexShrink: 1, marginRight: 8 },
  meta: { color: '#94A3B8' },
  bar: { height: 7, borderRadius: 4, backgroundColor: '#EEF2F6' },
  empty: { color: '#64748B' },
});

export default AccountUsageCard;
