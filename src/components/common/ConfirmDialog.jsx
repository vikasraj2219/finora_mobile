import { Portal, Dialog, Button, Text } from 'react-native-paper';

// Mirrors frontend/src/components/common/ConfirmDialog.jsx
const ConfirmDialog = ({ open, title, description, confirmLabel = 'Confirm', onClose, onConfirm }) => (
  <Portal>
    <Dialog visible={open} onDismiss={onClose}>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Content>
        <Text variant="bodyMedium">{description}</Text>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onClose}>Cancel</Button>
        <Button onPress={onConfirm} textColor="#EF4444">
          {confirmLabel}
        </Button>
      </Dialog.Actions>
    </Dialog>
  </Portal>
);

export default ConfirmDialog;
