import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import FinoraCard from '../ui/FinoraCard';
import { formatCurrency } from '../../utils/formatters';
import tokens from '../../theme/tokens';

// Category card per brief §10: icon, name, subcategory count, monthly
// spending, share of the month's total for this type (all real data — see
// CategoriesScreen for how each figure is sourced). The share is now also a
// filled progress track (animated in on mount) rather than just a number, so
// relative weight across categories reads at a glance while scanning the
// list. Tapping the card drills into its subcategories; the kebab opens
// Edit/Delete separately so the two interactions don't collide.
const CategoryCard = ({ icon, color, name, subcategoryCount, monthTotal, percentage, isDefault, onPress, onMenuPress }) => {
  const width = useSharedValue(0);
  const pct = Math.max(0, Math.min(100, percentage || 0));

  useEffect(() => {
    width.value = withTiming(pct, { duration: 650, easing: Easing.out(Easing.cubic) });
  }, [pct]);

  const barStyle = useAnimatedStyle(() => ({ width: `${width.value}%` }));

  return (
    <FinoraCard style={styles.card} padded={false}>
      <Pressable onPress={onPress} style={styles.pressArea}>
        <View style={styles.topRow}>
          <View style={[styles.iconWrap, { backgroundColor: `${color}17` }]}>
            <MaterialCommunityIcons name={icon} size={20} color={color} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.subtitle}>
              {subcategoryCount} subcategor{subcategoryCount === 1 ? 'y' : 'ies'}
            </Text>
          </View>
          {isDefault && (
            <View style={styles.defaultTag}>
              <Text style={styles.defaultTagText}>Default</Text>
            </View>
          )}
          <Pressable onPress={onMenuPress} hitSlop={8} style={styles.menuBtn}>
            <MaterialCommunityIcons name="dots-vertical" size={18} color={tokens.neutral.textMuted} />
          </Pressable>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.amount}>{formatCurrency(monthTotal)} this month</Text>
          {percentage != null && percentage > 0 && <Text style={styles.percentage}>{percentage}%</Text>}
        </View>

        {percentage != null && percentage > 0 && (
          <View style={styles.track}>
            <Animated.View style={[styles.fill, { backgroundColor: color }, barStyle]} />
          </View>
        )}
      </Pressable>
    </FinoraCard>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  pressArea: { padding: tokens.space.lg },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  name: { ...tokens.typography.bodyLg, fontWeight: '700', color: tokens.neutral.textPrimary },
  subtitle: { ...tokens.typography.caption, color: tokens.neutral.textMuted, marginTop: 1 },
  defaultTag: { backgroundColor: tokens.neutral.surfaceAlt, paddingHorizontal: 8, paddingVertical: 3, borderRadius: tokens.radius.pill },
  defaultTagText: { fontSize: 10, fontWeight: '700', color: tokens.neutral.textMuted },
  menuBtn: { padding: 2 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: tokens.space.md },
  amount: { ...tokens.typography.body, fontWeight: '700', color: tokens.neutral.textPrimary },
  percentage: { ...tokens.typography.caption, color: tokens.neutral.textMuted },
  track: { height: 5, borderRadius: 3, backgroundColor: tokens.neutral.surfaceAlt, marginTop: tokens.space.sm, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});

export default CategoryCard;
