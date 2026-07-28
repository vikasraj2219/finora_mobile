import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { Portal, Dialog, TextInput, Button, HelperText, Text } from 'react-native-paper';
import { brand } from '../../theme/theme';

const DEFAULTS = { amount: '', note: '' };

// Mirrors frontend/src/components/accounts/CashAdjustDialog.jsx — also reused for the
// bank account "adjust balance" action, which takes the same { amount, note } shape.
const AdjustBalanceDialog = ({ visible, onDismiss, onSubmit, title = 'Adjust Balance', currentBalanceLabel }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: DEFAULTS });

  useEffect(() => {
    if (visible) reset(DEFAULTS);
  }, [visible, reset]);

  const submitHandler = async (values) => {
    await onSubmit({ amount: Number(values.amount), note: values.note });
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          {currentBalanceLabel && (
            <Text variant="bodyMedium" style={styles.helper}>
              Current balance: <Text style={{ fontWeight: '700' }}>{currentBalanceLabel}</Text>. Use a positive
              amount to add funds, negative to record money spent or withdrawn.
            </Text>
          )}
          <Controller
            control={control}
            name="amount"
            rules={{ required: 'Amount is required' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Amount"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                keyboardType="numeric"
                autoFocus
                error={!!errors.amount}
                style={styles.input}
              />
            )}
          />
          <HelperText type="error" visible={!!errors.amount}>
            {errors.amount?.message}
          </HelperText>

          <Controller
            control={control}
            name="note"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Note (optional)" value={value} onChangeText={onChange} mode="outlined" style={styles.input} />
            )}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleSubmit(submitHandler)} loading={isSubmitting} disabled={isSubmitting}>
            Adjust
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: { backgroundColor: brand.paper },
  input: { backgroundColor: '#FFFFFF' },
  helper: { color: '#64748B', marginBottom: 16 },
});

export default AdjustBalanceDialog;
