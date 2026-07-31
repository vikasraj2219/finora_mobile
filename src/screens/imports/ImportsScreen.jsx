import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, TextInput, Menu, Surface, ActivityIndicator, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

import ImportReviewCard from '../../components/imports/ImportReviewCard';
import { previewImport, confirmImport } from '../../api/importApi';
import { listBankAccounts } from '../../api/bankAccountApi';
import { listCategories } from '../../api/categoryApi';
import { brand } from '../../theme/theme';

const STEPS = ['Upload', 'Review', 'Done'];

const StepIndicator = ({ activeStep }) => (
  <View style={styles.stepRow}>
    {STEPS.map((label, i) => (
      <View key={label} style={styles.stepItem}>
        <View style={[styles.stepDot, i <= activeStep && { backgroundColor: brand.navy }]}>
          <Text style={{ color: i <= activeStep ? '#fff' : '#94A3B8', fontSize: 12, fontWeight: '700' }}>{i + 1}</Text>
        </View>
        <Text variant="labelSmall" style={{ color: i <= activeStep ? brand.navy : '#94A3B8', marginTop: 4 }}>
          {label}
        </Text>
      </View>
    ))}
  </View>
);

// Mirrors frontend/src/pages/imports/StatementImport.jsx — 3-step flow: pick a bank
// + file, review/categorize parsed rows, confirm. Uses the native document picker
// instead of a file input.
const ImportsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [bankMenuOpen, setBankMenuOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [importBatchId, setImportBatchId] = useState(null);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [bulkCatMenuOpen, setBulkCatMenuOpen] = useState(false);
  const [error, setError] = useState('');

  const loadLookups = useCallback(async () => {
    const [bankRes, catRes] = await Promise.all([listBankAccounts(), listCategories()]);
    setBankAccounts(bankRes.data.data.items);
    setCategories(catRes.data.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLookups()
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [loadLookups])
  );

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'text/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/pdf',
      ],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    setFile(result.assets[0]);
  };

  const handleUpload = async () => {
    if (!selectedBank || !file) {
      setError('Choose a bank account and a file first');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const fileForUpload = { uri: file.uri, name: file.name, type: file.mimeType || 'application/octet-stream' };
      const { data } = await previewImport(fileForUpload, selectedBank);
      setImportBatchId(data.data.importBatchId);
      setRows(
        data.data.rows.map((r) => ({
          ...r,
          include: !r.isDuplicate,
          category: r.suggestedCategory?._id || r.suggestedCategory || '',
          merchant: r.suggestedMerchant?.id || '',
          newMerchantName: '',
        }))
      );
      setActiveStep(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not parse this file');
    } finally {
      setUploading(false);
    }
  };

  const updateRow = (idx, changes) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...changes } : r)));
  };

  const applyCategoryToSelected = (categoryId) => {
    setRows((prev) => prev.map((r) => (r.include ? { ...r, category: categoryId } : r)));
    setBulkCatMenuOpen(false);
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const { data } = await confirmImport({
        bankAccount: selectedBank,
        importBatchId,
        rows: rows.map((r) => ({
          include: r.include,
          date: r.date,
          type: r.type,
          amount: r.amount,
          description: r.description,
          category: r.category || undefined,
          merchant: r.merchant || undefined,
          newMerchantName: r.merchant ? undefined : r.newMerchantName || undefined,
        })),
      });
      setSummary(data.data);
      setActiveStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed');
    } finally {
      setConfirming(false);
    }
  };

  const startOver = () => {
    setActiveStep(0);
    setFile(null);
    setRows([]);
    setImportBatchId(null);
    setSummary(null);
    setError('');
  };

  const selectedCount = rows.filter((r) => r.include).length;
  const selectedBankAccount = bankAccounts.find((b) => b._id === selectedBank);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating color={brand.teal} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StepIndicator activeStep={activeStep} />

      <ScrollView contentContainerStyle={styles.content}>
        {activeStep === 0 && (
          <Surface style={styles.card} elevation={1}>
            <Menu
              visible={bankMenuOpen}
              onDismiss={() => setBankMenuOpen(false)}
              anchor={
                <TextInput
                  label="Bank Account"
                  value={selectedBankAccount ? `${selectedBankAccount.bankName}${selectedBankAccount.accountNickname ? ` — ${selectedBankAccount.accountNickname}` : ''}` : ''}
                  mode="outlined"
                  editable={false}
                  onPressIn={() => setBankMenuOpen(true)}
                  right={<TextInput.Icon icon="menu-down" onPress={() => setBankMenuOpen(true)} />}
                  style={styles.input}
                />
              }
            >
              {bankAccounts.map((b) => (
                <Menu.Item
                  key={b._id}
                  title={`${b.bankName}${b.accountNickname ? ` — ${b.accountNickname}` : ''}`}
                  onPress={() => {
                    setSelectedBank(b._id);
                    setBankMenuOpen(false);
                  }}
                />
              ))}
            </Menu>

            <Button mode="outlined" icon="file-upload-outline" onPress={pickFile} style={styles.uploadBtn} contentStyle={{ justifyContent: 'flex-start' }}>
              {file ? file.name : 'Choose CSV, XLSX, or PDF file'}
            </Button>

            <Surface style={styles.infoBox} elevation={0}>
              <MaterialCommunityIcons name="information-outline" size={16} color={brand.info} />
              <Text variant="bodySmall" style={{ color: '#475569', flex: 1, marginLeft: 8 }}>
                CSV or Excel exports parse most reliably. PDF statements work best when they're simple tabular layouts.
              </Text>
            </Surface>

            {!!error && (
              <Text variant="bodySmall" style={{ color: '#EF4444', marginTop: 8 }}>
                {error}
              </Text>
            )}

            <Button mode="contained" onPress={handleUpload} loading={uploading} disabled={uploading} style={{ marginTop: 16 }}>
              {uploading ? 'Parsing…' : 'Upload & Preview'}
            </Button>
          </Surface>
        )}

        {activeStep === 1 && (
          <View>
            <Text variant="bodySmall" style={styles.muted}>
              {rows.length} transactions found · {selectedCount} selected for import. Possible duplicates are unchecked by default.
            </Text>

            <Menu
              visible={bulkCatMenuOpen}
              onDismiss={() => setBulkCatMenuOpen(false)}
              anchor={
                <TextInput
                  label="Set category for all selected"
                  value=""
                  mode="outlined"
                  dense
                  editable={false}
                  onPressIn={() => setBulkCatMenuOpen(true)}
                  right={<TextInput.Icon icon="menu-down" onPress={() => setBulkCatMenuOpen(true)} />}
                  style={[styles.input, { marginTop: 12 }]}
                />
              }
            >
              {categories.map((c) => (
                <Menu.Item key={c._id} title={`${c.name} (${c.type})`} onPress={() => applyCategoryToSelected(c._id)} />
              ))}
            </Menu>

            <View style={{ marginTop: 16 }}>
              {rows.map((row, idx) => (
                <ImportReviewCard key={idx} row={row} index={idx} categories={categories} onChange={updateRow} />
              ))}
            </View>

            {!!error && (
              <Text variant="bodySmall" style={{ color: '#EF4444', marginBottom: 8 }}>
                {error}
              </Text>
            )}

            <View style={styles.actionRow}>
              <Button onPress={startOver} style={{ flex: 1 }}>
                Start Over
              </Button>
              <Button
                mode="contained"
                onPress={handleConfirm}
                loading={confirming}
                disabled={confirming || selectedCount === 0}
                style={{ flex: 1 }}
              >
                Import {selectedCount}
              </Button>
            </View>
          </View>
        )}

        {activeStep === 2 && summary && (
          <Surface style={[styles.card, { alignItems: 'center', paddingVertical: 40 }]} elevation={1}>
            <MaterialCommunityIcons name="check-circle-outline" size={48} color="#22C55E" />
            <Text variant="titleMedium" style={{ marginTop: 12, marginBottom: 4, fontWeight: '700' }}>
              Import Complete
            </Text>
            <Text variant="bodyMedium" style={{ color: '#64748B', textAlign: 'center', marginBottom: 20 }}>
              {summary.created} transaction{summary.created === 1 ? '' : 's'} added
              {summary.unallocated > 0 ? ` (${summary.unallocated} need${summary.unallocated === 1 ? 's' : ''} allocation)` : ''}
              {summary.skipped > 0 ? `, ${summary.skipped} row${summary.skipped === 1 ? '' : 's'} not imported` : ''}.
            </Text>
            <Button mode="contained" onPress={startOver}>
              Import Another Statement
            </Button>
          </Surface>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: brand.bg },
  container: { flex: 1, backgroundColor: brand.bg },
  content: { padding: 16, paddingBottom: 48 },
  stepRow: { flexDirection: 'row', justifyContent: 'center', gap: 32, paddingVertical: 16, backgroundColor: '#FFFFFF' },
  stepItem: { alignItems: 'center' },
  stepDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: 12, padding: 16, backgroundColor: '#FFFFFF' },
  input: { backgroundColor: '#FFFFFF', marginBottom: 12 },
  uploadBtn: { marginBottom: 12 },
  infoBox: { flexDirection: 'row', backgroundColor: '#EFF6FF', borderRadius: 8, padding: 10, alignItems: 'flex-start' },
  muted: { color: '#64748B', marginBottom: 4 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
});

export default ImportsScreen;
