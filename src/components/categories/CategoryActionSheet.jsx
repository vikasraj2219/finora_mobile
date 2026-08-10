import { Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FinoraBottomSheet from '../ui/FinoraBottomSheet';
import tokens from '../../theme/tokens';

// Brief §10: Edit / Delete / Manage subcategories as available actions.
// "Manage subcategories" is the card's primary tap (drills straight in);
// this sheet covers the two secondary actions behind the kebab.
const CategoryActionSheet = ({ visible, category, onClose, onManageSubcategories, onEdit, onDelete }) => {
  if (!category) return null;
  const actions = [
    { key: 'manage', label: 'Manage Subcategories', icon: 'file-tree-outline', onPress: onManageSubcategories },
    { key: 'edit', label: 'Edit Category', icon: 'pencil-outline', onPress: onEdit },
    { key: 'delete', label: 'Delete Category', icon: 'trash-can-outline', tone: 'error', onPress: onDelete },
  ];
  return (
    <FinoraBottomSheet visible={visible} onClose={onClose} title={<Text style={styles.title}>{category.name}</Text>}>
      {actions.map((a) => (
        <Pressable key={a.key} style={styles.row} onPress={() => { onClose(); a.onPress(); }}>
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

export default CategoryActionSheet;
