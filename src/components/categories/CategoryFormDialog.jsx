import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { View, Text, Pressable, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FinoraBottomSheet from '../ui/FinoraBottomSheet';
import FinoraButton from '../ui/FinoraButton';
import ColorPickerField from '../common/ColorPickerField';
import IconPickerSheet from '../ui/IconPickerSheet';
import tokens from '../../theme/tokens';

const EMPTY = { name: '', type: '', color: tokens.brand.teal500, icon: 'shape-outline' };

// Rebuilt as a bottom sheet (was a Paper Dialog) with a real icon picker added
// — brief §10 wants "every category should have a meaningful icon"; the
// `icon` field already existed on the backend Category schema, it just wasn't
// exposed in any form before now.
const CategoryFormDialog = ({ open, onClose, onSubmit, initialValues, defaultType, types }) => {
  const isEdit = Boolean(initialValues);
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: { ...EMPTY, type: defaultType || 'expense' } });

  const type = watch('type');
  const color = watch('color');
  const icon = watch('icon');
  const selectedTypeMeta = types.find((t) => t.code === type);

  useEffect(() => {
    if (open) {
      reset(
        initialValues
          ? { name: initialValues.name, type: initialValues.type, color: initialValues.color, icon: initialValues.icon || 'shape-outline' }
          : { ...EMPTY, type: defaultType || 'expense' }
      );
    }
  }, [open, initialValues, defaultType, reset]);

  const submitHandler = async (values) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <FinoraBottomSheet visible={open} onClose={onClose} title={<Text style={styles.title}>{isEdit ? 'Edit Category' : 'Add Category'}</Text>}>
        <View style={styles.previewRow}>
          <Pressable style={[styles.iconPreview, { backgroundColor: `${color}17`, borderColor: color }]} onPress={() => setIconPickerOpen(true)}>
            <MaterialCommunityIcons name={icon} size={26} color={color} />
            <View style={styles.editBadge}>
              <MaterialCommunityIcons name="pencil" size={10} color="#fff" />
            </View>
          </Pressable>
          <Text style={styles.previewHint}>Tap to change icon</Text>
        </View>

        <Controller
          control={control}
          name="name"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <RNTextInput
              value={value}
              onChangeText={onChange}
              placeholder="Category name"
              placeholderTextColor={tokens.neutral.textMuted}
              style={[styles.input, errors.name && styles.inputError]}
            />
          )}
        />

        <Text style={styles.label}>Type</Text>
        <Pressable style={styles.selectRow} onPress={() => setTypePickerOpen((v) => !v)}>
          <Text style={styles.selectValue}>{selectedTypeMeta?.label || type}</Text>
          <MaterialCommunityIcons name={typePickerOpen ? 'chevron-up' : 'chevron-down'} size={18} color={tokens.neutral.textMuted} />
        </Pressable>
        {typePickerOpen && (
          <View style={styles.typeGrid}>
            {types.map((t) => {
              const selected = t.code === type;
              return (
                <Pressable
                  key={t.code}
                  onPress={() => {
                    setValue('type', t.code);
                    setTypePickerOpen(false);
                  }}
                  style={[styles.typeTile, selected && { borderColor: tokens.brand.teal500, backgroundColor: tokens.brand.teal100 }]}
                >
                  <Text style={[styles.typeTileLabel, selected && { color: tokens.brand.teal600, fontWeight: '700' }]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Controller control={control} name="color" render={({ field: { onChange, value } }) => <ColorPickerField value={value} onChange={onChange} />} />

        <View style={styles.footer}>
          <FinoraButton label="Cancel" variant="ghost" onPress={onClose} disabled={submitting} style={{ flex: 1 }} />
          <FinoraButton label={isEdit ? 'Save' : 'Add'} variant="primary" onPress={handleSubmit(submitHandler)} loading={submitting} disabled={submitting} style={{ flex: 1 }} />
        </View>
      </FinoraBottomSheet>

      <IconPickerSheet visible={iconPickerOpen} onClose={() => setIconPickerOpen(false)} value={icon} onSelect={(val) => setValue('icon', val)} accentColor={color} />
    </>
  );
};

const styles = StyleSheet.create({
  title: { ...tokens.typography.h3, color: tokens.neutral.textPrimary },
  previewRow: { alignItems: 'center', marginBottom: tokens.space.lg },
  iconPreview: { width: 64, height: 64, borderRadius: 20, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  editBadge: { position: 'absolute', bottom: -4, right: -4, width: 20, height: 20, borderRadius: 10, backgroundColor: tokens.brand.ink800, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  previewHint: { ...tokens.typography.caption, color: tokens.neutral.textMuted, marginTop: 6 },
  input: {
    ...tokens.typography.bodyLg,
    color: tokens.neutral.textPrimary,
    backgroundColor: tokens.neutral.surfaceAlt,
    borderRadius: tokens.radius.md,
    padding: tokens.space.md,
    marginBottom: tokens.space.md,
  },
  inputError: { borderWidth: 1, borderColor: tokens.semantic.error },
  label: { ...tokens.typography.label, color: tokens.neutral.textMuted, marginBottom: 6 },
  selectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: tokens.neutral.surfaceAlt,
    borderRadius: tokens.radius.md,
    padding: tokens.space.md,
    marginBottom: tokens.space.md,
  },
  selectValue: { ...tokens.typography.bodyLg, color: tokens.neutral.textPrimary, fontWeight: '600' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: tokens.space.md },
  typeTile: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: tokens.radius.pill, borderWidth: 1.5, borderColor: tokens.neutral.border },
  typeTileLabel: { ...tokens.typography.bodySm, color: tokens.neutral.textSecondary, fontWeight: '600' },
  footer: { flexDirection: 'row', gap: 10, marginTop: tokens.space.lg },
});

export default CategoryFormDialog;
