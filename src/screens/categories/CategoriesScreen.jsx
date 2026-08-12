import { useState, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import FinoraCard from '../../components/ui/FinoraCard';
import FinoraEmptyState from '../../components/ui/FinoraEmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CategoryCard from '../../components/categories/CategoryCard';
import CategoryActionSheet from '../../components/categories/CategoryActionSheet';
import CategoryFormDialog from '../../components/categories/CategoryFormDialog';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../../api/categoryApi';
import { listTypes } from '../../api/typeApi';
import { listSubcategories } from '../../api/subcategoryApi';
import { getCategoryBreakdown } from '../../api/dashboardApi';
import { formatCurrency } from '../../utils/formatters';
import tokens from '../../theme/tokens';

// Redesigned per brief §10 — spending-aware category cards instead of a flat
// admin list. Monthly spend + % share come from the real dashboard breakdown
// endpoint; subcategory counts are fetched per category (small personal
// category lists, so N parallel calls is cheap) since there's no bulk-count
// endpoint on the backend.
const CategoriesScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [types, setTypes] = useState([]);
  const [tab, setTab] = useState('');
  const [categories, setCategories] = useState([]);
  const [subCounts, setSubCounts] = useState({});
  const [breakdown, setBreakdown] = useState({});

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionTarget, setActionTarget] = useState(null);

  const loadTypes = useCallback(async () => {
    const { data } = await listTypes({ appliesToCategory: true });
    setTypes(data.data);
    setTab((current) => current || data.data[0]?.code || '');
    return data.data;
  }, []);

  const loadCategories = useCallback(async (activeTab) => {
    if (!activeTab) return;
    const [catRes, breakdownRes] = await Promise.all([
      listCategories({ type: activeTab }),
      getCategoryBreakdown({ type: activeTab }),
    ]);
    setCategories(catRes.data.data);

    const breakdownMap = {};
    breakdownRes.data.data.forEach((b) => { breakdownMap[b.categoryId] = b; });
    setBreakdown(breakdownMap);

    const counts = await Promise.all(
      catRes.data.data.map((c) => listSubcategories({ category: c._id }).then((r) => [c._id, r.data.data.length]).catch(() => [c._id, 0]))
    );
    setSubCounts(Object.fromEntries(counts));
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
        <ActivityIndicator animating color={tokens.brand.teal500} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Categories</Text>
          {categories.length > 0 && (
            <View style={styles.headerTotalRow}>
              <MaterialCommunityIcons name="chart-donut" size={13} color={tokens.neutral.textMuted} />
              <Text style={styles.headerTotal}>
                {formatCurrency(Object.values(breakdown).reduce((sum, b) => sum + (b.total || 0), 0))} this month
              </Text>
            </View>
          )}
        </View>
        <Pressable style={styles.addBtn} onPress={() => { setEditing(null); setDialogOpen(true); }}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow} contentContainerStyle={{ paddingHorizontal: tokens.space.lg }}>
        {types.map((t) => {
          const active = tab === t.code;
          const color = t.color || tokens.brand.ink800;
          return (
            <Pressable
              key={t.code}
              onPress={() => setTab(t.code)}
              style={[styles.tab, { backgroundColor: active ? color : `${color}15` }]}
            >
              <MaterialCommunityIcons name={t.icon || 'label'} size={13} color={active ? '#fff' : color} style={{ marginRight: 5 }} />
              <Text style={[styles.tabLabel, { color: active ? '#fff' : color }]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[tokens.brand.teal500]} />}
      >
        {types.length === 0 ? (
          <FinoraCard>
            <FinoraEmptyState icon="tune" title="No category-eligible types yet" description="Add a type (like Income or Expense) from the Types page before you can create categories." />
          </FinoraCard>
        ) : categories.length === 0 ? (
          <FinoraCard>
            <FinoraEmptyState
              icon="shape-outline"
              title="No categories yet"
              description="Add a category to start organizing your transactions."
              actionLabel="Add Category"
              onAction={() => setDialogOpen(true)}
            />
          </FinoraCard>
        ) : (
          categories.map((cat, i) => (
            <Animated.View key={cat._id} entering={FadeInDown.delay(Math.min(i, 8) * 45).duration(280)}>
              <CategoryCard
                icon={cat.icon || 'shape-outline'}
                color={cat.color}
                name={cat.name}
                subcategoryCount={subCounts[cat._id] ?? 0}
                monthTotal={breakdown[cat._id]?.total || 0}
                percentage={breakdown[cat._id]?.percentage}
                isDefault={cat.isDefault}
                onPress={() => navigation.navigate('Subcategories', { categoryId: cat._id })}
                onMenuPress={() => setActionTarget(cat)}
              />
            </Animated.View>
          ))
        )}
      </ScrollView>

      <CategoryActionSheet
        visible={!!actionTarget}
        category={actionTarget}
        onClose={() => setActionTarget(null)}
        onManageSubcategories={() => navigation.navigate('Subcategories', { categoryId: actionTarget._id })}
        onEdit={() => { setEditing(actionTarget); setDialogOpen(true); }}
        onDelete={() => setDeleteTarget(actionTarget)}
      />

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
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.neutral.bg },
  container: { flex: 1, backgroundColor: tokens.neutral.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: tokens.space.lg, paddingTop: tokens.space.sm },
  pageTitle: { ...tokens.typography.h1, color: tokens.neutral.textPrimary },
  addBtn: { backgroundColor: tokens.brand.ink800, paddingHorizontal: 14, paddingVertical: 8, borderRadius: tokens.radius.pill },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  tabsRow: { paddingVertical: tokens.space.md, flexGrow: 0 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: tokens.radius.pill, marginRight: 8 },
  tabLabel: { ...tokens.typography.bodySm, fontWeight: '700' },
  content: { padding: tokens.space.lg, paddingTop: 0, paddingBottom: 48 },
});

export default CategoriesScreen;
