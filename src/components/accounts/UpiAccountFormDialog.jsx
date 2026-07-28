import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Portal, Dialog, TextInput, Button } from 'react-native-paper';
import SelectField from '../common/SelectField';
import { brand } from '../../theme/theme';

const PROVIDERS = ['GPay', 'PhonePe', 'Paytm', 'BHIM', 'AmazonPay', 'Other'].map((p) => ({ label: p, value: p }));
const DEFAULTS = { provider: 'GPay', upiId: '', nickname: '', linkedBankAccount: '' };

// Mirrors frontend/src/components/accounts/UpiAccountFormDialog.jsx
const UpiAccountFormDialog = ({ visible, onDismiss, onSubmit, initialValues, bankAccounts }) => {
  const isEdit = Boolean(initialValues);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({ defaultValues: DEFAULTS });

  const bankOptions = [
    { label: 'None', value: '' },
    ...bankAccounts.map((b) => ({
      label: `${b.bankName}${b.accountNickname ? ` — ${b.accountNickname}` : ''}`,
      value: b._id,
    })),
  ];

  useEffect(() => {
    if (visible) {
      reset(
        initialValues
          ? { ...DEFAULTS, ...initialValues, linkedBankAccount: initialValues.linkedBankAccount?._id || '' }
          : DEFAULTS
      );
    }
  }, [visible, initialValues, reset]);

  const submitHandler = async (values) => {
    const payload = { ...values };
    if (!payload.linkedBankAccount) delete payload.linkedBankAccount;
    await onSubmit(payload);
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>{isEdit ? 'Edit UPI Account' : 'Add UPI Account'}</Dialog.Title>
        <Dialog.Content>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Controller
              control={control}
              name="provider"
              render={({ field: { onChange, value } }) => (
                <SelectField label="Provider" value={value} options={PROVIDERS} onSelect={onChange} />
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
                  style={[styles.input, { marginTop: 8 }]}
                />
              )}
            />

            <Controller
              control={control}
              name="nickname"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Nickname (optional)"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  style={[styles.input, { marginTop: 8 }]}
                />
              )}
            />

            <View style={{ marginTop: 8 }}>
              <Controller
                control={control}
                name="linkedBankAccount"
                render={({ field: { onChange, value } }) => (
                  <SelectField label="Linked Bank Account (optional)" value={value} options={bankOptions} onSelect={onChange} />
                )}
              />
            </View>
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleSubmit(submitHandler)} loading={isSubmitting} disabled={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Add Account'}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: { backgroundColor: brand.paper, maxHeight: '85%' },
  input: { backgroundColor: '#FFFFFF' },
});

export default UpiAccountFormDialog;
