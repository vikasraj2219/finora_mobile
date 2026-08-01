import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import FinoraCard from '../../components/ui/FinoraCard';
import FinoraChip from '../../components/ui/FinoraChip';
import FinoraEmptyState from '../../components/ui/FinoraEmptyState';
import FinoraButton from '../../components/ui/FinoraButton';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import TransactionFormDialog from '../../components/transactions/TransactionFormDialog';
import TransactionFilterSheet from '../../components/transactions/TransactionFilterSheet';
import TransactionRow from '../../components/transactions/TransactionRow';
import ReceiptDialog from '../../components/transactions/ReceiptDialog';
import groupByDate from '../../utils/groupByDate';
import tokens from '../../theme/tokens';

import { listTransactions, createTransaction, updateTransaction, deleteTransaction } from '../../api/transactionApi';
import { listCategories } from '../../api/categoryApi';
import { listBankAccounts } from '../../api/bankAccountApi';
import { listUpiAccounts } from '../../api/upiAccountApi';

const TYPE_TABS = [
  { value: '', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'transfer', label: 'Transfer' },
];

// Redesigned per brief §8: sticky search + filter header, type tabs, date-
// grouped compact rows (swipe to delete) instead of a table or big cards.
const TransactionsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ totalItems: 0, currentPage: 1, pageSize: 20 });
  const [filters, setFilters] = useState({ page: 1, limit: 20, sortBy: 'date', sortDir: 'desc' });
  const [searchInput, setSearchInput] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [upiAccounts, setUpiAccounts] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [receiptTarget, setReceiptTarget] = useState(null);

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => !['page', 'limit', 'sortBy', 'sortDir', 'type'].includes(k) && v
  ).length;

  const loadLookups = useCallback(async () => {
    const [catRes, bankRes, upiRes] = await Promise.all([listCategories(), listBankAccounts(), listUpiAccounts()]);
    setCategories(catRes.data.data);
    setBankAccounts(bankRes.data.data.items);
    setUpiAccounts(upiRes.data.data.items);
  }, []);

  const loadTransactions = useCallback(async () => {
    const { data } = await listTransactions(filters);
    setRows(data.data.items);
    setMeta(data.data.meta);
  }, [filters]);

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadLookups(), loadTransactions()])
        .catch(() => {})
        .finally(() => setLoading(false));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadTransactions();
    } finally {
      setRefreshing(false);
    }
  };

  const submit = async (payload) => {
    if (editing) await updateTransaction(editing._id, payload);
    else await createTransaction(payload);
    setDialogOpen(false);
    setEditing(null);
    loadTransactions();
  };

  const confirmDelete = async () => {
    await deleteTransaction(deleteTarget._id);
    setDeleteTarget(null);
    loadTransactions();
  };

  const submitSearch = () => setFilters((f) => ({ ...f, search: searchInput || undefined, page: 1 }));

  const handleReceiptUpdated = (updatedTxn) => {
    setRows((prev) => prev.map((r) => (r._id === updatedTxn._id ? { ...r, receiptUrl: updatedTxn.receiptUrl } : r)));
    setReceiptTarget((prev) => (prev ? { ...prev, receiptUrl: updatedTxn.receiptUrl } : prev));
  };

  const groups = filters.sortBy === 'date' || !filters.sortBy ? groupByDate(rows) : [{ label: null, items: rows }];

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator animating color={tokens.brand.teal500} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Sticky header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>Transactions</Text>
          <View style={styles.headerIcons}>
            <Pressable onPress={() => setSearchOpen((v) => !v)} hitSlop={8} style={styles.iconBtn}>
              <MaterialCommunityIcons name="magnify" size={22} color={tokens.neutral.textPrimary} />
            </Pressable>
            <Pressable onPress={() => setFilterOpen(true)} hitSlop={8} style={styles.iconBtn}>
              <MaterialCommunityIcons name="tune-variant" size={20} color={tokens.neutral.textPrimary} />
              {activeFilterCount > 0 && <View style={styles.filterDot} />}
            </Pressable>
          </View>
        </View>

        {searchOpen && (
          <View style={styles.searchRow}>
            <MaterialCommunityIcons name="magnify" size={16} color={tokens.neutral.textMuted} />
            <TextInput
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={submitSearch}
              placeholder="Search notes…"
              placeholderTextColor={tokens.neutral.textMuted}
              style={styles.searchInput}
              returnKeyType="search"
            />
            {!!searchInput && (
              <Pressable onPress={() => { setSearchInput(''); setFilters((f) => ({ ...f, search: undefined, page: 1 })); }}>
                <MaterialCommunityIcons name="close-circle" size={16} color={tokens.neutral.textMuted} />
              </Pressable>
            )}
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
          {TYPE_TABS.map((tab) => (
            <Pressable
              key={tab.value}
              onPress={() => setFilters((f) => ({ ...f, type: tab.value || undefined, page: 1 }))}
              style={[styles.tab, (filters.type || '') === tab.value && styles.tabActive]}
            >
              <Text style={[styles.tabLabel, (filters.type || '') === tab.value && styles.tabLabelActive]}>{tab.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[tokens.brand.teal500]} />}
      >
        {rows.length === 0 ? (
          <FinoraCard>
            <FinoraEmptyState
              icon="swap-horizontal"
              title="No transactions found"
              description="Add your first transaction, or adjust your filters."
              actionLabel="Add Transaction"
              onAction={() => { setEditing(null); setDialogOpen(true); }}
            />
          </FinoraCard>
        ) : (
          groups.map((group, gi) => (
            <View key={group.label || gi} style={styles.group}>
              {group.label && <Text style={styles.groupLabel}>{group.label}</Text>}
              <FinoraCard padded={false}>
                {group.items.map((t, i) => (
                  <View key={t._id}>
                    {i > 0 && <View style={styles.divider} />}
                    <TransactionRow
                      transaction={t}
                      onPress={() => { setEditing(t); setDialogOpen(true); }}
                      onDelete={() => setDeleteTarget(t)}
                      onReceiptPress={() => setReceiptTarget(t)}
                    />
                  </View>
                ))}
              </FinoraCard>
            </View>
          ))
        )}

        {rows.length > 0 && (
          <View style={styles.pagination}>
            <FinoraButton
              label="Previous"
              variant="ghost"
              disabled={meta.currentPage <= 1}
              onPress={() => setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))}
              style={{ flex: 1 }}
            />
            <Text style={styles.pageLabel}>
              {meta.currentPage} / {Math.max(1, Math.ceil(meta.totalItems / meta.pageSize))}
            </Text>
            <FinoraButton
              label="Next"
              variant="ghost"
              disabled={meta.currentPage * meta.pageSize >= meta.totalItems}
              onPress={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}
              style={{ flex: 1 }}
            />
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      <TransactionFormDialog
        open={dialogOpen}
        initialValues={editing}
        categories={categories}
        bankAccounts={bankAccounts}
        upiAccounts={upiAccounts}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onSubmit={submit}
      />

      <TransactionFilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        categories={categories}
        onApply={(f) => setFilters((prev) => ({ ...prev, ...f, page: 1 }))}
        onClear={() => setFilters({ page: 1, limit: 20, sortBy: 'date', sortDir: 'desc', type: filters.type })}
      />

      <ReceiptDialog open={!!receiptTarget} transaction={receiptTarget} onClose={() => setReceiptTarget(null)} onUpdated={handleReceiptUpdated} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this transaction?"
        description="This will reverse its effect on the related account balance."
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.neutral.bg },
  container: { flex: 1, backgroundColor: tokens.neutral.bg },

  header: { backgroundColor: tokens.neutral.surface, paddingHorizontal: tokens.space.lg, paddingTop: tokens.space.sm, borderBottomWidth: 1, borderBottomColor: tokens.neutral.border },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.space.sm },
  headerTitle: { ...tokens.typography.h2, color: tokens.neutral.textPrimary },
  headerIcons: { flexDirection: 'row', gap: 14 },
  iconBtn: { position: 'relative' },
  filterDot: { position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: 4, backgroundColor: tokens.semantic.expense },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: tokens.neutral.surfaceAlt, borderRadius: tokens.radius.md, paddingHorizontal: 12, marginBottom: tokens.space.sm },
  searchInput: { flex: 1, paddingVertical: 9, color: tokens.neutral.textPrimary, fontSize: 14 },

  tabsRow: { flexGrow: 0, marginBottom: tokens.space.sm },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: tokens.radius.pill, backgroundColor: tokens.neutral.surfaceAlt, marginRight: 8 },
  tabActive: { backgroundColor: tokens.brand.ink800 },
  tabLabel: { ...tokens.typography.bodySm, color: tokens.neutral.textSecondary, fontWeight: '600' },
  tabLabelActive: { color: '#fff' },

  content: { padding: tokens.space.lg, paddingBottom: 100 },
  group: { marginBottom: tokens.space.lg },
  groupLabel: { ...tokens.typography.label, color: tokens.neutral.textMuted, marginBottom: 8, marginLeft: 2 },
  divider: { height: 1, backgroundColor: tokens.neutral.border, marginLeft: 60 },

  pagination: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  pageLabel: { ...tokens.typography.bodySm, color: tokens.neutral.textMuted },
});

export default TransactionsScreen;
