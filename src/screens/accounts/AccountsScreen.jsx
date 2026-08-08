import { useState, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import FinoraCard from '../../components/ui/FinoraCard';
import FinoraSectionHeader from '../../components/ui/FinoraSectionHeader';
import FinoraEmptyState from '../../components/ui/FinoraEmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import AccountWalletCard from '../../components/accounts/AccountWalletCard';
import AccountActionSheet from '../../components/accounts/AccountActionSheet';
import AddAccountSheet from '../../components/accounts/AddAccountSheet';
import BankAccountFormDialog from '../../components/accounts/BankAccountFormDialog';
import UpiAccountFormDialog from '../../components/accounts/UpiAccountFormDialog';
import CashAdjustDialog from '../../components/accounts/CashAdjustDialog';
import { formatCurrency } from '../../utils/formatters';
import tokens from '../../theme/tokens';

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

// Redesigned per brief §7 — a wallet, not a CRUD page: Total Balance up top,
// grouped account cards (Bank / UPI / Cash — the only account types the
// backend actually models), bottom sheet for both adding and acting on an
// account instead of a FAB-per-tab + dots-menu.
const AccountsScreen = () => {
  const navigation = useNavigation();
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionTarget, setActionTarget] = useState(null); // { type, item }
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  const loadAll = useCallback(async () => {
    const [bankRes, upiRes, cashRes] = await Promise.allSettled([listBankAccounts(), listUpiAccounts(), getCashBalance()]);
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

  const handleAddSelect = (key) => {
    if (key === 'bank') setBankDialogOpen(true);
    else setUpiDialogOpen(true);
  };

  const handleEdit = () => {
    if (actionTarget.type === 'bank') {
      setEditingBank(actionTarget.item);
      setBankDialogOpen(true);
    } else {
      setEditingUpi(actionTarget.item);
      setUpiDialogOpen(true);
    }
  };

  const handleToggleActive = async () => {
    try {
      if (actionTarget.type === 'bank') await toggleBankAccountActive(actionTarget.item._id);
      else await toggleUpiAccountActive(actionTarget.item._id);
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

  const activeBankTotal = bankAccounts.filter((a) => a.isActive).reduce((sum, a) => sum + a.currentBalance, 0);
  const totalBalance = activeBankTotal + (cash?.currentBalance || 0);
  const accountCount = bankAccounts.filter((a) => a.isActive).length + upiAccounts.filter((a) => a.isActive).length;

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
        <Text style={styles.pageTitle}>Accounts</Text>

        {/* Total balance */}
        <FinoraCard style={styles.balanceCard} elevation="medium">
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceValue}>{formatCurrency(totalBalance)}</Text>
          <Text style={styles.balanceSub}>
            Across {accountCount} account{accountCount === 1 ? '' : 's'} + cash
          </Text>
        </FinoraCard>

        {/* Bank accounts */}
        <FinoraSectionHeader title="Bank Accounts" style={{ marginTop: tokens.space.xl }} />
        {bankAccounts.length === 0 ? (
          <FinoraCard>
            <FinoraEmptyState
              icon="bank-outline"
              title="No bank accounts yet"
              description="Add your first bank account to start tracking balances."
              actionLabel="Add Bank Account"
              onAction={() => setBankDialogOpen(true)}
            />
          </FinoraCard>
        ) : (
          bankAccounts.map((acc) => {
            const bucket = allocationByAccount.bank[acc._id];
            return (
              <AccountWalletCard
                key={acc._id}
                icon="bank-outline"
                iconTone={tokens.brand.ink800}
                name={acc.bankName}
                subtitle={acc.accountNickname || acc.accountType}
                maskedNumber={acc.accountNumberLast4 ? `•••• ${acc.accountNumberLast4}` : null}
                balance={acc.currentBalance}
                currency={acc.currency}
                isActive={acc.isActive}
                transactionCount={bucket?.totalTransactions}
                updatedAt={acc.updatedAt}
                onPress={() => setActionTarget({ type: 'bank', item: acc })}
              />
            );
          })
        )}

        {/* UPI accounts */}
        <FinoraSectionHeader title="UPI Accounts" style={{ marginTop: tokens.space.lg }} />
        {upiAccounts.length === 0 ? (
          <FinoraCard>
            <FinoraEmptyState
              icon="qrcode"
              title="No UPI accounts yet"
              description="Add the UPI apps you use so transactions can be tagged accurately."
              actionLabel="Add UPI Account"
              onAction={() => setUpiDialogOpen(true)}
            />
          </FinoraCard>
        ) : (
          upiAccounts.map((acc) => {
            const bucket = allocationByAccount.upi[acc._id];
            return (
              <AccountWalletCard
                key={acc._id}
                icon="qrcode"
                iconTone={tokens.brand.teal500}
                name={acc.nickname || acc.provider}
                subtitle={acc.provider}
                maskedNumber={acc.upiId}
                balance={null}
                isActive={acc.isActive}
                transactionCount={bucket?.totalTransactions}
                updatedAt={acc.updatedAt}
                onPress={() => setActionTarget({ type: 'upi', item: acc })}
              />
            );
          })
        )}

        {/* Cash */}
        <FinoraSectionHeader title="Cash" style={{ marginTop: tokens.space.lg }} />
        <Pressable onPress={() => setCashDialogOpen(true)}>
          <FinoraCard>
            <View style={styles.cashRow}>
              <View style={[styles.cashIconWrap, { backgroundColor: `${tokens.semantic.income}17` }]}>
                <MaterialCommunityIcons name="cash" size={19} color={tokens.semantic.income} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>Cash in Hand</Text>
                <Text style={styles.subtitle}>Tap to adjust balance</Text>
              </View>
              <Text style={styles.balance}>{cash ? formatCurrency(cash.currentBalance, cash.currency) : '—'}</Text>
            </View>
          </FinoraCard>
        </Pressable>

        <View style={{ height: 90 }} />
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => setAddSheetOpen(true)}>
        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
      </Pressable>

      <AddAccountSheet visible={addSheetOpen} onClose={() => setAddSheetOpen(false)} onSelect={handleAddSelect} />

      <AccountActionSheet
        visible={!!actionTarget}
        account={actionTarget?.item}
        onClose={() => setActionTarget(null)}
        onViewTransactions={() => navigation.navigate('Transactions')}
        onEdit={handleEdit}
        onToggleActive={handleToggleActive}
        onDelete={() => setDeleteTarget(actionTarget)}
      />

      <BankAccountFormDialog
        open={bankDialogOpen}
        initialValues={editingBank}
        onClose={() => { setBankDialogOpen(false); setEditingBank(null); }}
        onSubmit={submitBank}
      />
      <UpiAccountFormDialog
        open={upiDialogOpen}
        initialValues={editingUpi}
        bankAccounts={bankAccounts}
        onClose={() => { setUpiDialogOpen(false); setEditingUpi(null); }}
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
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.neutral.bg },
  container: { flex: 1, backgroundColor: tokens.neutral.bg },
  content: { padding: tokens.space.lg },
  pageTitle: { ...tokens.typography.h1, color: tokens.neutral.textPrimary, marginBottom: tokens.space.lg },

  balanceCard: { backgroundColor: tokens.brand.ink800 },
  balanceLabel: { ...tokens.typography.bodySm, color: 'rgba(255,255,255,0.75)' },
  balanceValue: { ...tokens.typography.display, color: '#fff', marginTop: 6 },
  balanceSub: { ...tokens.typography.bodySm, color: 'rgba(255,255,255,0.75)', marginTop: tokens.space.md },

  cashRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cashIconWrap: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  name: { ...tokens.typography.bodyLg, fontWeight: '700', color: tokens.neutral.textPrimary },
  subtitle: { ...tokens.typography.caption, color: tokens.neutral.textMuted, marginTop: 1 },
  balance: { ...tokens.typography.h3, color: tokens.neutral.textPrimary },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: tokens.brand.ink800,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.high,
  },
});

export default AccountsScreen;
