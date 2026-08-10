import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { View, Text, Pressable, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FinoraBottomSheet from '../ui/FinoraBottomSheet';
import FinoraButton from '../ui/FinoraButton';
import IconPickerSheet from '../ui/IconPickerSheet';
import tokens from '../../theme/tokens';

const EMPTY = { name: '', icon: 'shape-outline' };

// Rebuilt as a bottom sheet with the same icon-grid picker as Categories
// (was free-text before — easy to typo into a blank glyph).
const SubcategoryFormDialog = ({ open, onClose, onSubmit, initialValues, accentColor = tokens.brand.ink800 }) => {
  const isEdit = Boolean(initialValues);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY });

  const icon = watch('icon');

  useEffect(() => {
    if (!open) return;
    reset(initialValues ? { name: initialValues.name, icon: initialValues.icon || 'shape-outline' } : EMPTY);
  }, [open, initialValues, reset]);

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
      <FinoraBottomSheet visible={open} onClose={onClose} title={<Text style={styles.title}>{isEdit ? 'Edit Subcategory' : 'Add Subcategory'}</Text>}>
        <View style={styles.previewRow}>
          <Pressable style={[styles.iconPreview, { backgroundColor: `${accentColor}17`, borderColor: accentColor }]} onPress={() => setIconPickerOpen(true)}>
            <MaterialCommunityIcons name={icon} size={26} color={accentColor} />
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
              placeholder="Subcategory name"
              placeholderTextColor={tokens.neutral.textMuted}
              style={[styles.input, errors.name && styles.inputError]}
            />
          )}
        />

        <View style={styles.footer}>
          <FinoraButton label="Cancel" variant="ghost" onPress={onClose} disabled={submitting} style={{ flex: 1 }} />
          <FinoraButton label={isEdit ? 'Save' : 'Add'} variant="primary" onPress={handleSubmit(submitHandler)} loading={submitting} disabled={submitting} style={{ flex: 1 }} />
        </View>
      </FinoraBottomSheet>

      <IconPickerSheet visible={iconPickerOpen} onClose={() => setIconPickerOpen(false)} value={icon} onSelect={(val) => setValue('icon', val)} accentColor={accentColor} />
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
  footer: { flexDirection: 'row', gap: 10, marginTop: tokens.space.lg },
});

export default SubcategoryFormDialog;
