import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenHeader from '../../components/common/ScreenHeader';
import StatCard from '../../components/common/StatCard';
import HighlightsCard from '../../components/dashboard/HighlightsCard';
import IncomeExpenseTrendChart from '../../components/dashboard/IncomeExpenseTrendChart';
import CashFlowChart from '../../components/dashboard/CashFlowChart';
import CategoryBreakdownChart from '../../components/dashboard/CategoryBreakdownChart';
import PaymentMethodChart from '../../components/dashboard/PaymentMethodChart';
import AccountUsageCard from '../../components/dashboard/AccountUsageCard';
import YearlySummaryChart from '../../components/dashboard/YearlySummaryChart';

import { useAuth } from '../../context/AuthContext';
import { brand } from '../../theme/theme';
import { formatCurrency } from '../../utils/formatters';
import {
  getDashboardSummary,
  getDashboardTrends,
  getCategoryBreakdown,
  getPaymentMethodDistribution,
  getAccountUsage,
  getYearlySummary,
} from '../../api/dashboardApi';

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear, currentYear - 1, currentYear - 2];

// Mirrors frontend/src/pages/dashboard/Dashboard.jsx — same six /dashboard/* endpoints,
// same widget set, adapted to a single scrollable column for phone width.
const DashboardScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categoryType, setCategoryType] = useState('expense');
  const [breakdown, setBreakdown] = useState([]);
  const [paymentDist, setPaymentDist] = useState([]);
  const [usage, setUsage] = useState({ banks: [], upi: [] });
  const [year, setYear] = useState(currentYear);
  const [yearlyData, setYearlyData] = useState({ year: currentYear, months: [] });

  const loadCore = useCallback(async () => {
    const [summaryRes, trendsRes, distRes, usageRes] = await Promise.all([
      getDashboardSummary(),
      getDashboardTrends(6),
      getPaymentMethodDistribution(),
      getAccountUsage(),
    ]);
    setSummary(summaryRes.data.data);
    setTrends(trendsRes.data.data);
    setPaymentDist(distRes.data.data);
    setUsage(usageRes.data.data);
  }, []);

  const loadBreakdown = useCallback(async (type) => {
    const { data } = await getCategoryBreakdown({ type });
    setBreakdown(data.data);
  }, []);

  const loadYearly = useCallback(async (y) => {
    const { data } = await getYearlySummary(y);
    setYearlyData(data.data);
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([loadCore(), loadBreakdown(categoryType), loadYearly(year)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadCore]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadAll()
        .catch(() => {})
        .finally(() => active && setLoading(false));
      return () => {
        active = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAll();
    } finally {
      setRefreshing(false);
    }
  };

  const onCategoryTypeChange = (type) => {
    setCategoryType(type);
    loadBreakdown(type).catch(() => {});
  };

  const onYearChange = (y) => {
    setYear(y);
    loadYearly(y).catch(() => {});
  };

  if (loading || !summary) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator animating color={brand.teal} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[brand.teal]} />}
      >
        <ScreenHeader
          title={`Welcome, ${user?.name?.split(' ')[0] || ''}`}
          subtitle="Here's a snapshot of your finances"
        />

        <View style={styles.section}>
          <View style={styles.statRow}>
            <StatCard
              icon="wallet-outline"
              label="Cash in Hand"
              value={formatCurrency(summary.cashInHand)}
              subtext="Bank + cash"
              color={brand.navy}
              style={styles.statHalf}
            />
            <StatCard
              icon="trending-up"
              label="Monthly Income"
              value={formatCurrency(summary.monthlyIncome)}
              color={brand.success}
              style={styles.statHalf}
            />
          </View>
          <View style={styles.statRow}>
            <StatCard
              icon="trending-down"
              label="Monthly Expense"
              value={formatCurrency(summary.monthlyExpense)}
              color={brand.error}
              style={styles.statHalf}
            />
            <StatCard
              icon="piggy-bank-outline"
              label="Monthly Saving"
              value={formatCurrency(summary.monthlySaving)}
              color={brand.teal}
              style={styles.statHalf}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.statRow}>
            <StatCard label="Total Income" value={formatCurrency(summary.totalIncome)} color={brand.success} style={styles.statThird} />
            <StatCard label="Total Expense" value={formatCurrency(summary.totalExpense)} color={brand.error} style={styles.statThird} />
            <StatCard label="Net Savings" value={formatCurrency(summary.netSavings)} color={brand.info} style={styles.statThird} />
          </View>
        </View>

        <View style={styles.section}>
          <IncomeExpenseTrendChart trends={trends} />
        </View>
        <View style={styles.section}>
          <HighlightsCard summary={summary} />
        </View>
        <View style={styles.section}>
          <CashFlowChart trends={trends} />
        </View>
        <View style={styles.section}>
          <CategoryBreakdownChart breakdown={breakdown} type={categoryType} onTypeChange={onCategoryTypeChange} />
        </View>
        <View style={styles.section}>
          <PaymentMethodChart distribution={paymentDist} />
        </View>
        <View style={styles.section}>
          <AccountUsageCard title="Bank-wise Usage" items={usage.banks} />
        </View>
        <View style={styles.section}>
          <AccountUsageCard title="UPI-wise Usage" items={usage.upi} />
        </View>
        <View style={[styles.section, { marginBottom: 24 }]}>
          <YearlySummaryChart data={yearlyData} year={year} onYearChange={onYearChange} years={YEAR_OPTIONS} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: brand.bg },
  loadingContainer: { flex: 1, backgroundColor: brand.bg, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: 8 },
  section: { paddingHorizontal: 16, marginTop: 12 },
  statRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  statHalf: { flex: 1 },
  statThird: { flex: 1 },
});

export default DashboardScreen;
