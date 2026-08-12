import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import FinoraCard from '../../components/ui/FinoraCard';
import FinoraEmptyState from '../../components/ui/FinoraEmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import TypeCard from '../../components/types/TypeCard';
import TypeFormDialog from '../../components/types/TypeFormDialog';
import { listTypes, createType, updateType, deleteType } from '../../api/typeApi';
import tokens from '../../theme/tokens';

// Redesigned to match the CategoriesScreen visual language (brief §10):
// colorful icon-forward cards with staggered entrance motion instead of the
// plain admin-table ManagedItemCard rows this screen used before.
const TypesScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [types, setTypes] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    const { data } = await listTypes();
    setTypes(data.data);
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
    if (editing) {
      const { code, ...rest } = values; // code can't be changed after creation
      await updateType(editing._id, rest);
    } else {
      await createType(values);
    }
    setFormOpen(false);
    setEditing(null);
    load();
  };

  const confirmDelete = async () => {
    await deleteType(deleteTarget._id);
    setDeleteTarget(null);
    load();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating color={tokens.brand.teal500} size="large" />
      </View>
    );
  }

  const categoryEligibleCount = types.filter((t) => t.appliesToCategory).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Types</Text>
          {types.length > 0 && (
            <View style={styles.headerTotalRow}>
              <MaterialCommunityIcons name="shape-plus-outline" size={13} color={tokens.neutral.textMuted} />
              <Text style={styles.headerTotal}>
                {types.length} type{types.length === 1 ? '' : 's'} · {categoryEligibleCount} category-eligible
              </Text>
            </View>
          )}
        </View>
        <Pressable style={styles.addBtn} onPress={() => { setEditing(null); setFormOpen(true); }}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[tokens.brand.teal500]} />}
      >
        {types.length === 0 ? (
          <FinoraCard>
            <FinoraEmptyState
              icon="tune"
              title="No types yet"
              description="Types like Income and Expense drive how categories are grouped across the app."
              actionLabel="Add Type"
              onAction={() => setFormOpen(true)}
            />
          </FinoraCard>
        ) : (
          types.map((t, i) => (
            <Animated.View key={t._id} entering={FadeInDown.delay(Math.min(i, 8) * 45).duration(280)}>
              <TypeCard
                type={t}
                onPress={() => { setEditing(t); setFormOpen(true); }}
                onDelete={() => setDeleteTarget(t)}
              />
            </Animated.View>
          ))
        )}
      </ScrollView>

      <TypeFormDialog
        open={formOpen}
        initialValues={editing}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={submit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this type?"
        description="This can't be undone. You can't delete a type that's still used by a category."
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.neutral.bg },
  container: { flex: 1, backgroundColor: tokens.neutral.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: tokens.space.lg, paddingTop: tokens.space.sm, marginBottom: tokens.space.sm },
  pageTitle: { ...tokens.typography.h1, color: tokens.neutral.textPrimary },
  headerTotalRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  headerTotal: { ...tokens.typography.bodySm, color: tokens.neutral.textMuted },
  addBtn: { backgroundColor: tokens.brand.ink800, paddingHorizontal: 14, paddingVertical: 8, borderRadius: tokens.radius.pill },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  content: { padding: tokens.space.lg, paddingTop: 0, paddingBottom: 48 },
});

export default TypesScreen;
