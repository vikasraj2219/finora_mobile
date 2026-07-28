import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Mirrors frontend/src/components/common/StatCard.jsx — icon chip + label + big value + subtext.
const StatCard = ({ icon = 'circle-outline', label, value, subtext, color = '#0B2643' }) => (
  <Surface style={styles.card} elevation={1}>
    <View style={styles.headerRow}>
      <View style={[styles.iconWrap, { backgroundColor: `${color}1A` }]}>
        <MaterialCommunityIcons name={icon} size={18} color={color} />
      </View>
      <Text variant="bodyMedium" style={styles.label}>
        {label}
      </Text>
    </View>
    <Text variant="headlineSmall" style={[styles.value, { color }]}>
      {value}
    </Text>
    {subtext && (
      <Text variant="bodySmall" style={styles.subtext}>
        {subtext}
      </Text>
    )}
  </Surface>
);

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 16, backgroundColor: '#FFFFFF', flex: 1, minWidth: 150 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  label: { color: '#64748B', flexShrink: 1 },
  value: { fontWeight: '700' },
  subtext: { color: '#94A3B8', marginTop: 4 },
});

export default StatCard;
