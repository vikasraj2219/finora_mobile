import { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Animated as RNAnimated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FinoraCard from '../ui/FinoraCard';
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

// Each transaction is now its own elevated card — pastel icon tile, name,
// account/source line, amount — rather than a row inside one merged list
// divided by hairlines, matching the card language used on Categories/
// Subcategories/Types. The icon tile uses the *category's own* color/icon
// (set per-category in Categories) for income/expense rows instead of one
// generic icon per type — so "Groceries" and "Rent" read distinctly at a
// glance instead of looking identical because both are "expense". Transfer/
// adjustment/opening-balance rows (no category) fall back to the type
// icon+tone. A soft press-scale (reanimated) adds tactile feedback on top of
// the staggered card entrance and swipe-to-delete.
const TransactionRow = ({ transaction: t, index = 0, onPress, onDelete, onReceiptPress }) => {
  const title =
    t.type === 'transfer'
      ? describeRoute(t)
      : t.merchant?.name || (t.subcategory ? `${t.category?.name || 'Uncategorized'} › ${t.subcategory.name}` : t.category?.name || 'Uncategorized');
  const account = describeAccount(t);
  const tone = TYPE_TONE[t.type];
  const typeColor = tokens.semantic[tone];

  const hasCategoryStyle = (t.type === 'income' || t.type === 'expense') && !!t.category?.color;
  const avatarColor = hasCategoryStyle ? t.category.color : typeColor;
  const avatarIcon = hasCategoryStyle ? t.category.icon || TYPE_ICON[t.type] : TYPE_ICON[t.type];
  const amountColor = typeColor;

  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const onPressIn = useCallback(() => { scale.value = withTiming(0.98, { duration: 90 }); }, []);
  const onPressOut = useCallback(() => { scale.value = withTiming(1, { duration: 120 }); }, []);

  const renderRightActions = (progress, dragX) => {
    const iconScale = dragX.interpolate({ inputRange: [-80, 0], outputRange: [1, 0], extrapolate: 'clamp' });
    return (
      <Pressable onPress={onDelete} style={styles.deleteAction}>
        <RNAnimated.View style={{ transform: [{ scale: iconScale }] }}>
          <MaterialCommunityIcons name="trash-can-outline" size={20} color="#fff" />
        </RNAnimated.View>
      </Pressable>
    );
  };

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(280)} style={styles.cardWrap}>
      <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
        <Animated.View style={pressStyle}>
          <FinoraCard padded={false}>
            <Pressable
              onPress={onPress}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <View style={[styles.iconWrap, { backgroundColor: `${avatarColor}1F` }]}>
                <MaterialCommunityIcons name={avatarIcon} size={22} color={avatarColor} />
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
                  <Text style={[styles.amount, { color: amountColor }]}>
                    {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''}
                    {formatCurrency(t.amount)}
                  </Text>
                </View>
                {t.allocationStatus && t.allocationStatus !== 'FULLY_ALLOCATED' && (
                  <View style={[styles.allocDot, { backgroundColor: ALLOCATION_DOT[t.allocationStatus] }]} />
                )}
              </View>
            </Pressable>
          </FinoraCard>
        </Animated.View>
      </Swipeable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrap: { marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: tokens.space.md },
  rowPressed: { backgroundColor: tokens.neutral.surfaceAlt },
  iconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  title: { ...tokens.typography.bodyLg, fontWeight: '700', color: tokens.neutral.textPrimary },
  meta: { ...tokens.typography.bodySm, color: tokens.neutral.textMuted, marginTop: 2 },
  amount: { ...tokens.typography.bodyLg, fontWeight: '700' },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  receiptBtn: { padding: 2 },
  allocDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },
  deleteAction: { backgroundColor: tokens.semantic.error, justifyContent: 'center', alignItems: 'center', width: 64, borderRadius: tokens.radius.lg, marginLeft: 8 },
});

export default TransactionRow;
