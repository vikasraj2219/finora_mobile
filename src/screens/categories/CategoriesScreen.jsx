import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, ScrollView, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { FAB, Chip, ActivityIndicator, Text } from 'react-native-paper';

import EmptyState from '../../components/common/EmptyState';
import ManagedItemCard from '../../components/common/ManagedItemCard';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CategoryFormDialog from '../../components/categories/CategoryFormDialog';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../../api/categoryApi';
import { listTypes } from '../../api/typeApi';
import { brand } from '../../theme/theme';

// Mirrors frontend/src/pages/categories/Categories.jsx — type tabs driven by the
// real Type collection, one category list per type.
const CategoriesScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [types, setTypes] = useState([]);
  const [tab, setTab] = useState('');
  const [categories, setCategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadTypes = useCallback(async () => {
    const { data } = await listTypes({ appliesToCategory: true });
    setTypes(data.data);
    setTab((current) => current || data.data[0]?.code || '');
    return data.data;
  }, []);

  const loadCategories = useCallback(async (activeTab) => {
    if (!activeTab) return;
    const { data } = await listCategories({ type: activeTab });
    setCategories(data.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTypes()
        .then((loadedTypes) => loadCategories(tab || loadedTypes[0]?.code))
        .catch(() => {})
        .finally(() => setLoading(false));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadCategories(tab);
    } finally {
      setRefreshing(false);
    }
  };

  const submit = async (values) => {
    if (editing) await updateCategory(editing._id, values);
    else await createCategory(values);
    setDialogOpen(false);
    setEditing(null);
    loadCategories(tab);
  };

  const confirmDelete = async () => {
    await deleteCategory(deleteTarget._id);
    setDeleteTarget(null);
    loadCategories(tab);
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {types.map((t) => (
          <Pressable
            key={t.code}
            onPress={() => setTab(t.code)}
            style={[styles.tabChip, tab === t.code && styles.tabChipActive]}
          >
            <Text style={{ color: tab === t.code ? '#fff' : '#64748B', fontWeight: '600', fontSize: 13 }}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[brand.teal]} />}
      >
        {types.length === 0 ? (
          <EmptyState
            icon="tune"
            title="No category-eligible types yet"
            description="Add a type (like Income or Expense) from the Types page before you can create categories."
          />
        ) : categories.length === 0 ? (
          <EmptyState
            icon="shape-outline"
            title="No categories yet"
            description="Add a category to start organizing your transactions."
            actionLabel="Add Category"
            onAction={() => setDialogOpen(true)}
          />
        ) : (
          categories.map((cat) => (
            <ManagedItemCard
              key={cat._id}
              color={cat.color}
              icon={cat.icon}
              title={cat.name}
              meta={cat.group}
              badges={cat.isDefault ? <Chip compact textStyle={{ fontSize: 10 }}>Default</Chip> : null}
              onEdit={() => {
                setEditing(cat);
                setDialogOpen(true);
              }}
              onDelete={() => setDeleteTarget(cat)}
            />
          ))
        )}
      </ScrollView>

      {types.length > 0 && (
        <FAB icon="plus" style={styles.fab} color="#fff" onPress={() => { setEditing(null); setDialogOpen(true); }} />
      )}

      <CategoryFormDialog
        open={dialogOpen}
        initialValues={editing}
        defaultType={tab}
        types={types}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onSubmit={submit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this category?"
        description="Transactions already using this category will keep their history but you won't be able to select it for new ones."
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
  tabsRow: { paddingVertical: 12, flexGrow: 0 },
  tabChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', marginRight: 8 },
  tabChipActive: { backgroundColor: brand.navy },
  content: { padding: 16, paddingTop: 0, paddingBottom: 96 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: brand.navy },
});

export default CategoriesScreen;
