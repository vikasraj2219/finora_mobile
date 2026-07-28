import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { formatCurrency } from '../../utils/formatters';
import { brand } from '../../theme/theme';

// Mirrors frontend/src/components/dashboard/AccountUsageCard.jsx
const AccountUsageCard = ({ title, items }) => {
  const max = Math.max(1, ...items.map((i) => i.total));

  return (
    <Surface style={styles.card} elevation={1}>
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>
      {items.length === 0 ? (
        <Text variant="bodyMedium" style={styles.empty}>
          No usage yet
        </Text>
      ) : (
        items.slice(0, 6).map((i) => (
          <View key={i.id} style={styles.row}>
            <View style={styles.rowHeader}>
              <Text variant="bodyMedium" numberOfLines={1} style={{ flexShrink: 1 }}>
                {i.name}
              </Text>
              <Text variant="labelSmall" style={styles.count}>
                {i.count} txns
              </Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${(i.total / max) * 100}%` }]} />
            </View>
            <Text variant="labelSmall" style={styles.amount}>
              {formatCurrency(i.total)}
            </Text>
          </View>
        ))
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 16, backgroundColor: '#FFFFFF', flex: 1 },
  title: { fontWeight: '700', color: brand.navy, marginBottom: 8 },
  empty: { color: '#94A3B8', paddingVertical: 12 },
  row: { marginBottom: 12 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  count: { color: '#94A3B8' },
  track: { height: 6, borderRadius: 3, backgroundColor: '#F1F5F9', overflow: 'hidden', marginTop: 4 },
  fill: { height: 6, borderRadius: 3, backgroundColor: brand.teal },
  amount: { color: '#64748B', marginTop: 2 },
});

export default AccountUsageCard;
