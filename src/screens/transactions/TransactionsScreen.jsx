import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, IconButton, FAB, Chip, ActivityIndicator, Badge, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import TransactionFormDialog from '../../components/transactions/TransactionFormDialog';
import TransactionFilterDialog from '../../components/transactions/TransactionFilterDialog';
import ReceiptDialog from '../../components/transactions/ReceiptDialog';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { brand } from '../../theme/theme';

import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../../api/transactionApi';
import { listCategories } from '../../api/categoryApi';
import { listBankAccounts } from '../../api/bankAccountApi';
import { listUpiAccounts } from '../../api/upiAccountApi';

const TYPE_COLOR = {
  income: '#22C55E',
  expense: '#EF4444',
  transfer: '#3B82F6',
  adjustment: '#F59E0B',
  opening_balance: '#94A3B8',
};

const ALLOCATION_BADGE = {
  UNALLOCATED: '🔴 Unallocated',
  PARTIALLY_ALLOCATED: '🟡 Partial',
  FULLY_ALLOCATED: '🟢 Complete',
};

const describeRoute = (t) => {
  if (t.type !== 'transfer') return null;
  const from = t.transferFrom?.type === 'cash' ? 'Cash' : t.transferFrom?.bankAccount?.bankName || '—';
  const to = t.transferTo?.type === 'cash' ? 'Cash' : t.transferTo?.bankAccount?.bankName || '—';
  return `${from} → ${to}`;
};

// Mirrors frontend/src/pages/transactions/Transactions.jsx — card list instead of a
// table (there's no room for 9 table columns on a phone), same filters, same dialogs.
const TransactionsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ totalItems: 0, currentPage: 1, pageSize: 20 });
  const [filters, setFilters] = useState({ page: 1, limit: 20 });

  const [categories, setCategories] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [upiAccounts, setUpiAccounts] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [receiptTarget, setReceiptTarget] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => !['page', 'limit'].includes(k) && v
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

  const handleReceiptUpdated = (updatedTxn) => {
    setRows((prev) => prev.map((r) => (r._id === updatedTxn._id ? { ...r, receiptUrl: updatedTxn.receiptUrl } : r)));
    setReceiptTarget((prev) => (prev ? { ...prev, receiptUrl: updatedTxn.receiptUrl } : prev));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator animating color={brand.teal} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.headerTitle}>
          Transactions
        </Text>
        <View>
          <IconButton icon="filter-variant" onPress={() => setFilterOpen(true)} />
          {activeFilterCount > 0 && (
            <Badge style={styles.filterBadge} size={16}>
              {activeFilterCount}
            </Badge>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[brand.teal]} />}
      >
        {rows.length === 0 ? (
          <EmptyState
            icon="swap-horizontal"
            title="No transactions found"
            description="Add your first transaction, or adjust your filters."
            actionLabel="Add Transaction"
            onAction={() => setDialogOpen(true)}
          />
        ) : (
          rows.map((t) => (
            <Surface key={t._id} style={styles.card} elevation={1}>
              <View style={styles.cardBody} onTouchEnd={() => { setEditing(t); setDialogOpen(true); }}>
                <View style={styles.cardTopRow}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.chipRow}>
                      <Chip
                        compact
                        style={{ backgroundColor: `${TYPE_COLOR[t.type]}1A` }}
                        textStyle={{ color: TYPE_COLOR[t.type], fontSize: 11 }}
                      >
                        {t.type}
                      </Chip>
                      {ALLOCATION_BADGE[t.allocationStatus] && (
                        <Chip compact textStyle={{ fontSize: 11 }}>
                          {ALLOCATION_BADGE[t.allocationStatus]}
                        </Chip>
                      )}
                    </View>
                    <Text variant="titleSmall" style={styles.bold}>
                      {t.type === 'transfer'
                        ? describeRoute(t)
                        : t.subcategory
                        ? `${t.category?.name || '—'} › ${t.subcategory.name}`
                        : t.category?.name || '—'}
                    </Text>
                    <Text variant="bodySmall" style={styles.muted}>
                      {formatDate(t.date)} · {t.entrySource === 'IMPORTED' ? 'Imported' : 'Manual'}
                    </Text>
                    {t.note ? (
                      <Text variant="bodySmall" style={styles.note} numberOfLines={1}>
                        {t.note}
                      </Text>
                    ) : null}
                  </View>
                  <Text
                    variant="titleMedium"
                    style={{
                      fontWeight: '700',
                      color: t.type === 'income' ? '#22C55E' : t.type === 'expense' ? '#EF4444' : brand.navy,
                    }}
                  >
                    {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''}
                    {formatCurrency(t.amount)}
                  </Text>
                </View>
              </View>
              <View style={styles.actionRow}>
                <IconButton
                  icon={t.receiptUrl ? 'paperclip' : 'paperclip'}
                  size={18}
                  iconColor={t.receiptUrl ? brand.teal : '#94A3B8'}
                  onPress={() => setReceiptTarget(t)}
                />
                <IconButton icon="pencil-outline" size={18} onPress={() => { setEditing(t); setDialogOpen(true); }} />
                <IconButton icon="delete-outline" size={18} iconColor="#EF4444" onPress={() => setDeleteTarget(t)} />
              </View>
            </Surface>
          ))
        )}

        {rows.length > 0 && (
          <View style={styles.pagination}>
            <Button
              disabled={meta.currentPage <= 1}
              onPress={() => setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))}
            >
              Previous
            </Button>
            <Text variant="bodySmall" style={{ color: '#64748B' }}>
              Page {meta.currentPage} of {Math.max(1, Math.ceil(meta.totalItems / meta.pageSize))}
            </Text>
            <Button
              disabled={meta.currentPage * meta.pageSize >= meta.totalItems}
              onPress={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}
            >
              Next
            </Button>
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() => {
          setEditing(null);
          setDialogOpen(true);
        }}
      />

      <TransactionFormDialog
        open={dialogOpen}
        initialValues={editing}
        categories={categories}
        bankAccounts={bankAccounts}
        upiAccounts={upiAccounts}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSubmit={submit}
      />

      <TransactionFilterDialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        categories={categories}
        onApply={(f) => setFilters({ ...f, page: 1, limit: 20 })}
        onClear={() => setFilters({ page: 1, limit: 20 })}
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
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: brand.bg },
  container: { flex: 1, backgroundColor: brand.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12 },
  headerTitle: { fontWeight: '700', color: brand.navy },
  filterBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: brand.teal },
  content: { padding: 16, paddingTop: 8, paddingBottom: 96 },
  card: { borderRadius: 12, backgroundColor: '#FFFFFF', marginBottom: 12, overflow: 'hidden' },
  cardBody: { padding: 14, paddingBottom: 8 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  chipRow: { flexDirection: 'row', gap: 6, marginBottom: 6, flexWrap: 'wrap' },
  bold: { fontWeight: '700' },
  muted: { color: '#94A3B8', marginTop: 2 },
  note: { color: '#64748B', marginTop: 4 },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#F8FAFC' },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: brand.navy },
});

export default TransactionsScreen;
