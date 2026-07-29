import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, ScrollView, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { FAB, Chip, ActivityIndicator, Text, Menu, TextInput } from 'react-native-paper';

import EmptyState from '../../components/common/EmptyState';
import ManagedItemCard from '../../components/common/ManagedItemCard';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SubcategoryFormDialog from '../../components/subcategories/SubcategoryFormDialog';
import { listTypes } from '../../api/typeApi';
import { listCategories } from '../../api/categoryApi';
import { listSubcategories, createSubcategory, updateSubcategory, deleteSubcategory } from '../../api/subcategoryApi';
import { brand } from '../../theme/theme';

// Mirrors frontend/src/pages/subcategories/Subcategories.jsx — Type tabs narrow the
// category picker, the category picker narrows the subcategory list.
const SubcategoriesScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [types, setTypes] = useState([]);
  const [typeTab, setTypeTab] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [subcategories, setSubcategories] = useState([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadTypes = useCallback(async () => {
    const { data } = await listTypes({ appliesToCategory: true });
    setTypes(data.data);
    setTypeTab((current) => current || data.data[0]?.code || '');
    return data.data;
  }, []);

  const loadCategories = useCallback(async (activeType) => {
    if (!activeType) return [];
    const { data } = await listCategories({ type: activeType });
    setCategories(data.data);
    setCategoryId((current) => (data.data.some((c) => c._id === current) ? current : data.data[0]?._id || ''));
    return data.data;
  }, []);

  const loadSubcategories = useCallback(async (catId) => {
    if (!catId) {
      setSubcategories([]);
      return;
    }
    const { data } = await listSubcategories({ category: catId });
    setSubcategories(data.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const loadedTypes = await loadTypes();
        const activeType = typeTab || loadedTypes[0]?.code;
        const loadedCategories = await loadCategories(activeType);
        const activeCategory = categoryId || loadedCategories[0]?._id;
        await loadSubcategories(activeCategory);
      })()
        .catch(() => {})
        .finally(() => setLoading(false));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typeTab, categoryId])
  );

  const selectedCategory = categories.find((c) => c._id === categoryId);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadSubcategories(categoryId);
    } finally {
      setRefreshing(false);
    }
  };

  const submit = async (values) => {
    if (editing) await updateSubcategory(editing._id, values);
    else await createSubcategory({ ...values, category: categoryId });
    setFormOpen(false);
    setEditing(null);
    loadSubcategories(categoryId);
  };

  const confirmDelete = async () => {
    await deleteSubcategory(deleteTarget._id);
    setDeleteTarget(null);
    loadSubcategories(categoryId);
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
            onPress={() => setTypeTab(t.code)}
            style={[styles.tabChip, typeTab === t.code && styles.tabChipActive]}
          >
            <Text style={{ color: typeTab === t.code ? '#fff' : '#64748B', fontWeight: '600', fontSize: 13 }}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {categories.length > 0 && (
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <Menu
            visible={categoryMenuOpen}
            onDismiss={() => setCategoryMenuOpen(false)}
            anchor={
              <TextInput
                label="Category"
                value={selectedCategory?.name || ''}
                mode="outlined"
                editable={false}
                onPressIn={() => setCategoryMenuOpen(true)}
                right={<TextInput.Icon icon="menu-down" onPress={() => setCategoryMenuOpen(true)} />}
                style={{ backgroundColor: '#FFFFFF' }}
              />
            }
          >
            {categories.map((c) => (
              <Menu.Item
                key={c._id}
                title={c.name}
                onPress={() => {
                  setCategoryId(c._id);
                  setCategoryMenuOpen(false);
                }}
              />
            ))}
          </Menu>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[brand.teal]} />}
      >
        {categories.length === 0 ? (
          <EmptyState icon="shape-outline" title="No categories under this type yet" description="Add a category first — subcategories nest under a category." />
        ) : subcategories.length === 0 ? (
          <EmptyState
            icon="file-tree-outline"
            title="No subcategories yet"
            description={`Add one to break "${selectedCategory?.name}" down further.`}
            actionLabel="Add Subcategory"
            onAction={() => setFormOpen(true)}
          />
        ) : (
          subcategories.map((s) => (
            <ManagedItemCard
              key={s._id}
              color={selectedCategory?.color}
              icon={s.icon}
              title={s.name}
              meta={selectedCategory?.name}
              badges={s.isDefault ? <Chip compact textStyle={{ fontSize: 10 }}>Default</Chip> : null}
              onEdit={() => {
                setEditing(s);
                setFormOpen(true);
              }}
              onDelete={() => setDeleteTarget(s)}
            />
          ))
        )}
      </ScrollView>

      {categoryId && (
        <FAB icon="plus" style={styles.fab} color="#fff" onPress={() => { setEditing(null); setFormOpen(true); }} />
      )}

      <SubcategoryFormDialog
        open={formOpen}
        initialValues={editing}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={submit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this subcategory?"
        description="Transactions already using it will keep their history but you won't be able to select it for new ones."
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

export default SubcategoriesScreen;
