import { useState } from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { Portal, Dialog, Button, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { uploadTransactionReceipt, removeTransactionReceipt } from '../../api/transactionApi';
import { API_BASE_URL } from '../../api/axiosInstance';

// Backend serves uploads from the API origin, not the /api/v1 prefix.
const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

// Mirrors frontend/src/components/transactions/ReceiptDialog.jsx — uses the device's
// photo picker instead of a file input.
const ReceiptDialog = ({ open, onClose, transaction, onUpdated }) => {
  const [uploading, setUploading] = useState(false);

  if (!transaction) return null;

  const pickAndUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const file = {
      uri: asset.uri,
      name: asset.fileName || 'receipt.jpg',
      type: asset.mimeType || 'image/jpeg',
    };

    setUploading(true);
    try {
      // uploadTransactionReceipt (shared with the web app) builds its own FormData
      // and does formData.append('receipt', file) — RN's FormData understands this
      // {uri, name, type} shape natively, same as it understands a web File object.
      const { data } = await uploadTransactionReceipt(transaction._id, file);
      onUpdated(data.data);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    const { data } = await removeTransactionReceipt(transaction._id);
    onUpdated(data.data);
  };

  return (
    <Portal>
      <Dialog visible={open} onDismiss={onClose} style={styles.dialog}>
        <Dialog.Title>Receipt</Dialog.Title>
        <Dialog.Content>
          {transaction.receiptUrl ? (
            <Button onPress={() => Linking.openURL(`${API_ORIGIN}${transaction.receiptUrl}`)}>
              View current receipt
            </Button>
          ) : (
            <Text variant="bodyMedium" style={{ color: '#64748B' }}>
              No receipt attached yet.
            </Text>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          {transaction.receiptUrl && (
            <Button textColor="#EF4444" onPress={handleRemove}>
              Remove
            </Button>
          )}
          <Button mode="contained" onPress={pickAndUpload} loading={uploading} disabled={uploading}>
            {transaction.receiptUrl ? 'Replace' : 'Upload'}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: { backgroundColor: '#FFFFFF' },
});

export default ReceiptDialog;
