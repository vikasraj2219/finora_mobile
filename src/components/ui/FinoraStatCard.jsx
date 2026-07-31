import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FinoraCard from './FinoraCard';
import tokens from '../../theme/tokens';

// Redesigned stat card — same data contract as the old common/StatCard so it
// drops in wherever that was used, but with the new type scale/tokens.
const FinoraStatCard = ({ icon = 'circle-outline', label, value, subtext, tone = 'brand' }) => {
  const color = tokens.semantic[tone] || tokens.brand.ink800;
  return (
    <FinoraCard style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: `${color}17` }]}>
          <MaterialCommunityIcons name={icon} size={16} color={color} />
        </View>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={[styles.value, { color: tokens.neutral.textPrimary }]} numberOfLines={1}>
        {value}
      </Text>
      {subtext && (
        <Text style={styles.subtext} numberOfLines={1}>
          {subtext}
        </Text>
      )}
    </FinoraCard>
  );
};

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 150 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconWrap: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  label: { ...tokens.typography.bodySm, color: tokens.neutral.textSecondary, flexShrink: 1 },
  value: { ...tokens.typography.h2 },
  subtext: { ...tokens.typography.caption, color: tokens.neutral.textMuted, marginTop: 4 },
});

export default FinoraStatCard;
