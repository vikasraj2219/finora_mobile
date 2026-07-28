import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { TextInput, Portal, Dialog, Button, Text } from 'react-native-paper';

// Mirrors frontend/src/components/accounts/CashAdjustDialog.jsx
const CashAdjustDialog = ({ open, onClose, onSubmit, currentBalance }) => {
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { amount: '', note: '' } });

  const close = () => {
    reset({ amount: '', note: '' });
    onClose();
  };

  const submitHandler = async (values) => {
    setSubmitting(true);
    try {
      await onSubmit({ amount: Number(values.amount), note: values.note });
      close();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={open} onDismiss={close} style={styles.dialog}>
        <Dialog.Title>Adjust Cash Balance</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={styles.helper}>
            Current balance: {currentBalance}. Use a positive amount to add cash, negative to record cash spent.
          </Text>
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
          <Controller
            control={control}
            name="note"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Note (optional)" value={value} onChangeText={onChange} mode="outlined" style={styles.input} />
            )}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={close} disabled={submitting}>
            Cancel
          </Button>
          <Button onPress={handleSubmit(submitHandler)} loading={submitting} disabled={submitting} mode="contained">
            Adjust
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: { backgroundColor: '#FFFFFF' },
  helper: { color: '#64748B', marginBottom: 16 },
  input: { marginBottom: 12, backgroundColor: '#FFFFFF' },
});

export default CashAdjustDialog;
