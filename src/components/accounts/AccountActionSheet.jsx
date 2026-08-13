import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FinoraBottomSheet from '../ui/FinoraBottomSheet';
import tokens from '../../theme/tokens';

// Replaces the old dots-menu Menu popup — brief §7 explicitly asks for a
// bottom sheet for account actions (View / Edit / Archive / Delete).
const AccountActionSheet = ({ visible, account, accountType, onClose, onViewTransactions, onEdit, onToggleActive, onRecalculate, onDelete }) => {
  if (!account) return null;

  const actions = [
    { key: 'view', label: 'View Transactions', icon: 'swap-horizontal', onPress: onViewTransactions },
    { key: 'edit', label: 'Edit Account', icon: 'pencil-outline', onPress: onEdit },
    ...(accountType === 'bank'
      ? [{ key: 'recalculate', label: 'Fix Balance', icon: 'calculator-variant-outline', onPress: onRecalculate }]
      : []),
    {
      key: 'toggle',
      label: account.isActive ? 'Archive Account' : 'Reactivate Account',
      icon: account.isActive ? 'archive-outline' : 'restore',
      onPress: onToggleActive,
    },
    { key: 'delete', label: 'Delete Account', icon: 'trash-can-outline', tone: 'error', onPress: onDelete },
  ];

  return (
    <FinoraBottomSheet visible={visible} onClose={onClose} title={<Text style={styles.title}>{account.bankName || account.nickname || account.provider}</Text>}>
      {actions.map((a) => (
        <Pressable
          key={a.key}
          style={styles.row}
          onPress={() => {
            onClose();
            a.onPress();
          }}
        >
          <MaterialCommunityIcons name={a.icon} size={19} color={a.tone === 'error' ? tokens.semantic.error : tokens.neutral.textPrimary} />
          <Text style={[styles.rowLabel, a.tone === 'error' && { color: tokens.semantic.error }]}>{a.label}</Text>
        </Pressable>
      ))}
    </FinoraBottomSheet>
  );
};

const styles = StyleSheet.create({
  title: { ...tokens.typography.h3, color: tokens.neutral.textPrimary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: tokens.neutral.border },
  rowLabel: { ...tokens.typography.bodyLg, color: tokens.neutral.textPrimary, fontWeight: '600' },
});

export default AccountActionSheet;
