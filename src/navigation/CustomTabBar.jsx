import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import tokens from '../theme/tokens';
import FinoraBottomSheet from '../components/ui/FinoraBottomSheet';
import { useQuickAdd } from '../context/QuickAddContext';

const ICONS = {
  Home: 'home-variant-outline',
  Transactions: 'swap-horizontal',
  Accounts: 'wallet-outline',
  Insights: 'chart-donut',
  More: 'dots-horizontal',
};

const ADD_OPTIONS = [
  { type: 'expense', label: 'Add Expense', icon: 'arrow-top-right', tone: tokens.semantic.expense },
  { type: 'income', label: 'Add Income', icon: 'arrow-bottom-left', tone: tokens.semantic.income },
  { type: 'transfer', label: 'Transfer', icon: 'swap-horizontal', tone: tokens.semantic.transfer },
];

// Custom tab bar: 4 real destinations either side of a raised, floating center
// "Add" button (brief §5 — prominent but not a permanent nav slot of its own).
// Tapping it opens a small sheet to choose Expense/Income/Transfer, then hands
// off to the global QuickAddProvider so the transaction composer opens right
// over whatever screen the person is on.
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { openQuickAdd } = useQuickAdd();

  const routes = state.routes;
  // Split routes either side of center: [Home, Transactions] | FAB | [Accounts, Insights, More]
  const left = routes.slice(0, 2);
  const right = routes.slice(2);

  const renderTab = (route, index) => {
    const isFocused = state.index === routes.indexOf(route);
    const { options } = descriptors[route.key];
    const label = options.tabBarLabel ?? route.name;

    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
    };

    return (
      <Pressable key={route.key} onPress={onPress} style={styles.tabItem}>
        <MaterialCommunityIcons
          name={ICONS[route.name]}
          size={22}
          color={isFocused ? tokens.brand.ink800 : tokens.neutral.textMuted}
        />
        <Text style={[styles.tabLabel, { color: isFocused ? tokens.brand.ink800 : tokens.neutral.textMuted }]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.bar}>
        <View style={styles.side}>{left.map(renderTab)}</View>
        <View style={styles.centerSpacer} />
        <View style={styles.side}>{right.map(renderTab)}</View>
      </View>

      <Pressable style={styles.fab} onPress={() => setSheetOpen(true)}>
        <MaterialCommunityIcons name="plus" size={26} color="#fff" />
      </Pressable>

      <FinoraBottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
        <Text style={styles.sheetTitle}>Add</Text>
        {ADD_OPTIONS.map((opt) => (
          <Pressable
            key={opt.type}
            style={styles.sheetRow}
            onPress={() => {
              setSheetOpen(false);
              openQuickAdd(opt.type);
            }}
          >
            <View style={[styles.sheetIcon, { backgroundColor: `${opt.tone}17` }]}>
              <MaterialCommunityIcons name={opt.icon} size={18} color={opt.tone} />
            </View>
            <Text style={styles.sheetLabel}>{opt.label}</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={tokens.neutral.textMuted} />
          </Pressable>
        ))}
      </FinoraBottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { backgroundColor: tokens.neutral.surface, borderTopWidth: 1, borderTopColor: tokens.neutral.border },
  bar: { flexDirection: 'row', alignItems: 'center', height: 58 },
  side: { flex: 1, flexDirection: 'row' },
  centerSpacer: { width: 64 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabLabel: { fontSize: 10, fontWeight: '600' },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    top: -22,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: tokens.brand.ink800,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.high,
  },
  sheetTitle: { ...tokens.typography.h3, color: tokens.neutral.textPrimary, marginBottom: tokens.space.sm },
  sheetRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  sheetIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sheetLabel: { ...tokens.typography.bodyLg, color: tokens.neutral.textPrimary, flex: 1, fontWeight: '600' },
});

export default CustomTabBar;
