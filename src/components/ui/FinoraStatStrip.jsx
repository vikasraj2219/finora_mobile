import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/formatters';
import tokens from '../../theme/tokens';

// Premium dark stat strip — ink800 surface with three figures (in / out / net)
// separated by hairlines, teal accent on the icons. Used at the top of
// Transactions so the list has real context instead of opening straight into
// rows. No native gradient dependency: the "depth" comes from the shadow +
// a slightly lighter ink700 inner panel, not an actual gradient asset.
const FinoraStatStrip = ({ income = 0, expense = 0, label = 'This month' }) => {
  const net = income - expense;
  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        <View style={[styles.netPill, { backgroundColor: net >= 0 ? 'rgba(26,163,104,0.18)' : 'rgba(229,83,61,0.18)' }]}>
          <MaterialCommunityIcons name={net >= 0 ? 'trending-up' : 'trending-down'} size={12} color={net >= 0 ? tokens.semantic.income : tokens.semantic.expense} />
          <Text style={[styles.netPillText, { color: net >= 0 ? tokens.semantic.income : tokens.semantic.expense }]}>
            {net >= 0 ? '+' : ''}
            {formatCurrency(net)}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <View style={[styles.iconDot, { backgroundColor: 'rgba(26,163,104,0.16)' }]}>
            <MaterialCommunityIcons name="arrow-bottom-left" size={13} color={tokens.semantic.income} />
          </View>
          <View>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statValue}>{formatCurrency(income)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.stat}>
          <View style={[styles.iconDot, { backgroundColor: 'rgba(229,83,61,0.16)' }]}>
            <MaterialCommunityIcons name="arrow-top-right" size={13} color={tokens.semantic.expense} />
          </View>
          <View>
            <Text style={styles.statLabel}>Expense</Text>
            <Text style={styles.statValue}>{formatCurrency(expense)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: tokens.brand.ink800,
    borderRadius: tokens.radius.xl,
    padding: tokens.space.lg,
    ...tokens.shadow.medium,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.space.md },
  label: { ...tokens.typography.label, color: 'rgba(255,255,255,0.55)' },
  netPill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: tokens.radius.pill },
  netPillText: { fontSize: 11, fontWeight: '700' },

  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconDot: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.55)' },
  statValue: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 1 },
  divider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: tokens.space.md },
});

export default FinoraStatStrip;
