import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { brand } from '../../theme/theme';

// Mirrors frontend/src/components/common/StatCard.jsx — icon, label, value, optional subtext.
const StatCard = ({ icon, label, value, color = brand.navy, subtext, style }) => (
  <View style={[styles.card, style]}>
    <View style={styles.headerRow}>
      {icon && (
        <View style={[styles.iconWrap, { backgroundColor: `${color}1A` }]}>
          <MaterialCommunityIcons name={icon} size={18} color={color} />
        </View>
      )}
      <Text variant="bodySmall" style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
    <Text variant="titleLarge" style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
      {value}
    </Text>
    {subtext && (
      <Text variant="bodySmall" style={styles.subtext}>
        {subtext}
      </Text>
    )}
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
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  label: { color: '#64748B', flexShrink: 1 },
  value: { fontWeight: '700', color: brand.navy },
  subtext: { color: '#94A3B8', marginTop: 2 },
});

export default StatCard;
