import { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Surface, Button, TextInput, Menu } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { exportTransactions, exportSummary } from '../../api/reportApi';
import { brand } from '../../theme/theme';

const MIME = {
  csv: 'text/csv',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
};

// reportApi.js (shared with the web app) requests responseType: 'blob' — RN polyfills
// Blob/FileReader for network responses, so we read it back out as a base64 data URI
// rather than trying to override the responseType (axios params can't do that from
// the call site here, since the shared function's config is fixed).
const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      // result looks like "data:<mime>;base64,AAAA..." — strip the prefix.
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });

const saveAndShare = async (blob, filename, mimeType) => {
  const base64 = await blobToBase64(blob);
  const fileUri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, { mimeType, dialogTitle: filename });
  }
};

// Mirrors frontend/src/pages/reports/Reports.jsx — same export options, but the
// download-a-blob web pattern becomes save-to-cache-then-share on mobile (there's no
// Downloads folder to write straight to on iOS, and a share sheet lets the person
// pick where it goes — Files, email, WhatsApp, etc).
const ReportsScreen = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [type, setType] = useState('');
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [loadingFormat, setLoadingFormat] = useState(null);
  const [error, setError] = useState('');

  const handleExportTransactions = async (format) => {
    setLoadingFormat(format);
    setError('');
    try {
      const params = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (type) params.type = type;
      const { data } = await exportTransactions(format, params);
      await saveAndShare(data, `transactions.${format}`, MIME[format]);
    } catch (err) {
      setError('Export failed');
    } finally {
      setLoadingFormat(null);
    }
  };

  const handleExportSummary = async () => {
    setLoadingFormat('summary');
    setError('');
    try {
      const { data } = await exportSummary();
      await saveAndShare(data, 'financial-summary.pdf', MIME.pdf);
    } catch (err) {
      setError('Export failed');
    } finally {
      setLoadingFormat(null);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Transaction Export
          </Text>
          <TextInput label="From (YYYY-MM-DD)" value={dateFrom} onChangeText={setDateFrom} mode="outlined" style={styles.input} />
          <TextInput label="To (YYYY-MM-DD)" value={dateTo} onChangeText={setDateTo} mode="outlined" style={styles.input} />
          <Menu
            visible={typeMenuOpen}
            onDismiss={() => setTypeMenuOpen(false)}
            anchor={
              <TextInput
                label="Type"
                value={type === 'income' ? 'Income' : type === 'expense' ? 'Expense' : 'All'}
                mode="outlined"
                editable={false}
                onPressIn={() => setTypeMenuOpen(true)}
                right={<TextInput.Icon icon="menu-down" onPress={() => setTypeMenuOpen(true)} />}
                style={styles.input}
              />
            }
          >
            <Menu.Item title="All" onPress={() => { setType(''); setTypeMenuOpen(false); }} />
            <Menu.Item title="Income" onPress={() => { setType('income'); setTypeMenuOpen(false); }} />
            <Menu.Item title="Expense" onPress={() => { setType('expense'); setTypeMenuOpen(false); }} />
          </Menu>

          <View style={styles.btnRow}>
            <Button mode="outlined" icon="download-outline" onPress={() => handleExportTransactions('csv')} loading={loadingFormat === 'csv'} disabled={!!loadingFormat}>
              CSV
            </Button>
            <Button mode="outlined" icon="download-outline" onPress={() => handleExportTransactions('xlsx')} loading={loadingFormat === 'xlsx'} disabled={!!loadingFormat}>
              Excel
            </Button>
            <Button mode="outlined" icon="download-outline" onPress={() => handleExportTransactions('pdf')} loading={loadingFormat === 'pdf'} disabled={!!loadingFormat}>
              PDF
            </Button>
          </View>
        </Surface>

        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Financial Summary
          </Text>
          <Text variant="bodyMedium" style={{ color: '#64748B', marginBottom: 16 }}>
            A one-page PDF snapshot of your totals, this month's figures, and key highlights.
          </Text>
          <Button mode="contained" icon="download-outline" onPress={handleExportSummary} loading={loadingFormat === 'summary'} disabled={!!loadingFormat}>
            Download Summary PDF
          </Button>
        </Surface>

        {!!error && (
          <Text variant="bodySmall" style={{ color: '#EF4444', marginTop: 8 }}>
            {error}
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: brand.bg },
  content: { padding: 16, gap: 16 },
  card: { borderRadius: 12, padding: 16, backgroundColor: '#FFFFFF' },
  cardTitle: { fontWeight: '700', color: brand.navy, marginBottom: 12 },
  input: { backgroundColor: '#FFFFFF', marginBottom: 12 },
  btnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
});

export default ReportsScreen;
