import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import {
  ActivityIndicator,
  Text,
  SegmentedButtons,
  Card,
  IconButton,
  Menu,
  Button,
  Snackbar,
  FAB,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenHeader from '../../components/common/ScreenHeader';
import EmptyState from '../../components/common/EmptyState';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import BankAccountFormDialog from '../../components/accounts/BankAccountFormDialog';
import UpiAccountFormDialog from '../../components/accounts/UpiAccountFormDialog';
import AdjustBalanceDialog from '../../components/accounts/AdjustBalanceDialog';

import { brand } from '../../theme/theme';
import { formatCurrency } from '../../utils/formatters';
import {
  listBankAccounts,
  createBankAccount,
  updateBankAccount,
  adjustBankAccountBalance,
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

const TABS = [
  { value: 'bank', label: 'Bank', icon: 'bank-outline' },
  { value: 'upi', label: 'UPI', icon: 'qrcode' },
  { value: 'cash', label: 'Cash', icon: 'cash' },
];

// Mirrors frontend/src/pages/accounts/Accounts.jsx — tabbed Bank / UPI / Cash, each with
// add / edit / toggle-active / delete, plus balance adjustment for bank accounts and cash.
const AccountsScreen = () => {
  const [tab, setTab] = useState('bank');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  const [bankAccounts, setBankAccounts] = useState([]);
  const [upiAccounts, setUpiAccounts] = useState([]);
  const [cash, setCash] = useState(null);

  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [upiDialogOpen, setUpiDialogOpen] = useState(false);
  const [cashDialogOpen, setCashDialogOpen] = useState(false);
  const [adjustBankTarget, setAdjustBankTarget] = useState(null);
  const [editingBank, setEditingBank] = useState(null);
  const [editingUpi, setEditingUpi] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type, item }
  const [deleting, setDeleting] = useState(false);
  const [menuFor, setMenuFor] = useState(null); // id of card whose menu is open

  const loadAll = useCallback(async () => {
    const [bankRes, upiRes, cashRes] = await Promise.allSettled([listBankAccounts(), listUpiAccounts(), getCashBalance()]);

    if (bankRes.status === 'fulfilled') {
      setBankAccounts(bankRes.value.data.data.items);
    } else {
      setSnackbar('Failed to load bank accounts');
    }
    if (upiRes.status === 'fulfilled') {
      setUpiAccounts(upiRes.value.data.data.items);
    } else {
      setSnackbar('Failed to load UPI accounts');
    }
    if (cashRes.status === 'fulfilled') {
      setCash(cashRes.value.data.data);
    } else {
      setSnackbar('Failed to load cash in hand');
    }
  }, []);

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

  const closeMenu = () => setMenuFor(null);

  const handleEdit = (type, item) => {
    if (type === 'bank') {
      setEditingBank(item);
      setBankDialogOpen(true);
    } else {
      setEditingUpi(item);
      setUpiDialogOpen(true);
    }
    closeMenu();
  };

  const handleToggleActive = async (type, item) => {
    closeMenu();
    try {
      if (type === 'bank') await toggleBankAccountActive(item._id);
      else await toggleUpiAccountActive(item._id);
      setSnackbar('Status updated');
      loadAll();
    } catch (err) {
      setSnackbar(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteClick = (type, item) => {
    setDeleteTarget({ type, item });
    closeMenu();
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      if (deleteTarget.type === 'bank') await deleteBankAccount(deleteTarget.item._id);
      else await deleteUpiAccount(deleteTarget.item._id);
      setSnackbar('Deleted successfully');
      setDeleteTarget(null);
      loadAll();
    } catch (err) {
      setSnackbar(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const submitBank = async (values) => {
    try {
      if (editingBank) await updateBankAccount(editingBank._id, values);
      else await createBankAccount(values);
      setSnackbar(editingBank ? 'Bank account updated' : 'Bank account added');
      setBankDialogOpen(false);
      setEditingBank(null);
      loadAll();
    } catch (err) {
      setSnackbar(err.response?.data?.message || 'Save failed');
    }
  };

  const submitUpi = async (values) => {
    try {
      if (editingUpi) await updateUpiAccount(editingUpi._id, values);
      else await createUpiAccount(values);
      setSnackbar(editingUpi ? 'UPI account updated' : 'UPI account added');
      setUpiDialogOpen(false);
      setEditingUpi(null);
      loadAll();
    } catch (err) {
      setSnackbar(err.response?.data?.message || 'Save failed');
    }
  };

  const submitBankAdjust = async (values) => {
    try {
      await adjustBankAccountBalance(adjustBankTarget._id, values);
      setSnackbar('Balance adjusted');
      setAdjustBankTarget(null);
      loadAll();
    } catch (err) {
      setSnackbar(err.response?.data?.message || 'Adjustment failed');
    }
  };

  const submitCashAdjust = async (values) => {
    try {
      const { data } = await adjustCashBalance(values);
      setCash(data.data);
      setSnackbar('Cash balance updated');
      setCashDialogOpen(false);
    } catch (err) {
      setSnackbar(err.response?.data?.message || 'Adjustment failed');
    }
  };

  const openAddDialog = () => {
    if (tab === 'bank') {
      setEditingBank(null);
      setBankDialogOpen(true);
    } else if (tab === 'upi') {
      setEditingUpi(null);
      setUpiDialogOpen(true);
    } else {
      setCashDialogOpen(true);
    }
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[brand.teal]} />}
      >
        <ScreenHeader title="Accounts" subtitle="Manage your bank accounts, UPI apps, and cash in hand" />

        <View style={styles.tabsWrap}>
          <SegmentedButtons value={tab} onValueChange={setTab} buttons={TABS} />
        </View>

        <View style={styles.listWrap}>
          {tab === 'bank' &&
            (bankAccounts.length === 0 ? (
              <EmptyState
                icon="bank-outline"
                title="No bank accounts yet"
                description="Add your bank accounts to start tracking balances."
                actionLabel="Add Bank Account"
                onAction={openAddDialog}
              />
            ) : (
              bankAccounts.map((acc) => (
                <Card key={acc._id} style={styles.card}>
                  <Card.Content>
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.cardHeaderLeft}>
                        <View style={[styles.iconWrap, { backgroundColor: `${acc.color || brand.navy}1A` }]}>
                          <MaterialCommunityIcons name="bank-outline" size={18} color={acc.color || brand.navy} />
                        </View>
                        <View style={{ flexShrink: 1 }}>
                          <Text variant="titleSmall" style={styles.cardTitle} numberOfLines={1}>
                            {acc.bankName}
                          </Text>
                          <Text variant="bodySmall" style={styles.cardSubtitle} numberOfLines={1}>
                            {acc.accountNickname || acc.accountType}
                            {acc.accountNumberLast4 ? ` •••• ${acc.accountNumberLast4}` : ''}
                          </Text>
                        </View>
                      </View>
                      <Menu
                        visible={menuFor === acc._id}
                        onDismiss={closeMenu}
                        anchor={<IconButton icon="dots-vertical" size={20} onPress={() => setMenuFor(acc._id)} />}
                      >
                        <Menu.Item title="Edit" leadingIcon="pencil-outline" onPress={() => handleEdit('bank', acc)} />
                        <Menu.Item
                          title="Adjust Balance"
                          leadingIcon="cash-sync"
                          onPress={() => {
                            setAdjustBankTarget(acc);
                            closeMenu();
                          }}
                        />
                        <Menu.Item
                          title={acc.isActive ? 'Mark Inactive' : 'Mark Active'}
                          leadingIcon="toggle-switch-outline"
                          onPress={() => handleToggleActive('bank', acc)}
                        />
                        <Menu.Item
                          title="Delete"
                          leadingIcon="trash-can-outline"
                          titleStyle={{ color: brand.error }}
                          onPress={() => handleDeleteClick('bank', acc)}
                        />
                      </Menu>
                    </View>
                    <Text variant="headlineSmall" style={styles.balance}>
                      {formatCurrency(acc.currentBalance, acc.currency)}
                    </Text>
                    <View style={{ marginTop: 8 }}>
                      <StatusChip isActive={acc.isActive} />
                    </View>
                  </Card.Content>
                </Card>
              ))
            ))}

          {tab === 'upi' &&
            (upiAccounts.length === 0 ? (
              <EmptyState
                icon="qrcode"
                title="No UPI accounts yet"
                description="Add the UPI apps you use so transactions can be tagged accurately."
                actionLabel="Add UPI Account"
                onAction={openAddDialog}
              />
            ) : (
              upiAccounts.map((acc) => (
                <Card key={acc._id} style={styles.card}>
                  <Card.Content>
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.cardHeaderLeft}>
                        <View style={[styles.iconWrap, { backgroundColor: 'rgba(201,162,39,0.12)' }]}>
                          <MaterialCommunityIcons name="qrcode" size={18} color={brand.teal} />
                        </View>
                        <View style={{ flexShrink: 1 }}>
                          <Text variant="titleSmall" style={styles.cardTitle} numberOfLines={1}>
                            {acc.nickname || acc.provider}
                          </Text>
                          <Text variant="bodySmall" style={styles.cardSubtitle} numberOfLines={1}>
                            {acc.provider}
                            {acc.upiId ? ` · ${acc.upiId}` : ''}
                          </Text>
                        </View>
                      </View>
                      <Menu
                        visible={menuFor === acc._id}
                        onDismiss={closeMenu}
                        anchor={<IconButton icon="dots-vertical" size={20} onPress={() => setMenuFor(acc._id)} />}
                      >
                        <Menu.Item title="Edit" leadingIcon="pencil-outline" onPress={() => handleEdit('upi', acc)} />
                        <Menu.Item
                          title={acc.isActive ? 'Mark Inactive' : 'Mark Active'}
                          leadingIcon="toggle-switch-outline"
                          onPress={() => handleToggleActive('upi', acc)}
                        />
                        <Menu.Item
                          title="Delete"
                          leadingIcon="trash-can-outline"
                          titleStyle={{ color: brand.error }}
                          onPress={() => handleDeleteClick('upi', acc)}
                        />
                      </Menu>
                    </View>
                    <View style={styles.upiFooterRow}>
                      {acc.linkedBankAccount && (
                        <Text variant="bodySmall" style={styles.linkedChip}>
                          Linked: {acc.linkedBankAccount.bankName}
                        </Text>
                      )}
                      <StatusChip isActive={acc.isActive} />
                    </View>
                  </Card.Content>
                </Card>
              ))
            ))}

          {tab === 'cash' && (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.iconWrap, { backgroundColor: 'rgba(34,197,94,0.12)' }]}>
                    <MaterialCommunityIcons name="cash" size={18} color={brand.success} />
                  </View>
                  <Text variant="titleSmall" style={styles.cardTitle}>
                    Cash in Hand
                  </Text>
                </View>
                <Text variant="headlineMedium" style={[styles.balance, { marginTop: 12 }]}>
                  {cash ? formatCurrency(cash.currentBalance, cash.currency) : '—'}
                </Text>
                <Button mode="outlined" style={{ marginTop: 16, alignSelf: 'flex-start', borderRadius: 8 }} onPress={openAddDialog}>
                  Adjust Balance
                </Button>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      {tab !== 'cash' && (
        <FAB icon="plus" style={styles.fab} color="#fff" customSize={52} onPress={openAddDialog} />
      )}

      <BankAccountFormDialog
        visible={bankDialogOpen}
        initialValues={editingBank}
        onDismiss={() => {
          setBankDialogOpen(false);
          setEditingBank(null);
        }}
        onSubmit={submitBank}
      />

      <UpiAccountFormDialog
        visible={upiDialogOpen}
        initialValues={editingUpi}
        bankAccounts={bankAccounts}
        onDismiss={() => {
          setUpiDialogOpen(false);
          setEditingUpi(null);
        }}
        onSubmit={submitUpi}
      />

      <AdjustBalanceDialog
        visible={cashDialogOpen}
        title="Adjust Cash Balance"
        currentBalanceLabel={cash ? formatCurrency(cash.currentBalance, cash.currency) : '—'}
        onDismiss={() => setCashDialogOpen(false)}
        onSubmit={submitCashAdjust}
      />

      <AdjustBalanceDialog
        visible={Boolean(adjustBankTarget)}
        title={`Adjust Balance — ${adjustBankTarget?.bankName || ''}`}
        currentBalanceLabel={adjustBankTarget ? formatCurrency(adjustBankTarget.currentBalance, adjustBankTarget.currency) : ''}
        onDismiss={() => setAdjustBankTarget(null)}
        onSubmit={submitBankAdjust}
      />

      <ConfirmDialog
        visible={Boolean(deleteTarget)}
        title="Delete this account?"
        description="This won't delete past transactions, but the account will no longer be usable."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onDismiss={() => setDeleteTarget(null)}
      />

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={3000}>
        {snackbar}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: brand.bg },
  loadingContainer: { flex: 1, backgroundColor: brand.bg, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: 96 },
  tabsWrap: { paddingHorizontal: 16, marginTop: 8 },
  listWrap: { paddingHorizontal: 16, marginTop: 16 },
  card: { marginBottom: 12, backgroundColor: brand.paper },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, gap: 12 },
  iconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontWeight: '700', color: brand.navy },
  cardSubtitle: { color: '#64748B' },
  balance: { fontWeight: '700', color: brand.navy, marginTop: 14 },
  upiFooterRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  linkedChip: {
    backgroundColor: '#EEF2F6',
    color: '#475569',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
    fontSize: 12,
  },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: brand.navy },
});

export default AccountsScreen;
