import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Surface, IconButton, FAB, Chip, ActivityIndicator } from 'react-native-paper';

import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import MerchantFormDialog from '../../components/merchants/MerchantFormDialog';
import { listMerchants, createMerchant, updateMerchant, deleteMerchant } from '../../api/merchantApi';
import { listCategories } from '../../api/categoryApi';
import { formatCurrency } from '../../utils/formatters';
import { brand } from '../../theme/theme';

// Mirrors frontend/src/pages/merchants/Merchants.jsx
const MerchantsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [merchants, setMerchants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    const [merchantRes, catRes] = await Promise.all([listMerchants(), listCategories({ type: 'expense' })]);
    setMerchants(merchantRes.data.data);
    setCategories(catRes.data.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load()
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const submit = async (values) => {
    if (editing) await updateMerchant(editing._id, values);
    else await createMerchant(values);
    setDialogOpen(false);
    setEditing(null);
    load();
  };

  const confirmDelete = async () => {
    await deleteMerchant(deleteTarget._id);
    setDeleteTarget(null);
    load();
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
        {merchants.length === 0 ? (
          <EmptyState
            icon="store-outline"
            title="No merchants yet"
            description="Merchants are usually created automatically during statement import — or add one manually here."
            actionLabel="Add Merchant"
            onAction={() => setDialogOpen(true)}
          />
        ) : (
          merchants.map((m) => (
            <Surface key={m._id} style={styles.card} elevation={1}>
              <View style={styles.topRow}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleSmall" style={styles.bold}>
                    {m.name}
                  </Text>
                  {m.defaultCategory && (
                    <Chip compact style={{ marginTop: 4, alignSelf: 'flex-start' }} textStyle={{ fontSize: 11 }}>
                      {m.defaultCategory.name}
                    </Chip>
                  )}
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <IconButton icon="pencil-outline" size={18} onPress={() => { setEditing(m); setDialogOpen(true); }} />
                  <IconButton icon="delete-outline" size={18} iconColor="#EF4444" onPress={() => setDeleteTarget(m)} />
                </View>
              </View>
              <Text variant="labelSmall" style={styles.muted}>
                {m.transactionCount || 0} transactions · {formatCurrency(m.totalPaid || 0)} total
              </Text>
            </Surface>
          ))
        )}
      </ScrollView>

      <FAB icon="plus" style={styles.fab} color="#fff" onPress={() => { setEditing(null); setDialogOpen(true); }} />

      <MerchantFormDialog
        open={dialogOpen}
        initialValues={editing}
        categories={categories}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onSubmit={submit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this merchant?"
        description="Past transactions keep their history, but future imports won't auto-match to this merchant anymore."
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: brand.bg },
  container: { flex: 1, backgroundColor: brand.bg },
  content: { padding: 16, paddingBottom: 96 },
  card: { borderRadius: 12, padding: 14, backgroundColor: '#FFFFFF', marginBottom: 10 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bold: { fontWeight: '700' },
  muted: { color: '#94A3B8', marginTop: 8 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: brand.navy },
});

export default MerchantsScreen;
