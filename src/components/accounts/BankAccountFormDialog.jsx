import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Menu, Portal, Dialog, Button } from 'react-native-paper';
import { brand } from '../../theme/theme';

const ACCOUNT_TYPES = ['savings', 'current', 'salary', 'other'];

// Mirrors frontend/src/components/accounts/BankAccountFormDialog.jsx
const BankAccountFormDialog = ({ open, onClose, onSubmit, initialValues }) => {
  const isEdit = Boolean(initialValues);
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      bankName: '',
      accountNickname: '',
      accountNumberLast4: '',
      accountType: 'savings',
      openingBalance: '0',
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        initialValues
          ? { ...initialValues, openingBalance: String(initialValues.openingBalance ?? 0) }
          : { bankName: '', accountNickname: '', accountNumberLast4: '', accountType: 'savings', openingBalance: '0' }
      );
    }
  }, [open, initialValues, reset]);

  const submitHandler = async (values) => {
    setSubmitting(true);
    try {
      await onSubmit({ ...values, openingBalance: Number(values.openingBalance) || 0 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={open} onDismiss={onClose} style={styles.dialog}>
        <Dialog.Title>{isEdit ? 'Edit Bank Account' : 'Add Bank Account'}</Dialog.Title>
        <Dialog.ScrollArea style={{ maxHeight: 420 }}>
          <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
            <Controller
              control={control}
              name="bankName"
              rules={{ required: 'Bank name is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Bank Name"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  error={!!errors.bankName}
                  style={styles.input}
                />
              )}
            />
            <Controller
              control={control}
              name="accountNickname"
              render={({ field: { onChange, value } }) => (
                <TextInput label="Nickname (optional)" value={value} onChangeText={onChange} mode="outlined" style={styles.input} />
              )}
            />

            <Controller
              control={control}
              name="accountType"
              render={({ field: { onChange, value } }) => (
                <Menu
                  visible={typeMenuOpen}
                  onDismiss={() => setTypeMenuOpen(false)}
                  anchor={
                    <TextInput
                      label="Account Type"
                      value={value.charAt(0).toUpperCase() + value.slice(1)}
                      mode="outlined"
                      editable={false}
                      onPressIn={() => setTypeMenuOpen(true)}
                      right={<TextInput.Icon icon="menu-down" onPress={() => setTypeMenuOpen(true)} />}
                      style={styles.input}
                    />
                  }
                >
                  {ACCOUNT_TYPES.map((t) => (
                    <Menu.Item
                      key={t}
                      title={t.charAt(0).toUpperCase() + t.slice(1)}
                      onPress={() => {
                        onChange(t);
                        setTypeMenuOpen(false);
                      }}
                    />
                  ))}
                </Menu>
              )}
            />

            <Controller
              control={control}
              name="accountNumberLast4"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Last 4 Digits"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  keyboardType="number-pad"
                  maxLength={4}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="openingBalance"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label={isEdit ? 'Opening Balance (locked)' : 'Opening Balance'}
                  value={String(value)}
                  onChangeText={onChange}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  disabled={isEdit}
                  style={styles.input}
                />
              )}
            />
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onPress={handleSubmit(submitHandler)} loading={submitting} disabled={submitting} mode="contained">
            {isEdit ? 'Save' : 'Add'}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: { backgroundColor: '#FFFFFF' },
  input: { marginBottom: 12, backgroundColor: '#FFFFFF' },
});

export default BankAccountFormDialog;
