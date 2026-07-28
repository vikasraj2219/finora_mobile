import { Portal, Dialog, Text, Button } from 'react-native-paper';
import { brand } from '../../theme/theme';

// Mirrors frontend/src/components/common/ConfirmDialog.jsx
const ConfirmDialog = ({
  visible,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  confirmColor = brand.error,
  loading = false,
  onConfirm,
  onDismiss,
}) => (
  <Portal>
    <Dialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Title>{title}</Dialog.Title>
      {description && (
        <Dialog.Content>
          <Text variant="bodyMedium">{description}</Text>
        </Dialog.Content>
      )}
      <Dialog.Actions>
        <Button onPress={onDismiss} disabled={loading}>
          Cancel
        </Button>
        <Button onPress={onConfirm} loading={loading} disabled={loading} textColor={confirmColor}>
          {confirmLabel}
        </Button>
      </Dialog.Actions>
    </Dialog>
  </Portal>
);

export default ConfirmDialog;
