import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { StyleSheet, ScrollView } from 'react-native';
import { TextInput, Menu, Portal, Dialog, Button } from 'react-native-paper';

const PROVIDERS = ['GPay', 'PhonePe', 'Paytm', 'BHIM', 'AmazonPay', 'Other'];

// Mirrors frontend/src/components/accounts/UpiAccountFormDialog.jsx
const UpiAccountFormDialog = ({ open, onClose, onSubmit, initialValues, bankAccounts }) => {
  const isEdit = Boolean(initialValues);
  const [providerMenuOpen, setProviderMenuOpen] = useState(false);
  const [bankMenuOpen, setBankMenuOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: { provider: 'GPay', upiId: '', nickname: '', linkedBankAccount: '' },
  });

  useEffect(() => {
    if (open) {
      reset(
        initialValues
          ? { ...initialValues, linkedBankAccount: initialValues.linkedBankAccount?._id || '' }
          : { provider: 'GPay', upiId: '', nickname: '', linkedBankAccount: '' }
      );
    }
  }, [open, initialValues, reset]);

  const submitHandler = async (values) => {
    setSubmitting(true);
    try {
      const payload = { ...values };
      if (!payload.linkedBankAccount) delete payload.linkedBankAccount;
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={open} onDismiss={onClose} style={styles.dialog}>
        <Dialog.Title>{isEdit ? 'Edit UPI Account' : 'Add UPI Account'}</Dialog.Title>
        <Dialog.ScrollArea style={{ maxHeight: 420 }}>
          <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
            <Controller
              control={control}
              name="provider"
              render={({ field: { onChange, value } }) => (
                <Menu
                  visible={providerMenuOpen}
                  onDismiss={() => setProviderMenuOpen(false)}
                  anchor={
                    <TextInput
                      label="Provider"
                      value={value}
                      mode="outlined"
                      editable={false}
                      onPressIn={() => setProviderMenuOpen(true)}
                      right={<TextInput.Icon icon="menu-down" onPress={() => setProviderMenuOpen(true)} />}
                      style={styles.input}
                    />
                  }
                >
                  {PROVIDERS.map((p) => (
                    <Menu.Item
                      key={p}
                      title={p}
                      onPress={() => {
                        onChange(p);
                        setProviderMenuOpen(false);
                      }}
                    />
                  ))}
                </Menu>
              )}
            />

            <Controller
              control={control}
              name="upiId"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="UPI ID (optional)"
                  placeholder="name@bank"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  autoCapitalize="none"
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="nickname"
              render={({ field: { onChange, value } }) => (
                <TextInput label="Nickname (optional)" value={value} onChangeText={onChange} mode="outlined" style={styles.input} />
              )}
            />

            <Controller
              control={control}
              name="linkedBankAccount"
              render={({ field: { onChange, value } }) => {
                const selected = bankAccounts.find((b) => b._id === value);
                return (
                  <Menu
                    visible={bankMenuOpen}
                    onDismiss={() => setBankMenuOpen(false)}
                    anchor={
                      <TextInput
                        label="Linked Bank Account (optional)"
                        value={selected ? selected.bankName : 'None'}
                        mode="outlined"
                        editable={false}
                        onPressIn={() => setBankMenuOpen(true)}
                        right={<TextInput.Icon icon="menu-down" onPress={() => setBankMenuOpen(true)} />}
                        style={styles.input}
                      />
                    }
                  >
                    <Menu.Item
                      title="None"
                      onPress={() => {
                        onChange('');
                        setBankMenuOpen(false);
                      }}
                    />
                    {bankAccounts.map((b) => (
                      <Menu.Item
                        key={b._id}
                        title={`${b.bankName}${b.accountNickname ? ` — ${b.accountNickname}` : ''}`}
                        onPress={() => {
                          onChange(b._id);
                          setBankMenuOpen(false);
                        }}
                      />
                    ))}
                  </Menu>
                );
              }}
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

export default UpiAccountFormDialog;
