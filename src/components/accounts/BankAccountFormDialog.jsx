import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Portal, Dialog, TextInput, Button, HelperText } from 'react-native-paper';
import SelectField from '../common/SelectField';
import { brand } from '../../theme/theme';

const ACCOUNT_TYPES = ['savings', 'current', 'salary', 'other'].map((t) => ({
  label: t.charAt(0).toUpperCase() + t.slice(1),
  value: t,
}));

const DEFAULTS = { bankName: '', accountNickname: '', accountNumberLast4: '', accountType: 'savings', openingBalance: '0' };

// Mirrors frontend/src/components/accounts/BankAccountFormDialog.jsx
const BankAccountFormDialog = ({ visible, onDismiss, onSubmit, initialValues }) => {
  const isEdit = Boolean(initialValues);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: DEFAULTS });

  useEffect(() => {
    if (visible) {
      reset(
        initialValues
          ? { ...DEFAULTS, ...initialValues, openingBalance: String(initialValues.openingBalance ?? 0) }
          : DEFAULTS
      );
    }
  }, [visible, initialValues, reset]);

  const submitHandler = async (values) => {
    await onSubmit({ ...values, openingBalance: Number(values.openingBalance) || 0 });
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>{isEdit ? 'Edit Bank Account' : 'Add Bank Account'}</Dialog.Title>
        <Dialog.Content>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Controller
              control={control}
              name="bankName"
              rules={{ required: 'Bank name is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput label="Bank Name" value={value} onChangeText={onChange} mode="outlined" error={!!errors.bankName} style={styles.input} />
              )}
            />
            <HelperText type="error" visible={!!errors.bankName}>
              {errors.bankName?.message}
            </HelperText>

            <Controller
              control={control}
              name="accountNickname"
              render={({ field: { onChange, value } }) => (
                <TextInput label="Nickname (optional)" value={value} onChangeText={onChange} mode="outlined" style={styles.input} />
              )}
            />

            <View style={{ marginTop: 8 }}>
              <Controller
                control={control}
                name="accountType"
                render={({ field: { onChange, value } }) => (
                  <SelectField label="Account Type" value={value} options={ACCOUNT_TYPES} onSelect={onChange} />
                )}
              />
            </View>

            <Controller
              control={control}
              name="accountNumberLast4"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Last 4 Digits (optional)"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  keyboardType="number-pad"
                  maxLength={6}
                  style={[styles.input, { marginTop: 8 }]}
                />
              )}
            />

            <Controller
              control={control}
              name="openingBalance"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label={isEdit ? 'Opening Balance (locked)' : 'Opening Balance'}
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  keyboardType="numeric"
                  disabled={isEdit}
                  style={[styles.input, { marginTop: 8 }]}
                />
              )}
            />
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

export default BankAccountFormDialog;
