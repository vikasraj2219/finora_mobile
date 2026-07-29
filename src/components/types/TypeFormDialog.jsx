import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { View, StyleSheet } from 'react-native';
import { Portal, Dialog, Button, TextInput, Switch, Text, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ColorPickerField from '../common/ColorPickerField';

const EMPTY = { code: '', label: '', appliesToCategory: false, icon: '', color: '#64748B' };

// Mirrors frontend/src/components/types/TypeFormDialog.jsx. Icon field takes a
// MaterialCommunityIcons name (RN's icon set) rather than the web app's Material
// Icons name — the two libraries use different naming, so web icon names won't
// carry over directly (e.g. "restaurant" on web vs "food-outline" here).
const TypeFormDialog = ({ open, onClose, onSubmit, initialValues }) => {
  const isEdit = Boolean(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY });

  const previewIcon = watch('icon');
  const previewColor = watch('color');

  useEffect(() => {
    if (!open) return;
    reset(
      initialValues
        ? {
            code: initialValues.code,
            label: initialValues.label,
            appliesToCategory: Boolean(initialValues.appliesToCategory),
            icon: initialValues.icon || '',
            color: initialValues.color || '#64748B',
          }
        : EMPTY
    );
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
    <Portal>
      <Dialog visible={open} onDismiss={onClose} style={styles.dialog}>
        <Dialog.Title>{isEdit ? 'Edit Type' : 'Add Type'}</Dialog.Title>
        <Dialog.Content>
          <Controller
            control={control}
            name="code"
            rules={{
              required: 'Code is required',
              pattern: { value: /^[a-z][a-z_]*$/, message: 'Lowercase letters and underscores only, e.g. "refund"' },
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Code"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                disabled={isEdit}
                autoCapitalize="none"
                error={!!errors.code}
                style={styles.input}
              />
            )}
          />
          <HelperText type={errors.code ? 'error' : 'info'} visible>
            {isEdit ? "Code can't be changed after creation" : errors.code?.message || 'e.g. refund, gift'}
          </HelperText>

          <Controller
            control={control}
            name="label"
            rules={{ required: 'Label is required' }}
            render={({ field: { onChange, value } }) => (
              <TextInput label="Label" value={value} onChangeText={onChange} mode="outlined" error={!!errors.label} style={styles.input} />
            )}
          />

          <Controller
            control={control}
            name="appliesToCategory"
            render={({ field: { onChange, value } }) => (
              <View style={styles.switchRow}>
                <Text variant="bodyMedium" style={{ flex: 1 }}>
                  Usable as a Category type (like Income / Expense)
                </Text>
                <Switch value={value} onValueChange={onChange} />
              </View>
            )}
          />

          <Controller
            control={control}
            name="icon"
            render={({ field: { onChange, value } }) => (
              <View style={styles.iconRow}>
                <TextInput
                  label="Icon (MaterialCommunityIcons name)"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  autoCapitalize="none"
                  style={[styles.input, { flex: 1 }]}
                />
                <View style={[styles.iconPreview, { backgroundColor: `${previewColor || '#64748B'}1F` }]}>
                  <MaterialCommunityIcons name={previewIcon || 'shape-outline'} size={20} color={previewColor || '#64748B'} />
                </View>
              </View>
            )}
          />
          <HelperText type="info" visible>
            e.g. briefcase-outline, food-outline, airplane
          </HelperText>

          <Controller control={control} name="color" render={({ field: { onChange, value } }) => <ColorPickerField value={value} onChange={onChange} />} />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleSubmit(submitHandler)} loading={submitting} disabled={submitting}>
            {isEdit ? 'Save' : 'Add'}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: { backgroundColor: '#FFFFFF' },
  input: { backgroundColor: '#FFFFFF' },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  iconRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  iconPreview: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});

export default TypeFormDialog;
