import { View, Text, StyleSheet, Pressable } from 'react-native';
import tokens from '../../theme/tokens';

// Consistent "Section title ... View all" pattern used across Home, Accounts,
// Transactions, Categories — replaces one-off Typography+Stack combos.
const FinoraSectionHeader = ({ title, actionLabel, onActionPress, style }) => (
  <View style={[styles.row, style]}>
    <Text style={styles.title}>{title}</Text>
    {actionLabel && (
      <Pressable onPress={onActionPress} hitSlop={8}>
        <Text style={styles.action}>{actionLabel}</Text>
      </Pressable>
    )}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.space.md,
  },
  title: { ...tokens.typography.h3, color: tokens.neutral.textPrimary },
  action: { ...tokens.typography.bodySm, color: tokens.brand.teal600, fontWeight: '700' },
});

export default FinoraSectionHeader;
