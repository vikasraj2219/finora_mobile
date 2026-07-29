import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { Portal, Dialog, Button, TextInput, Menu } from 'react-native-paper';
import ColorPickerField from '../common/ColorPickerField';
import { brand } from '../../theme/theme';

// Mirrors frontend/src/components/categories/CategoryFormDialog.jsx
const CategoryFormDialog = ({ open, onClose, onSubmit, initialValues, defaultType, types }) => {
  const isEdit = Boolean(initialValues);
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { name: '', type: defaultType || 'expense', color: brand.teal } });

  useEffect(() => {
    if (open) {
      reset(initialValues || { name: '', type: defaultType || 'expense', color: brand.teal });
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
    <Portal>
      <Dialog visible={open} onDismiss={onClose} style={styles.dialog}>
        <Dialog.Title>{isEdit ? 'Edit Category' : 'Add Category'}</Dialog.Title>
        <Dialog.Content>
          <Controller
            control={control}
            name="name"
            rules={{ required: 'Name is required' }}
            render={({ field: { onChange, value } }) => (
              <TextInput label="Category Name" value={value} onChangeText={onChange} mode="outlined" error={!!errors.name} style={styles.input} />
            )}
          />

          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => {
              const selected = types.find((t) => t.code === value);
              return (
                <Menu
                  visible={typeMenuOpen}
                  onDismiss={() => setTypeMenuOpen(false)}
                  anchor={
                    <TextInput
                      label="Type"
                      value={selected?.label || value}
                      mode="outlined"
                      editable={false}
                      onPressIn={() => setTypeMenuOpen(true)}
                      right={<TextInput.Icon icon="menu-down" onPress={() => setTypeMenuOpen(true)} />}
                      style={styles.input}
                    />
                  }
                >
                  {types.map((t) => (
                    <Menu.Item
                      key={t.code}
                      title={t.label}
                      onPress={() => {
                        onChange(t.code);
                        setTypeMenuOpen(false);
                      }}
                    />
                  ))}
                </Menu>
              );
            }}
          />

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
  input: { backgroundColor: '#FFFFFF', marginBottom: 12 },
});

export default CategoryFormDialog;
