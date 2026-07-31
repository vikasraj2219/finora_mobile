import { useState, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ScrollView, View, Text, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import FinoraCard from '../../components/ui/FinoraCard';
import FinoraChip from '../../components/ui/FinoraChip';
import FinoraBadge from '../../components/ui/FinoraBadge';
import FinoraSectionHeader from '../../components/ui/FinoraSectionHeader';
import FinoraEmptyState from '../../components/ui/FinoraEmptyState';
import { useAuth } from '../../context/AuthContext';
import { useQuickAdd } from '../../context/QuickAddContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import tokens from '../../theme/tokens';

import { getDashboardSummary, getDashboardTrends, getCategoryBreakdown } from '../../api/dashboardApi';
import { listTransactions, getAllocationSummary } from '../../api/transactionApi';
import { listBankAccounts } from '../../api/bankAccountApi';
import { listUpiAccounts } from '../../api/upiAccountApi';
import { listNotifications } from '../../api/notificationApi';

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const QUICK_ACTIONS = [
  { type: 'expense', label: 'Add Expense', icon: 'arrow-top-right', tone: 'expense' },
  { type: 'income', label: 'Add Income', icon: 'arrow-bottom-left', tone: 'income' },
  { type: 'transfer', label: 'Transfer', icon: 'swap-horizontal', tone: 'transfer' },
  { type: 'import', label: 'Import', icon: 'file-upload-outline', tone: 'brand' },
];

const TX_TONE = { income: 'income', expense: 'expense', transfer: 'transfer', adjustment: 'warning', opening_balance: 'pending' };

// Home — a fast, glanceable snapshot (brief §6). The deep multi-chart analysis
// that used to live here moved to the new Insights tab; this screen answers
// "how much do I have / earn / spend / where's it going / what needs my
// attention" in a few seconds, not a scroll through 7 chart cards.
const HomeScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { openQuickAdd } = useQuickAdd();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balanceHidden, setBalanceHidden] = useState(false);

  const [summary, setSummary] = useState(null);
  const [trendDelta, setTrendDelta] = useState(null);
  const [accountCount, setAccountCount] = useState(0);
  const [topCategories, setTopCategories] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const [unallocatedCount, setUnallocatedCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadAll = useCallback(async () => {
    const [summaryRes, trendsRes, breakdownRes, bankRes, upiRes, txRes, allocRes, notifRes] = await Promise.all([
      getDashboardSummary(),
      getDashboardTrends(2),
      getCategoryBreakdown({ type: 'expense' }),
      listBankAccounts(),
      listUpiAccounts(),
      listTransactions({ limit: 5, page: 1 }),
      getAllocationSummary(),
      listNotifications({ limit: 1 }),
    ]);

    setSummary(summaryRes.data.data);

    const months = trendsRes.data.data;
    if (months.length >= 2) {
      const prevNet = months[months.length - 2].netFlow;
      const curNet = months[months.length - 1].netFlow;
      if (prevNet !== 0) setTrendDelta(Math.round(((curNet - prevNet) / Math.abs(prevNet)) * 100));
      else setTrendDelta(null);
    }

    setTopCategories(breakdownRes.data.data.slice(0, 3));
    setAccountCount(
      bankRes.data.data.items.filter((a) => a.isActive).length + upiRes.data.data.items.filter((a) => a.isActive).length
    );
    setRecentTx(txRes.data.data.items);
    setUnallocatedCount(allocRes.data.data.UNALLOCATED || 0);
    setUnreadCount(notifRes.data.data.unreadCount || 0);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAll()
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [loadAll])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAll();
    } finally {
      setRefreshing(false);
    }
  };

  const handleQuickAction = (action) => {
    if (action.type === 'import') {
      navigation.navigate('More', { screen: 'Imports' });
    } else {
      openQuickAdd(action.type);
    }
  };

  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Insight sentences — every one below is computed from real fields already
  // returned by the API (no fabricated stats), per brief §6/§17.
  const insights = [];
  if (summary) {
    if (unallocatedCount > 0) {
      insights.push({
        icon: 'shape-outline',
        tone: 'warning',
        text: `${unallocatedCount} transaction${unallocatedCount === 1 ? '' : 's'} waiting for categorisation`,
        onPress: () => navigation.navigate('More', { screen: 'Allocation' }),
      });
    }
    if (summary.monthlyExpense > summary.monthlyIncome) {
      insights.push({
        icon: 'alert-circle-outline',
        tone: 'expense',
        text: 'Your expenses are higher than your income this month',
      });
    } else if (summary.monthlySaving > 0) {
      insights.push({
        icon: 'piggy-bank-outline',
        tone: 'income',
        text: `You've saved ${formatCurrency(summary.monthlySaving)} so far this month`,
      });
    }
    if (summary.highestSpendingCategory) {
      insights.push({
        icon: 'chart-donut',
        tone: 'brand',
        text: `Your highest spending category is ${summary.highestSpendingCategory.name}`,
      });
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator animating color={tokens.brand.teal500} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[tokens.brand.teal500]} />}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.userName}>{user?.name?.split(' ')[0]}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.bellWrap}
              onPress={() => navigation.navigate('More', { screen: 'Notifications' })}
              hitSlop={8}
            >
              <MaterialCommunityIcons name="bell-outline" size={22} color={tokens.neutral.textPrimary} />
              {unreadCount > 0 && <FinoraBadge count={unreadCount} style={styles.bellBadge} />}
            </Pressable>
            <Pressable onPress={() => navigation.navigate('More', { screen: 'Settings' })}>
              <Avatar.Text size={38} label={initials} style={{ backgroundColor: tokens.brand.ink800 }} labelStyle={{ fontSize: 14 }} />
            </Pressable>
          </View>
        </View>

        {/* Balance card */}
        <FinoraCard style={styles.balanceCard} elevation="medium">
          <View style={styles.balanceTopRow}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Pressable onPress={() => setBalanceHidden((v) => !v)} hitSlop={8}>
              <MaterialCommunityIcons
                name={balanceHidden ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="rgba(255,255,255,0.7)"
              />
            </Pressable>
          </View>
          <Text style={styles.balanceValue}>{balanceHidden ? '••••••' : formatCurrency(summary.cashInHand)}</Text>
          <View style={styles.balanceFooterRow}>
            <Text style={styles.balanceSub}>Across {accountCount} account{accountCount === 1 ? '' : 's'}</Text>
            {trendDelta !== null && (
              <View style={styles.trendPill}>
                <MaterialCommunityIcons
                  name={trendDelta >= 0 ? 'trending-up' : 'trending-down'}
                  size={13}
                  color="#fff"
                />
                <Text style={styles.trendText}>
                  {trendDelta >= 0 ? '+' : ''}
                  {trendDelta}% vs last month
                </Text>
              </View>
            )}
          </View>
        </FinoraCard>

        {/* Quick actions */}
        <View style={styles.quickActionsRow}>
          {QUICK_ACTIONS.map((action) => {
            const color = action.tone === 'brand' ? tokens.brand.ink800 : tokens.semantic[action.tone];
            return (
              <Pressable key={action.type} style={styles.quickAction} onPress={() => handleQuickAction(action)}>
                <View style={[styles.quickActionIcon, { backgroundColor: `${color}17` }]}>
                  <MaterialCommunityIcons name={action.icon} size={20} color={color} />
                </View>
                <Text style={styles.quickActionLabel} numberOfLines={1}>
                  {action.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* This month */}
        <FinoraSectionHeader title="This Month" />
        <View style={styles.monthRow}>
          <FinoraCard style={{ flex: 1 }}>
            <Text style={styles.monthLabel}>Income</Text>
            <Text style={[styles.monthValue, { color: tokens.semantic.income }]}>{formatCurrency(summary.monthlyIncome)}</Text>
          </FinoraCard>
          <FinoraCard style={{ flex: 1 }}>
            <Text style={styles.monthLabel}>Expense</Text>
            <Text style={[styles.monthValue, { color: tokens.semantic.expense }]}>{formatCurrency(summary.monthlyExpense)}</Text>
          </FinoraCard>
          <FinoraCard style={{ flex: 1 }}>
            <Text style={styles.monthLabel}>Saved</Text>
            <Text style={[styles.monthValue, { color: tokens.semantic.savings }]}>{formatCurrency(summary.monthlySaving)}</Text>
          </FinoraCard>
        </View>

        {/* Top spending categories */}
        {topCategories.length > 0 && (
          <>
            <FinoraSectionHeader title="Top Spending" actionLabel="See all" onActionPress={() => navigation.navigate('Insights')} />
            <FinoraCard>
              {topCategories.map((c, i) => (
                <View key={c.categoryId} style={[styles.catRow, i > 0 && styles.catRowBorder]}>
                  <View style={[styles.catDot, { backgroundColor: c.color }]} />
                  <Text style={styles.catName} numberOfLines={1}>
                    {c.name}
                  </Text>
                  <Text style={styles.catAmount}>{formatCurrency(c.total)}</Text>
                  <Text style={styles.catPct}>{c.percentage}%</Text>
                </View>
              ))}
            </FinoraCard>
          </>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <>
            <FinoraSectionHeader title="Insights" style={{ marginTop: tokens.space.lg }} />
            <View style={{ gap: 8 }}>
              {insights.map((insight, i) => (
                <Pressable key={i} onPress={insight.onPress} disabled={!insight.onPress}>
                  <FinoraCard style={styles.insightCard} padded={false}>
                    <View style={styles.insightRow}>
                      <View style={[styles.insightIcon, { backgroundColor: `${tokens.semantic[insight.tone] || tokens.brand.ink800}17` }]}>
                        <MaterialCommunityIcons
                          name={insight.icon}
                          size={17}
                          color={tokens.semantic[insight.tone] || tokens.brand.ink800}
                        />
                      </View>
                      <Text style={styles.insightText}>{insight.text}</Text>
                      {insight.onPress && <MaterialCommunityIcons name="chevron-right" size={18} color={tokens.neutral.textMuted} />}
                    </View>
                  </FinoraCard>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Recent transactions */}
        <FinoraSectionHeader
          title="Recent Transactions"
          actionLabel="View all"
          onActionPress={() => navigation.navigate('Transactions')}
          style={{ marginTop: tokens.space.lg }}
        />
        {recentTx.length === 0 ? (
          <FinoraCard>
            <FinoraEmptyState
              icon="swap-horizontal"
              title="No transactions yet"
              description="Start tracking your finances today."
              actionLabel="Add Transaction"
              onAction={() => openQuickAdd('expense')}
            />
          </FinoraCard>
        ) : (
          <FinoraCard padded={false}>
            {recentTx.map((t, i) => (
              <View key={t._id} style={[styles.txRow, i > 0 && styles.catRowBorder]}>
                <View style={styles.txLeft}>
                  <Text style={styles.txTitle} numberOfLines={1}>
                    {t.type === 'transfer' ? 'Transfer' : t.subcategory ? `${t.category?.name} › ${t.subcategory.name}` : t.category?.name || 'Uncategorized'}
                  </Text>
                  <Text style={styles.txMeta}>{formatDate(t.date)}</Text>
                </View>
                <FinoraChip
                  tone={TX_TONE[t.type]}
                  label={`${t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''}${formatCurrency(t.amount)}`}
                />
              </View>
            ))}
          </FinoraCard>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.neutral.bg },
  container: { flex: 1, backgroundColor: tokens.neutral.bg },
  content: { padding: tokens.space.lg },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.space.lg },
  greeting: { ...tokens.typography.body, color: tokens.neutral.textSecondary },
  userName: { ...tokens.typography.h2, color: tokens.neutral.textPrimary },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bellWrap: { position: 'relative' },
  bellBadge: { position: 'absolute', top: -4, right: -4 },

  balanceCard: { backgroundColor: tokens.brand.ink800, marginBottom: tokens.space.lg },
  balanceTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { ...tokens.typography.bodySm, color: 'rgba(255,255,255,0.75)' },
  balanceValue: { ...tokens.typography.display, color: '#fff', marginTop: 6 },
  balanceFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: tokens.space.md },
  balanceSub: { ...tokens.typography.bodySm, color: 'rgba(255,255,255,0.75)' },
  trendPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: tokens.radius.pill },
  trendText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: tokens.space.xl },
  quickAction: { alignItems: 'center', width: '23%' },
  quickActionIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  quickActionLabel: { ...tokens.typography.caption, color: tokens.neutral.textSecondary, textAlign: 'center' },

  monthRow: { flexDirection: 'row', gap: 10, marginBottom: tokens.space.xl },
  monthLabel: { ...tokens.typography.caption, color: tokens.neutral.textSecondary, marginBottom: 4 },
  monthValue: { ...tokens.typography.h3 },

  catRow: { flexDirection: 'row', alignItems: 'center', padding: tokens.space.md, gap: 10 },
  catRowBorder: { borderTopWidth: 1, borderTopColor: tokens.neutral.border },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catName: { ...tokens.typography.body, color: tokens.neutral.textPrimary, flex: 1 },
  catAmount: { ...tokens.typography.body, fontWeight: '700', color: tokens.neutral.textPrimary },
  catPct: { ...tokens.typography.caption, color: tokens.neutral.textMuted, width: 34, textAlign: 'right' },

  insightCard: { backgroundColor: tokens.neutral.surface },
  insightRow: { flexDirection: 'row', alignItems: 'center', padding: tokens.space.md, gap: 10 },
  insightIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  insightText: { ...tokens.typography.bodySm, color: tokens.neutral.textPrimary, flex: 1, fontWeight: '600' },

  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: tokens.space.md, gap: 10 },
  txLeft: { flex: 1, minWidth: 0 },
  txTitle: { ...tokens.typography.body, fontWeight: '600', color: tokens.neutral.textPrimary },
  txMeta: { ...tokens.typography.caption, color: tokens.neutral.textMuted, marginTop: 2 },
});

export default HomeScreen;
