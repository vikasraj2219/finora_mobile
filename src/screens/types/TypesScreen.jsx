import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { FAB, Chip, ActivityIndicator } from 'react-native-paper';

import EmptyState from '../../components/common/EmptyState';
import ManagedItemCard from '../../components/common/ManagedItemCard';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import TypeFormDialog from '../../components/types/TypeFormDialog';
import { listTypes, createType, updateType, deleteType } from '../../api/typeApi';
import { brand } from '../../theme/theme';

// Mirrors frontend/src/pages/types/Types.jsx
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
        {types.length === 0 ? (
          <EmptyState icon="tune" title="No types yet" description="Add a type to get started." actionLabel="Add Type" onAction={() => setFormOpen(true)} />
        ) : (
          types.map((t) => (
            <ManagedItemCard
              key={t._id}
              color={t.color}
              icon={t.icon || 'shape-outline'}
              title={t.label}
              meta={t.code}
              badges={
                <>
                  {t.isSystem && <Chip compact textStyle={{ fontSize: 10 }}>System</Chip>}
                  {t.appliesToCategory && (
                    <Chip compact textStyle={{ fontSize: 10, color: '#22C55E' }}>
                      Category-eligible
                    </Chip>
                  )}
                </>
              }
              onEdit={() => {
                setEditing(t);
                setFormOpen(true);
              }}
              onDelete={t.isSystem ? undefined : () => setDeleteTarget(t)}
            />
          ))
        )}
      </ScrollView>

      <FAB icon="plus" style={styles.fab} color="#fff" onPress={() => { setEditing(null); setFormOpen(true); }} />

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
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: brand.bg },
  container: { flex: 1, backgroundColor: brand.bg },
  content: { padding: 16, paddingBottom: 96 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: brand.navy },
});

export default TypesScreen;
