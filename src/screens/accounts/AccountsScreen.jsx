import { useState, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, IconButton, FAB, Menu, Chip, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';

import EmptyState from '../../components/common/EmptyState';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import BankAccountFormDialog from '../../components/accounts/BankAccountFormDialog';
import UpiAccountFormDialog from '../../components/accounts/UpiAccountFormDialog';
import CashAdjustDialog from '../../components/accounts/CashAdjustDialog';
import { formatCurrency } from '../../utils/formatters';
import { brand } from '../../theme/theme';

import {
  listBankAccounts,
  createBankAccount,
  updateBankAccount,
  toggleBankAccountActive,
  deleteBankAccount,
} from '../../api/bankAccountApi';
import {
  listUpiAccounts,
  createUpiAccount,
  updateUpiAccount,
  toggleUpiAccountActive,
  deleteUpiAccount,
} from '../../api/upiAccountApi';
import { getCashBalance, adjustCashBalance } from '../../api/cashApi';
import { getAccountsAllocationSummary } from '../../api/transactionApi';

const AccountCard = ({ children, onMenuPress }) => (
  <Surface style={styles.card} elevation={1}>
    <View style={styles.cardTopRow}>
      <View style={{ flex: 1 }}>{children}</View>
      {onMenuPress && (
        <IconButton
          icon="dots-vertical"
          size={20}
          onPress={(e) => onMenuPress({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })}
          style={{ margin: 0 }}
        />
      )}
    </View>
  </Surface>
);

// Mirrors frontend/src/pages/accounts/Accounts.jsx — Bank / UPI / Cash tabs, each
// account as a card, FAB to add, overflow menu for edit/toggle/delete.
const AccountsScreen = () => {
  const navigation = useNavigation();
  const [tab, setTab] = useState('bank');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [bankAccounts, setBankAccounts] = useState([]);
  const [upiAccounts, setUpiAccounts] = useState([]);
  const [cash, setCash] = useState(null);
  const [allocationByAccount, setAllocationByAccount] = useState({ bank: {}, upi: {} });

  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [upiDialogOpen, setUpiDialogOpen] = useState(false);
  const [cashDialogOpen, setCashDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [editingUpi, setEditingUpi] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type, item }
  const [menuTarget, setMenuTarget] = useState(null); // { type, item }
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });

  const loadAll = useCallback(async () => {
    const [bankRes, upiRes, cashRes] = await Promise.allSettled([
      listBankAccounts(),
      listUpiAccounts(),
      getCashBalance(),
    ]);
    if (bankRes.status === 'fulfilled') setBankAccounts(bankRes.value.data.data.items);
    if (upiRes.status === 'fulfilled') setUpiAccounts(upiRes.value.data.data.items);
    if (cashRes.status === 'fulfilled') setCash(cashRes.value.data.data);

    getAccountsAllocationSummary()
      .then(({ data }) => setAllocationByAccount(data.data))
      .catch(() => {});
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

  const handleEdit = () => {
    if (menuTarget.type === 'bank') {
      setEditingBank(menuTarget.item);
      setBankDialogOpen(true);
    } else {
      setEditingUpi(menuTarget.item);
      setUpiDialogOpen(true);
    }
    setMenuTarget(null);
  };

  const handleToggleActive = async () => {
    const target = menuTarget;
    setMenuTarget(null);
    try {
      if (target.type === 'bank') await toggleBankAccountActive(target.item._id);
      else await toggleUpiAccountActive(target.item._id);
      loadAll();
    } catch (err) {
      // silent — non-critical toggle
    }
  };

  const confirmDelete = async () => {
    try {
      if (deleteTarget.type === 'bank') await deleteBankAccount(deleteTarget.item._id);
      else await deleteUpiAccount(deleteTarget.item._id);
      setDeleteTarget(null);
      loadAll();
    } catch (err) {
      setDeleteTarget(null);
    }
  };

  const submitBank = async (values) => {
    if (editingBank) await updateBankAccount(editingBank._id, values);
    else await createBankAccount(values);
    setBankDialogOpen(false);
    setEditingBank(null);
    loadAll();
  };

  const submitUpi = async (values) => {
    if (editingUpi) await updateUpiAccount(editingUpi._id, values);
    else await createUpiAccount(values);
    setUpiDialogOpen(false);
    setEditingUpi(null);
    loadAll();
  };

  const submitCashAdjust = async (values) => {
    const { data } = await adjustCashBalance(values);
    setCash(data.data);
  };

  const allocationText = (bucket) =>
    bucket ? `${bucket.totalTransactions} txns · 🔴 ${bucket.unallocated} · 🟡 ${bucket.partiallyAllocated} · 🟢 ${bucket.fullyAllocated}` : null;

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
        <SegmentedButtons
          value={tab}
          onValueChange={setTab}
          buttons={[
            { value: 'bank', label: 'Bank' },
            { value: 'upi', label: 'UPI' },
            { value: 'cash', label: 'Cash' },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[brand.teal]} />}
      >
        {tab === 'bank' &&
          (bankAccounts.length === 0 ? (
            <EmptyState
              icon="bank-outline"
              title="No bank accounts yet"
              description="Add your first bank account to start tracking balances."
              actionLabel="Add Bank Account"
              onAction={() => setBankDialogOpen(true)}
            />
          ) : (
            bankAccounts.map((acc) => (
              <AccountCard key={acc._id} onMenuPress={(pos) => { setMenuAnchor(pos); setMenuTarget({ type: 'bank', item: acc }); }}>
                <View style={styles.rowStart}>
                  <View style={[styles.iconWrap, { backgroundColor: `${brand.navy}1A` }]}>
                    <MaterialCommunityIcons name="bank-outline" size={18} color={brand.navy} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleSmall" style={styles.bold}>
                      {acc.bankName}
                    </Text>
                    <Text variant="bodySmall" style={styles.muted}>
                      {acc.accountNickname || acc.accountType}
                      {acc.accountNumberLast4 ? ` •••• ${acc.accountNumberLast4}` : ''}
                    </Text>
                  </View>
                </View>
                <Text variant="headlineSmall" style={styles.balance}>
                  {formatCurrency(acc.currentBalance, acc.currency)}
                </Text>
                <View style={{ marginTop: 8, marginBottom: 4 }}>
                  <StatusChip isActive={acc.isActive} />
                </View>
                {allocationText(allocationByAccount.bank[acc._id]) && (
                  <Text variant="labelSmall" style={styles.muted}>
                    {allocationText(allocationByAccount.bank[acc._id])}
                  </Text>
                )}
                <Button compact onPress={() => navigation.navigate('Transactions')} style={{ alignSelf: 'flex-start', marginTop: 4, marginLeft: -8 }}>
                  View Transactions
                </Button>
              </AccountCard>
            ))
          ))}

        {tab === 'upi' &&
          (upiAccounts.length === 0 ? (
            <EmptyState
              icon="qrcode"
              title="No UPI accounts yet"
              description="Add the UPI apps you use so transactions can be tagged accurately."
              actionLabel="Add UPI Account"
              onAction={() => setUpiDialogOpen(true)}
            />
          ) : (
            upiAccounts.map((acc) => (
              <AccountCard key={acc._id} onMenuPress={(pos) => { setMenuAnchor(pos); setMenuTarget({ type: 'upi', item: acc }); }}>
                <View style={styles.rowStart}>
                  <View style={[styles.iconWrap, { backgroundColor: 'rgba(201,162,39,0.12)' }]}>
                    <MaterialCommunityIcons name="qrcode" size={18} color={brand.teal} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleSmall" style={styles.bold}>
                      {acc.nickname || acc.provider}
                    </Text>
                    <Text variant="bodySmall" style={styles.muted}>
                      {acc.provider} {acc.upiId ? `· ${acc.upiId}` : ''}
                    </Text>
                  </View>
                </View>
                <View style={styles.chipRow}>
                  {acc.linkedBankAccount && (
                    <Chip compact style={{ marginRight: 6 }}>
                      Linked: {acc.linkedBankAccount.bankName}
                    </Chip>
                  )}
                  <StatusChip isActive={acc.isActive} />
                </View>
                {allocationText(allocationByAccount.upi[acc._id]) && (
                  <Text variant="labelSmall" style={styles.muted}>
                    {allocationText(allocationByAccount.upi[acc._id])}
                  </Text>
                )}
                <Button compact onPress={() => navigation.navigate('Transactions')} style={{ alignSelf: 'flex-start', marginTop: 4, marginLeft: -8 }}>
                  View Transactions
                </Button>
              </AccountCard>
            ))
          ))}

        {tab === 'cash' && (
          <Surface style={styles.card} elevation={1}>
            <View style={styles.rowStart}>
              <View style={[styles.iconWrap, { backgroundColor: 'rgba(34,197,94,0.12)' }]}>
                <MaterialCommunityIcons name="cash" size={18} color="#22C55E" />
              </View>
              <Text variant="titleSmall" style={styles.bold}>
                Cash in Hand
              </Text>
            </View>
            <Text variant="headlineMedium" style={styles.balance}>
              {cash ? formatCurrency(cash.currentBalance, cash.currency) : '—'}
            </Text>
            <IconButton
              icon="pencil-outline"
              mode="outlined"
              onPress={() => setCashDialogOpen(true)}
              style={{ alignSelf: 'flex-start', marginTop: 8 }}
            />
          </Surface>
        )}
      </ScrollView>

      {tab !== 'cash' && (
        <FAB
          icon="plus"
          style={styles.fab}
          color="#fff"
          onPress={() => (tab === 'bank' ? setBankDialogOpen(true) : setUpiDialogOpen(true))}
        />
      )}

      <Menu visible={!!menuTarget} onDismiss={() => setMenuTarget(null)} anchor={menuAnchor}>
        <Menu.Item title="Edit" onPress={handleEdit} />
        <Menu.Item title={menuTarget?.item?.isActive ? 'Mark Inactive' : 'Mark Active'} onPress={handleToggleActive} />
        <Menu.Item
          title="Delete"
          titleStyle={{ color: '#EF4444' }}
          onPress={() => {
            setDeleteTarget(menuTarget);
            setMenuTarget(null);
          }}
        />
      </Menu>

      <BankAccountFormDialog
        open={bankDialogOpen}
        initialValues={editingBank}
        onClose={() => {
          setBankDialogOpen(false);
          setEditingBank(null);
        }}
        onSubmit={submitBank}
      />
      <UpiAccountFormDialog
        open={upiDialogOpen}
        initialValues={editingUpi}
        bankAccounts={bankAccounts}
        onClose={() => {
          setUpiDialogOpen(false);
          setEditingUpi(null);
        }}
        onSubmit={submitUpi}
      />
      <CashAdjustDialog
        open={cashDialogOpen}
        currentBalance={cash ? formatCurrency(cash.currentBalance, cash.currency) : '—'}
        onClose={() => setCashDialogOpen(false)}
        onSubmit={submitCashAdjust}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this account?"
        description="This won't delete past transactions, but the account will no longer be usable."
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
  header: { padding: 16, paddingBottom: 8 },
  content: { padding: 16, paddingTop: 4, paddingBottom: 96 },
  card: { borderRadius: 12, padding: 16, backgroundColor: '#FFFFFF', marginBottom: 12 },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  rowStart: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  bold: { fontWeight: '700' },
  muted: { color: '#64748B', marginTop: 2 },
  balance: { fontWeight: '700', marginTop: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: brand.navy },
});

export default AccountsScreen;
