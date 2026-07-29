import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, ScrollView, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { Text, Surface, Checkbox, Chip, ActivityIndicator, ProgressBar, Button, Menu, TextInput } from 'react-native-paper';

import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import TransactionFormDialog from '../../components/transactions/TransactionFormDialog';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { brand } from '../../theme/theme';

import {
  listTransactions,
  updateTransaction,
  bulkAllocateTransactions,
  bulkDeleteTransactions,
  getAllocationSummary,
} from '../../api/transactionApi';
import { listCategories } from '../../api/categoryApi';
import { listSubcategories } from '../../api/subcategoryApi';
import { listBankAccounts } from '../../api/bankAccountApi';
import { listUpiAccounts } from '../../api/upiAccountApi';

const TABS = [
  { value: '', label: 'All' },
  { value: 'UNALLOCATED', label: '🔴 Unallocated' },
  { value: 'PARTIALLY_ALLOCATED', label: '🟡 Partial' },
  { value: 'FULLY_ALLOCATED', label: '🟢 Complete' },
];

const CLASSIFIABLE_TYPES = ['income', 'expense'];

const describeRoute = (t) => {
  if (t.type !== 'transfer') return null;
  const from = t.transferFrom?.type === 'cash' ? 'Cash' : t.transferFrom?.bankAccount?.bankName || '—';
  const to = t.transferTo?.type === 'cash' ? 'Cash' : t.transferTo?.bankAccount?.bankName || '—';
  return `${from} → ${to}`;
};

const PickerField = ({ label, value, options, onSelect }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchor={
        <TextInput
          label={label}
          value={selected?.label || ''}
          mode="outlined"
          dense
          editable={false}
          onPressIn={() => setOpen(true)}
          right={<TextInput.Icon icon="menu-down" onPress={() => setOpen(true)} />}
          style={styles.pickerInput}
        />
      }
    >
      {options.map((o) => (
        <Menu.Item key={o.value} title={o.label} onPress={() => { onSelect(o.value); setOpen(false); }} />
      ))}
    </Menu>
  );
};

// Mirrors frontend/src/pages/allocation/Allocation.jsx — status tabs, multi-select
// with a bulk-allocate toolbar, tap a card to edit it individually via the same
// TransactionFormDialog used on the Transactions tab.
const AllocationScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('');
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ totalItems: 0, currentPage: 1, pageSize: 20 });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);

  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [upiAccounts, setUpiAccounts] = useState([]);

  const [bulkType, setBulkType] = useState('');
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkSubcategory, setBulkSubcategory] = useState('');
  const [bulkSubcategories, setBulkSubcategories] = useState([]);
  const [applying, setApplying] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadLookups = useCallback(async () => {
    const [catRes, bankRes, upiRes] = await Promise.all([listCategories(), listBankAccounts(), listUpiAccounts()]);
    setCategories(catRes.data.data);
    setBankAccounts(bankRes.data.data.items);
    setUpiAccounts(upiRes.data.data.items);
  }, []);

  const loadSummary = useCallback(async () => {
    const { data } = await getAllocationSummary();
    setSummary(data.data);
  }, []);

  const loadRows = useCallback(async () => {
    const params = { page, limit: 20 };
    if (tab) params.allocationStatus = tab;
    const { data } = await listTransactions(params);
    setRows(data.data.items);
    setMeta(data.data.meta);
    setSelected([]);
  }, [tab, page]);

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadLookups(), loadSummary(), loadRows()])
        .catch(() => {})
        .finally(() => setLoading(false));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, page])
  );

  useEffect(() => {
    setBulkSubcategory('');
    if (!bulkCategory) {
      setBulkSubcategories([]);
      return;
    }
    const cat = categories.find((c) => c._id === bulkCategory);
    if (cat) setBulkType(cat.type);
    listSubcategories({ category: bulkCategory })
      .then(({ data }) => setBulkSubcategories(data.data))
      .catch(() => setBulkSubcategories([]));
  }, [bulkCategory, categories]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadRows(), loadSummary()]);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleRow = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => {
    const ids = rows.map((r) => r._id);
    setSelected((prev) => (prev.length === ids.length ? [] : ids));
  };

  const refreshAll = async () => {
    await Promise.all([loadRows(), loadSummary()]);
  };

  const applyBulk = async () => {
    if ((!bulkType && !bulkCategory) || selected.length === 0) return;
    setApplying(true);
    try {
      await bulkAllocateTransactions({
        transactionIds: selected,
        type: bulkCategory ? undefined : bulkType || undefined,
        category: bulkCategory || undefined,
        subcategory: bulkSubcategory || undefined,
      });
      setBulkType('');
      setBulkCategory('');
      setBulkSubcategory('');
      await refreshAll();
    } finally {
      setApplying(false);
    }
  };

  const confirmBulkDelete = async () => {
    await bulkDeleteTransactions(selected);
    setBulkDeleteOpen(false);
    await refreshAll();
  };

  const saveEdit = async (payload) => {
    await updateTransaction(editing._id, payload);
    setEditing(null);
    await refreshAll();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating color={brand.teal} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[brand.teal]} />}
      >
        {summary && (
          <Surface style={styles.summaryCard} elevation={1}>
            <View style={styles.summaryRow}>
              <Text variant="bodySmall" style={styles.muted}>
                {summary.fullyAllocatedPct}% of {summary.total} fully allocated
              </Text>
              <Text variant="bodySmall" style={styles.muted}>
                🔴 {summary.UNALLOCATED} · 🟡 {summary.PARTIALLY_ALLOCATED} · 🟢 {summary.FULLY_ALLOCATED}
              </Text>
            </View>
            <ProgressBar progress={summary.fullyAllocatedPct / 100} color={brand.teal} style={styles.progressBar} />
          </Surface>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
          {TABS.map((t) => (
            <Pressable
              key={t.value}
              onPress={() => {
                setTab(t.value);
                setPage(1);
              }}
              style={[styles.tabChip, tab === t.value && styles.tabChipActive]}
            >
              <Text style={{ color: tab === t.value ? '#fff' : '#64748B', fontWeight: '600', fontSize: 13 }}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {selected.length > 0 && (
          <Surface style={styles.bulkCard} elevation={1}>
            <Text variant="bodyMedium" style={{ fontWeight: '700', marginBottom: 8 }}>
              {selected.length} selected
            </Text>
            <PickerField
              label="Category"
              value={bulkCategory}
              onSelect={setBulkCategory}
              options={[
                { value: '', label: 'Not set' },
                ...categories.map((c) => ({ value: c._id, label: `${c.name} (${c.type})` })),
              ]}
            />
            <PickerField
              label="Subcategory (optional)"
              value={bulkSubcategory}
              onSelect={setBulkSubcategory}
              options={[
                { value: '', label: bulkSubcategories.length ? 'None' : 'No subcategories' },
                ...bulkSubcategories.map((s) => ({ value: s._id, label: s.name })),
              ]}
            />
            <View style={styles.bulkActions}>
              <Button
                mode="contained"
                disabled={(!bulkType && !bulkCategory) || applying}
                loading={applying}
                onPress={applyBulk}
                style={{ flex: 1 }}
              >
                Apply
              </Button>
              <Button textColor="#EF4444" onPress={() => setBulkDeleteOpen(true)}>
                Delete
              </Button>
              <Button onPress={() => setSelected([])}>Clear</Button>
            </View>
          </Surface>
        )}

        {rows.length === 0 ? (
          <EmptyState icon="checkbox-marked-outline" title="Nothing here" description="No transactions match this allocation status." />
        ) : (
          <>
            <View style={styles.selectAllRow}>
              <Checkbox
                status={selected.length === rows.length ? 'checked' : selected.length > 0 ? 'indeterminate' : 'unchecked'}
                onPress={toggleAll}
              />
              <Text variant="bodySmall" style={styles.muted}>
                Select all on this page
              </Text>
            </View>

            {rows.map((t) => (
              <Surface key={t._id} style={styles.card} elevation={selected.includes(t._id) ? 2 : 1}>
                <View style={styles.cardRow}>
                  <Checkbox checked={selected.includes(t._id)} onPress={() => toggleRow(t._id)} />
                  <Pressable style={{ flex: 1 }} onPress={() => setEditing(t)}>
                    <View style={styles.chipRow}>
                      <Chip compact textStyle={{ fontSize: 11 }}>
                        {t.type}
                      </Chip>
                      {t.allocationStatus === 'UNALLOCATED' && (
                        <Chip compact textStyle={{ fontSize: 11 }}>
                          🔴 Unallocated
                        </Chip>
                      )}
                      {t.allocationStatus === 'PARTIALLY_ALLOCATED' && (
                        <Chip compact textStyle={{ fontSize: 11 }}>
                          🟡 Partial
                        </Chip>
                      )}
                      {t.allocationStatus === 'FULLY_ALLOCATED' && (
                        <Chip compact textStyle={{ fontSize: 11 }}>
                          🟢 Complete
                        </Chip>
                      )}
                    </View>
                    <View style={styles.cardMainRow}>
                      <View style={{ flex: 1 }}>
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
                      </View>
                      <Text
                        variant="titleSmall"
                        style={{ fontWeight: '700', color: t.type === 'income' ? '#22C55E' : t.type === 'expense' ? '#EF4444' : brand.navy }}
                      >
                        {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''}
                        {formatCurrency(t.amount)}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </Surface>
            ))}

            <View style={styles.pagination}>
              <Button disabled={meta.currentPage <= 1} onPress={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Text variant="bodySmall" style={{ color: '#64748B' }}>
                Page {meta.currentPage} of {Math.max(1, Math.ceil(meta.totalItems / meta.pageSize))}
              </Text>
              <Button
                disabled={meta.currentPage * meta.pageSize >= meta.totalItems}
                onPress={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </View>
          </>
        )}
      </ScrollView>

      <TransactionFormDialog
        open={!!editing}
        initialValues={editing}
        categories={categories}
        bankAccounts={bankAccounts}
        upiAccounts={upiAccounts}
        onClose={() => setEditing(null)}
        onSubmit={saveEdit}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title={`Delete ${selected.length} transaction${selected.length === 1 ? '' : 's'}?`}
        description="This will reverse each one's effect on its related account balance. This can't be undone."
        confirmLabel="Delete All"
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={confirmBulkDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: brand.bg },
  container: { flex: 1, backgroundColor: brand.bg },
  content: { padding: 16, paddingBottom: 48 },
  summaryCard: { borderRadius: 12, padding: 14, backgroundColor: '#FFFFFF', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 4 },
  progressBar: { height: 8, borderRadius: 4 },
  muted: { color: '#64748B' },
  tabsRow: { marginBottom: 12 },
  tabChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', marginRight: 8 },
  tabChipActive: { backgroundColor: brand.navy },
  bulkCard: { borderRadius: 12, padding: 14, backgroundColor: '#F8FAFC', marginBottom: 12 },
  pickerInput: { backgroundColor: '#FFFFFF', marginBottom: 10 },
  bulkActions: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 },
  selectAllRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  card: { borderRadius: 12, backgroundColor: '#FFFFFF', marginBottom: 10 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', paddingRight: 12, paddingVertical: 4 },
  chipRow: { flexDirection: 'row', gap: 6, marginBottom: 6, flexWrap: 'wrap', marginTop: 10 },
  cardMainRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, paddingBottom: 10 },
  bold: { fontWeight: '700' },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
});

export default AllocationScreen;
