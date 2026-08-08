import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FinoraBottomSheet from '../ui/FinoraBottomSheet';
import tokens from '../../theme/tokens';

// Brief §7 asks for Bank / UPI / Cash / Credit Card / Other as options — Cash
// is a real backend concept but is a single auto-provisioned account per user
// (not something you "add"), and Credit Card / Other account types don't
// exist in the schema. Rather than fabricate types the backend can't actually
// store, this only offers what's real: Bank Account and UPI Account.
const OPTIONS = [
  { key: 'bank', label: 'Bank Account', description: 'Savings, current, or salary account', icon: 'bank-outline', tone: tokens.brand.ink800 },
  { key: 'upi', label: 'UPI Account', description: 'GPay, PhonePe, Paytm, and more', icon: 'qrcode', tone: tokens.brand.teal500 },
];

const AddAccountSheet = ({ visible, onClose, onSelect }) => (
  <FinoraBottomSheet visible={visible} onClose={onClose} title={<Text style={styles.title}>Add Account</Text>}>
    {OPTIONS.map((opt) => (
      <Pressable
        key={opt.key}
        style={styles.row}
        onPress={() => {
          onClose();
          onSelect(opt.key);
        }}
      >
        <View style={[styles.iconWrap, { backgroundColor: `${opt.tone}17` }]}>
          <MaterialCommunityIcons name={opt.icon} size={20} color={opt.tone} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowLabel}>{opt.label}</Text>
          <Text style={styles.rowDescription}>{opt.description}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={tokens.neutral.textMuted} />
      </Pressable>
    ))}
  </FinoraBottomSheet>
);

const styles = StyleSheet.create({
  title: { ...tokens.typography.h3, color: tokens.neutral.textPrimary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: tokens.neutral.border },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { ...tokens.typography.bodyLg, color: tokens.neutral.textPrimary, fontWeight: '700' },
  rowDescription: { ...tokens.typography.caption, color: tokens.neutral.textMuted, marginTop: 2 },
});

export default AddAccountSheet;
