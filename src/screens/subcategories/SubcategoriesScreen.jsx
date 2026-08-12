import { useState, useCallback } from 'react';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import FinoraCard from '../../components/ui/FinoraCard';
import FinoraEmptyState from '../../components/ui/FinoraEmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SubcategoryFormDialog from '../../components/subcategories/SubcategoryFormDialog';
import { listTypes } from '../../api/typeApi';
import { listCategories } from '../../api/categoryApi';
import { listSubcategories, createSubcategory, updateSubcategory, deleteSubcategory } from '../../api/subcategoryApi';
import { getCategoryBreakdown } from '../../api/dashboardApi';
import { formatCurrency } from '../../utils/formatters';
import tokens from '../../theme/tokens';

// Redesigned per brief §11 — clean hierarchy: category header with its real
// monthly total, then a plain list of subcategories (icon + name), swipe left
// to delete. Per-subcategory monthly spending isn't shown — there's no
// subcategory-level breakdown endpoint on the backend (only category-level),
// so rather than approximate or fake it, it's left out; flagged as a
// potential backend addition if you want it.
const SubcategoriesScreen = () => {
  const route = useRoute();
  const presetCategoryId = route.params?.categoryId;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [types, setTypes] = useState([]);
  const [typeTab, setTypeTab] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(presetCategoryId || '');
  const [presetResolved, setPresetResolved] = useState(!presetCategoryId);
  const [categorySwitcherOpen, setCategorySwitcherOpen] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [categoryMonthTotal, setCategoryMonthTotal] = useState(0);

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

  const loadMonthTotal = useCallback(async (activeType, catId) => {
    if (!activeType || !catId) {
      setCategoryMonthTotal(0);
      return;
    }
    try {
      const { data } = await getCategoryBreakdown({ type: activeType });
      const match = data.data.find((b) => b.categoryId === catId);
      setCategoryMonthTotal(match?.total || 0);
    } catch (err) {
      setCategoryMonthTotal(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const loadedTypes = await loadTypes();
        let activeType = typeTab || loadedTypes[0]?.code;

        // If we arrived with a preset category (from Categories screen), find
        // its type first so the correct tab + category are both selected.
        // Gated on presetResolved (not categoryId) since categoryId is
        // pre-seeded from presetCategoryId — checking categoryId's truthiness
        // here would skip this resolution step entirely.
        if (presetCategoryId && !presetResolved) {
          for (const t of loadedTypes) {
            const { data } = await listCategories({ type: t.code });
            if (data.data.some((c) => c._id === presetCategoryId)) {
              activeType = t.code;
              setTypeTab(t.code);
              break;
            }
          }
          setPresetResolved(true);
        }

        const loadedCategories = await loadCategories(activeType);
        const activeCategory = categoryId || presetCategoryId || loadedCategories[0]?._id;
        setCategoryId(activeCategory);
        await Promise.all([loadSubcategories(activeCategory), loadMonthTotal(activeType, activeCategory)]);
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
      await Promise.all([loadSubcategories(categoryId), loadMonthTotal(typeTab, categoryId)]);
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
        <ActivityIndicator animating color={tokens.brand.teal500} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Category header */}
      <Pressable style={styles.headerCard} onPress={() => setCategorySwitcherOpen((v) => !v)}>
        <View style={[styles.headerIconWrap, { backgroundColor: `${selectedCategory?.color || tokens.brand.ink800}17` }]}>
          <MaterialCommunityIcons name={selectedCategory?.icon || 'shape-outline'} size={22} color={selectedCategory?.color || tokens.brand.ink800} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{selectedCategory?.name || 'Select a category'}</Text>
          <Text style={styles.headerSubtitle}>{formatCurrency(categoryMonthTotal)} this month</Text>
        </View>
        <MaterialCommunityIcons name={categorySwitcherOpen ? 'chevron-up' : 'chevron-down'} size={20} color={tokens.neutral.textMuted} />
      </Pressable>

      {categorySwitcherOpen && (
        <View style={styles.switcherPanel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            {types.map((t) => (
              <Pressable
                key={t.code}
                onPress={() => { setTypeTab(t.code); setCategoryId(''); }}
                style={[styles.tab, typeTab === t.code && styles.tabActive]}
              >
                <Text style={[styles.tabLabel, typeTab === t.code && styles.tabLabelActive]}>{t.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <ScrollView style={{ maxHeight: 220 }}>
            {categories.map((c) => (
              <Pressable key={c._id} style={styles.switcherRow} onPress={() => { setCategoryId(c._id); setCategorySwitcherOpen(false); }}>
                <MaterialCommunityIcons name={c.icon || 'shape-outline'} size={17} color={c.color} />
                <Text style={styles.switcherRowLabel}>{c.name}</Text>
                {c._id === categoryId && <MaterialCommunityIcons name="check" size={16} color={tokens.brand.teal600} />}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[tokens.brand.teal500]} />}
      >
        {categories.length === 0 ? (
          <FinoraCard>
            <FinoraEmptyState icon="shape-outline" title="No categories under this type yet" description="Add a category first — subcategories nest under a category." />
          </FinoraCard>
        ) : subcategories.length === 0 ? (
          <FinoraCard>
            <FinoraEmptyState
              icon="file-tree-outline"
              title="No subcategories yet"
              description={`Add one to break "${selectedCategory?.name}" down further.`}
              actionLabel="Add Subcategory"
              onAction={() => setFormOpen(true)}
            />
          </FinoraCard>
        ) : (
          subcategories.map((s, i) => (
            <Animated.View key={s._id} entering={FadeInDown.delay(Math.min(i, 8) * 45).duration(280)} style={styles.subCardWrap}>
              <Swipeable
                overshootRight={false}
                renderRightActions={() => (
                  <Pressable onPress={() => setDeleteTarget(s)} style={styles.deleteAction}>
                    <MaterialCommunityIcons name="trash-can-outline" size={19} color="#fff" />
                  </Pressable>
                )}
              >
                <FinoraCard style={styles.subCard} padded={false}>
                  <Pressable style={styles.subRow} onPress={() => { setEditing(s); setFormOpen(true); }}>
                    <View style={[styles.subIconWrap, { backgroundColor: `${selectedCategory?.color || tokens.brand.ink800}17` }]}>
                      <MaterialCommunityIcons name={s.icon || 'shape-outline'} size={18} color={selectedCategory?.color || tokens.brand.ink800} />
                    </View>
                    <Text style={styles.subName} numberOfLines={1}>{s.name}</Text>
                    {s.isDefault && (
                      <View style={styles.defaultTag}>
                        <Text style={styles.defaultTagText}>Default</Text>
                      </View>
                    )}
                    <MaterialCommunityIcons name="chevron-right" size={18} color={tokens.neutral.textMuted} />
                  </Pressable>
                </FinoraCard>
              </Swipeable>
            </Animated.View>
          ))
        )}
      </ScrollView>

      {categoryId && (
        <Pressable style={styles.fab} onPress={() => { setEditing(null); setFormOpen(true); }}>
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        </Pressable>
      )}

      <SubcategoryFormDialog
        open={formOpen}
        initialValues={editing}
        accentColor={selectedCategory?.color}
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
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.neutral.bg },
  container: { flex: 1, backgroundColor: tokens.neutral.bg },

  headerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: tokens.space.lg, backgroundColor: tokens.neutral.surface, borderBottomWidth: 1, borderBottomColor: tokens.neutral.border },
  headerIconWrap: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...tokens.typography.h3, color: tokens.neutral.textPrimary },
  headerSubtitle: { ...tokens.typography.bodySm, color: tokens.neutral.textMuted, marginTop: 2 },

  switcherPanel: { backgroundColor: tokens.neutral.surface, padding: tokens.space.lg, borderBottomWidth: 1, borderBottomColor: tokens.neutral.border },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: tokens.radius.pill, backgroundColor: tokens.neutral.surfaceAlt, marginRight: 8 },
  tabActive: { backgroundColor: tokens.brand.ink800 },
  tabLabel: { ...tokens.typography.bodySm, color: tokens.neutral.textSecondary, fontWeight: '600' },
  tabLabelActive: { color: '#fff' },
  switcherRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  switcherRowLabel: { ...tokens.typography.body, color: tokens.neutral.textPrimary, flex: 1 },

  content: { padding: tokens.space.lg, paddingBottom: 96 },
  subCardWrap: { marginBottom: 10 },
  subCard: {},
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: tokens.space.md },
  subIconWrap: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  subName: { ...tokens.typography.body, fontWeight: '600', color: tokens.neutral.textPrimary, flex: 1 },
  defaultTag: { backgroundColor: tokens.neutral.surfaceAlt, paddingHorizontal: 8, paddingVertical: 3, borderRadius: tokens.radius.pill, marginRight: 2 },
  defaultTagText: { fontSize: 10, fontWeight: '700', color: tokens.neutral.textMuted },
  deleteAction: { backgroundColor: tokens.semantic.error, justifyContent: 'center', alignItems: 'center', width: 64, borderRadius: tokens.radius.lg, marginLeft: 8 },

  fab: { position: 'absolute', right: 20, bottom: 24, width: 52, height: 52, borderRadius: 26, backgroundColor: tokens.brand.ink800, alignItems: 'center', justifyContent: 'center', ...tokens.shadow.high },
});

export default SubcategoriesScreen;
