import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { brand } from '../../theme/theme';

const EmptyState = ({ icon = 'tray-outline', title, description, actionLabel, onAction }) => (
  <View style={styles.container}>
    <View style={styles.iconWrap}>
      <MaterialCommunityIcons name={icon} size={32} color={brand.navy} />
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
      <Button mode="contained" onPress={onAction} style={{ marginTop: 16 }}>
        {actionLabel}
      </Button>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(11,38,67,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontWeight: '700', color: brand.navy, textAlign: 'center' },
  description: { color: '#64748B', textAlign: 'center', marginTop: 4 },
});

export default EmptyState;
