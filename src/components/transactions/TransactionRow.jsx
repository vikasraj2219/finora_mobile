import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/formatters';
import tokens from '../../theme/tokens';

const TYPE_ICON = {
  income: 'arrow-bottom-left',
  expense: 'arrow-top-right',
  transfer: 'swap-horizontal',
  adjustment: 'tune',
  opening_balance: 'wallet-outline',
};

const TYPE_TONE = { income: 'income', expense: 'expense', transfer: 'transfer', adjustment: 'warning', opening_balance: 'pending' };

const ALLOCATION_DOT = { UNALLOCATED: tokens.semantic.error, PARTIALLY_ALLOCATED: tokens.semantic.warning, FULLY_ALLOCATED: tokens.semantic.income };

const describeRoute = (t) => {
  if (t.type !== 'transfer') return null;
  const from = t.transferFrom?.type === 'cash' ? 'Cash' : t.transferFrom?.bankAccount?.bankName || '—';
  const to = t.transferTo?.type === 'cash' ? 'Cash' : t.transferTo?.bankAccount?.bankName || '—';
  return `${from} → ${to}`;
};

const describeAccount = (t) => {
  if (t.paymentMethod === 'bank' && t.bankAccount) return t.bankAccount.bankName;
  if (t.paymentMethod === 'upi' && t.upiAccount) return t.upiAccount.nickname || t.upiAccount.provider;
  if (t.paymentMethod) return t.paymentMethod.charAt(0).toUpperCase() + t.paymentMethod.slice(1);
  return null;
};

// Compact single-line-ish transaction row per brief §8 (no giant cards). Swipe
// left to reveal Delete — react-native-gesture-handler's Swipeable, already a
// dependency via React Navigation, so no new native module added.
const TransactionRow = ({ transaction: t, onPress, onDelete, onReceiptPress }) => {
  const title =
    t.type === 'transfer'
      ? describeRoute(t)
      : t.merchant?.name || (t.subcategory ? `${t.category?.name || 'Uncategorized'} › ${t.subcategory.name}` : t.category?.name || 'Uncategorized');
  const account = describeAccount(t);
  const tone = TYPE_TONE[t.type];
  const color = tokens.semantic[tone];

  const renderRightActions = (progress, dragX) => {
    const scale = dragX.interpolate({ inputRange: [-80, 0], outputRange: [1, 0], extrapolate: 'clamp' });
    return (
      <Pressable onPress={onDelete} style={styles.deleteAction}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <MaterialCommunityIcons name="trash-can-outline" size={20} color="#fff" />
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      <Pressable onPress={onPress} style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: `${color}17` }]}>
          <MaterialCommunityIcons name={TYPE_ICON[t.type]} size={17} color={color} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {[account, t.entrySource === 'IMPORTED' ? 'Imported' : null].filter(Boolean).join(' · ')}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={styles.amountRow}>
            {onReceiptPress && (
              <Pressable onPress={onReceiptPress} hitSlop={8} style={styles.receiptBtn}>
                <MaterialCommunityIcons name="paperclip" size={14} color={t.receiptUrl ? tokens.brand.teal600 : tokens.neutral.textMuted} />
              </Pressable>
            )}
            <Text style={[styles.amount, { color }]}>
              {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''}
              {formatCurrency(t.amount)}
            </Text>
          </View>
          {t.allocationStatus && t.allocationStatus !== 'FULLY_ALLOCATED' && (
            <View style={[styles.allocDot, { backgroundColor: ALLOCATION_DOT[t.allocationStatus] }]} />
          )}
        </View>
      </Pressable>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, paddingHorizontal: tokens.space.lg, backgroundColor: tokens.neutral.surface },
  iconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { ...tokens.typography.body, fontWeight: '600', color: tokens.neutral.textPrimary },
  meta: { ...tokens.typography.caption, color: tokens.neutral.textMuted, marginTop: 1 },
  amount: { ...tokens.typography.body, fontWeight: '700' },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  receiptBtn: { padding: 2 },
  allocDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },
  deleteAction: { backgroundColor: tokens.semantic.error, justifyContent: 'center', alignItems: 'center', width: 64 },
});

export default TransactionRow;
