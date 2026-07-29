import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { Portal, Dialog, Button, TextInput, Menu } from 'react-native-paper';

// Mirrors frontend/src/components/merchants/MerchantFormDialog.jsx
const MerchantFormDialog = ({ open, onClose, onSubmit, initialValues, categories }) => {
  const isEdit = Boolean(initialValues);
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { name: '', defaultCategory: '' } });

  useEffect(() => {
    if (open) {
      reset(
        initialValues
          ? { name: initialValues.name, defaultCategory: initialValues.defaultCategory?._id || '' }
          : { name: '', defaultCategory: '' }
      );
    }
  }, [open, initialValues, reset]);

  const submitHandler = async (values) => {
    const payload = { name: values.name };
    if (values.defaultCategory) payload.defaultCategory = values.defaultCategory;
    setSubmitting(true);
    try {
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={open} onDismiss={onClose} style={styles.dialog}>
        <Dialog.Title>{isEdit ? 'Edit Merchant' : 'Add Merchant'}</Dialog.Title>
        <Dialog.Content>
          <Controller
            control={control}
            name="name"
            rules={{ required: 'Name is required' }}
            render={({ field: { onChange, value } }) => (
              <TextInput label="Merchant Name" value={value} onChangeText={onChange} mode="outlined" error={!!errors.name} style={styles.input} />
            )}
          />
          <Controller
            control={control}
            name="defaultCategory"
            render={({ field: { onChange, value } }) => {
              const selected = categories.find((c) => c._id === value);
              return (
                <Menu
                  visible={menuOpen}
                  onDismiss={() => setMenuOpen(false)}
                  anchor={
                    <TextInput
                      label="Default Category (optional)"
                      value={selected?.name || 'None'}
                      mode="outlined"
                      editable={false}
                      onPressIn={() => setMenuOpen(true)}
                      right={<TextInput.Icon icon="menu-down" onPress={() => setMenuOpen(true)} />}
                      style={styles.input}
                    />
                  }
                >
                  <Menu.Item title="None" onPress={() => { onChange(''); setMenuOpen(false); }} />
                  {categories.map((c) => (
                    <Menu.Item key={c._id} title={c.name} onPress={() => { onChange(c._id); setMenuOpen(false); }} />
                  ))}
                </Menu>
              );
            }}
          />
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

export default MerchantFormDialog;
