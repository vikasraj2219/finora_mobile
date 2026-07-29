import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { View, StyleSheet } from 'react-native';
import { Portal, Dialog, Button, TextInput, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const EMPTY = { name: '', icon: '' };

// Mirrors frontend/src/components/subcategories/SubcategoryFormDialog.jsx
const SubcategoryFormDialog = ({ open, onClose, onSubmit, initialValues }) => {
  const isEdit = Boolean(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY });

  const previewIcon = watch('icon');

  useEffect(() => {
    if (!open) return;
    reset(initialValues ? { name: initialValues.name, icon: initialValues.icon || '' } : EMPTY);
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
        <Dialog.Title>{isEdit ? 'Edit Subcategory' : 'Add Subcategory'}</Dialog.Title>
        <Dialog.Content>
          <Controller
            control={control}
            name="name"
            rules={{ required: 'Name is required' }}
            render={({ field: { onChange, value } }) => (
              <TextInput label="Subcategory Name" value={value} onChangeText={onChange} mode="outlined" error={!!errors.name} style={styles.input} />
            )}
          />
          <Controller
            control={control}
            name="icon"
            render={({ field: { onChange, value } }) => (
              <View style={styles.iconRow}>
                <TextInput
                  label="Icon (optional)"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  autoCapitalize="none"
                  style={[styles.input, { flex: 1 }]}
                />
                <View style={styles.iconPreview}>
                  <MaterialCommunityIcons name={previewIcon || 'shape-outline'} size={20} color="#64748B" />
                </View>
              </View>
            )}
          />
          <HelperText type="info" visible>
            MaterialCommunityIcons name — unrecognized names fall back to a generic icon
          </HelperText>
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
  iconRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  iconPreview: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
});

export default SubcategoryFormDialog;
