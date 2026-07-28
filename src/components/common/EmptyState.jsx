import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { brand } from '../../theme/theme';

// Mirrors frontend/src/components/common/EmptyState.jsx
const EmptyState = ({ icon = 'information-outline', title, description, actionLabel, onAction }) => (
  <View style={styles.container}>
    <View style={styles.iconWrap}>
      <MaterialCommunityIcons name={icon} size={26} color="#64748B" />
    </View>
    <Text variant="titleMedium" style={styles.title}>
      {title}
    </Text>
    {description && (
      <Text variant="bodyMedium" style={styles.description}>
        {description}
      </Text>
    )}
    {actionLabel && onAction && (
      <Button mode="contained" onPress={onAction} style={styles.action}>
        {actionLabel}
      </Button>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { fontWeight: '700', color: brand.navy, textAlign: 'center' },
  description: { color: '#64748B', textAlign: 'center', marginTop: 4, maxWidth: 320 },
  action: { marginTop: 18, borderRadius: 8 },
});

export default EmptyState;
