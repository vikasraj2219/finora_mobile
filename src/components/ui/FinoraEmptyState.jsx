import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FinoraButton from './FinoraButton';
import tokens from '../../theme/tokens';

// Redesigned empty state — same contract as common/EmptyState (kept for the
// screens not yet migrated) but on the new token system.
const FinoraEmptyState = ({ icon = 'tray-outline', title, description, actionLabel, onAction }) => (
  <View style={styles.container}>
    <View style={styles.iconWrap}>
      <MaterialCommunityIcons name={icon} size={30} color={tokens.brand.ink800} />
    </View>
    <Text style={styles.title}>{title}</Text>
    {description && <Text style={styles.description}>{description}</Text>}
    {actionLabel && onAction && (
      <FinoraButton label={actionLabel} onPress={onAction} style={{ marginTop: tokens.space.lg }} />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: tokens.space.xxl },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: tokens.brand.teal100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.space.lg,
  },
  title: { ...tokens.typography.h3, color: tokens.neutral.textPrimary, textAlign: 'center' },
  description: {
    ...tokens.typography.body,
    color: tokens.neutral.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
});

export default FinoraEmptyState;
