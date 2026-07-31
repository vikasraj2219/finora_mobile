import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator } from 'react-native-paper';

import IncomeExpenseTrendChart from '../../components/dashboard/IncomeExpenseTrendChart';
import CashFlowChart from '../../components/dashboard/CashFlowChart';
import CategoryBreakdownChart from '../../components/dashboard/CategoryBreakdownChart';
import PaymentMethodChart from '../../components/dashboard/PaymentMethodChart';
import AccountUsageCard from '../../components/dashboard/AccountUsageCard';
import YearlySummaryChart from '../../components/dashboard/YearlySummaryChart';
import HighlightsCard from '../../components/dashboard/HighlightsCard';
import { getDashboardSummary, getDashboardTrends, getCategoryBreakdown, getPaymentMethodDistribution, getAccountUsage, getYearlySummary } from '../../api/dashboardApi';
import tokens from '../../theme/tokens';

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear, currentYear - 1, currentYear - 2];

// New dedicated Insights tab (brief §13) — this is the "deep dive" analytics
// destination. It's built from the same chart components the old all-in-one
// Dashboard used (real data, same endpoints), relocated here so Home can stay
// a fast, glanceable snapshot instead of a wall of 7 chart cards.
// Chart period toggle (7D/1M/3M/6M/1Y/All) isn't wired yet — the backend's
// trends endpoint currently only supports a month-count parameter, not
// arbitrary ranges, so a real Week toggle would need a backend change first.
const InsightsScreen = () => {
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
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.subtitle}>The full breakdown behind your Home snapshot</Text>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.neutral.bg },
  container: { flex: 1, backgroundColor: tokens.neutral.bg },
  content: { padding: tokens.space.lg },
  title: { ...tokens.typography.h1, color: tokens.neutral.textPrimary },
  subtitle: { ...tokens.typography.body, color: tokens.neutral.textSecondary, marginBottom: tokens.space.lg },
  usageRow: { gap: 10 },
});

export default InsightsScreen;
