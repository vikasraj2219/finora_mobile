import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { brand } from '../../theme/theme';

// Shared card chrome for every dashboard widget — title (+ optional right-hand action slot,
// e.g. the Expense/Income toggle or the year picker) above the chart content.
const ChartCard = ({ title, action, children, style }) => (
  <View style={[styles.card, style]}>
    <View style={styles.headerRow}>
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>
      {action}
    </View>
    {children}
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', rowGap: 8 },
  title: { fontWeight: '700', color: brand.navy },
});

export default ChartCard;
