import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';

import StatCard from '../../components/common/StatCard';
import IncomeExpenseTrendChart from '../../components/dashboard/IncomeExpenseTrendChart';
import CashFlowChart from '../../components/dashboard/CashFlowChart';
import CategoryBreakdownChart from '../../components/dashboard/CategoryBreakdownChart';
import PaymentMethodChart from '../../components/dashboard/PaymentMethodChart';
import AccountUsageCard from '../../components/dashboard/AccountUsageCard';
import YearlySummaryChart from '../../components/dashboard/YearlySummaryChart';
import HighlightsCard from '../../components/dashboard/HighlightsCard';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { brand } from '../../theme/theme';
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

// Mirrors frontend/src/pages/dashboard/Dashboard.jsx — same endpoints, same layout
// logic, adapted from a Grid of cards to a vertically stacked scroll view.
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

  const loadAll = useCallback(async () => {
    const [summaryRes, trendsRes, distRes, usageRes, breakdownRes, yearlyRes] = await Promise.all([
      getDashboardSummary(),
      getDashboardTrends(6),
      getPaymentMethodDistribution(),
      getAccountUsage(),
      getCategoryBreakdown({ type: 'expense' }),
      getYearlySummary(currentYear),
    ]);
    setSummary(summaryRes.data.data);
    setTrends(trendsRes.data.data);
    setPaymentDist(distRes.data.data);
    setUsage(usageRes.data.data);
    setBreakdown(breakdownRes.data.data);
    setYearlyData(yearlyRes.data.data);
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

  const onCategoryTypeChange = async (val) => {
    setCategoryType(val);
    const { data } = await getCategoryBreakdown({ type: val });
    setBreakdown(data.data);
  };

  const onYearChange = async (val) => {
    setYear(val);
    const { data } = await getYearlySummary(val);
    setYearlyData(data.data);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating color={brand.teal} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[brand.teal]} />}
    >
      <Text variant="headlineSmall" style={styles.greeting}>
        Welcome, {user?.name?.split(' ')[0]}
      </Text>
      <Text variant="bodyMedium" style={styles.subGreeting}>
        Here's a snapshot of your finances
      </Text>

      <View style={styles.statGrid}>
        <StatCard
          icon="wallet-outline"
          label="Cash in Hand"
          value={formatCurrency(summary.cashInHand)}
          subtext="Bank + cash"
          color={brand.navy}
        />
        <StatCard
          icon="trending-up"
          label="Monthly Income"
          value={formatCurrency(summary.monthlyIncome)}
          color="#22C55E"
        />
      </View>
      <View style={styles.statGrid}>
        <StatCard
          icon="trending-down"
          label="Monthly Expense"
          value={formatCurrency(summary.monthlyExpense)}
          color="#EF4444"
        />
        <StatCard
          icon="piggy-bank-outline"
          label="Monthly Saving"
          value={formatCurrency(summary.monthlySaving)}
          color={brand.teal}
        />
      </View>

      <View style={styles.statGrid}>
        <StatCard label="Total Income" value={formatCurrency(summary.totalIncome)} color="#22C55E" icon="cash-plus" />
        <StatCard label="Total Expense" value={formatCurrency(summary.totalExpense)} color="#EF4444" icon="cash-minus" />
      </View>
      <StatCard label="Net Savings (all-time)" value={formatCurrency(summary.netSavings)} color="#3B82F6" icon="chart-line" />

      <View style={{ height: 12 }} />
      <IncomeExpenseTrendChart trends={trends} />
      <View style={{ height: 12 }} />
      <HighlightsCard summary={summary} />
      <View style={{ height: 12 }} />
      <CashFlowChart trends={trends} />
      <View style={{ height: 12 }} />
      <CategoryBreakdownChart breakdown={breakdown} type={categoryType} onTypeChange={onCategoryTypeChange} />
      <View style={{ height: 12 }} />
      <PaymentMethodChart distribution={paymentDist} />
      <View style={{ height: 12 }} />
      <View style={styles.usageRow}>
        <AccountUsageCard title="Bank-wise Usage" items={usage.banks} />
        <AccountUsageCard title="UPI-wise Usage" items={usage.upi} />
      </View>
      <View style={{ height: 12 }} />
      <YearlySummaryChart data={yearlyData} year={year} onYearChange={onYearChange} years={YEAR_OPTIONS} />
      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: brand.bg },
  container: { flex: 1, backgroundColor: brand.bg },
  content: { padding: 16 },
  greeting: { fontWeight: '700', color: brand.navy },
  subGreeting: { color: '#64748B', marginBottom: 16 },
  statGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  usageRow: { gap: 10 },
});

export default DashboardScreen;
