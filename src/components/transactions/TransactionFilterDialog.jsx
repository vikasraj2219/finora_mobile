import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Portal, Dialog, Button, TextInput, Menu } from 'react-native-paper';

const TYPE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'adjustment', label: 'Adjustment' },
  { value: 'opening_balance', label: 'Opening Balance' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'UNALLOCATED', label: '🔴 Unallocated' },
  { value: 'PARTIALLY_ALLOCATED', label: '🟡 Partially Allocated' },
  { value: 'FULLY_ALLOCATED', label: '🟢 Fully Allocated' },
];

const SOURCE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'IMPORTED', label: 'Imported' },
];

const PickerRow = ({ label, value, options, onSelect }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchor={
        <TextInput
          label={label}
          value={selected?.label || ''}
          mode="outlined"
          editable={false}
          onPressIn={() => setOpen(true)}
          right={<TextInput.Icon icon="menu-down" onPress={() => setOpen(true)} />}
          style={styles.input}
        />
      }
    >
      {options.map((o) => (
        <Menu.Item key={o.value} title={o.label} onPress={() => { onSelect(o.value); setOpen(false); }} />
      ))}
    </Menu>
  );
};

// Mirrors frontend/src/components/transactions/TransactionFilters.jsx — same filter
// dimensions, presented as a dialog rather than an inline toolbar (there isn't room
// for 7 inline fields on a phone).
const TransactionFilterDialog = ({ open, onClose, filters, categories, onApply, onClear }) => {
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const set = (key) => (val) => setDraft((d) => ({ ...d, [key]: val }));

  return (
    <Portal>
      <Dialog visible={open} onDismiss={onClose} style={styles.dialog}>
        <Dialog.Title>Filter Transactions</Dialog.Title>
        <Dialog.ScrollArea style={{ maxHeight: 440 }}>
          <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
            <TextInput
              label="Search notes"
              value={draft.search || ''}
              onChangeText={set('search')}
              mode="outlined"
              style={styles.input}
            />
            <PickerRow label="Type" value={draft.type || ''} options={TYPE_OPTIONS} onSelect={set('type')} />
            <PickerRow
              label="Category"
              value={draft.category || ''}
              options={[{ value: '', label: 'All' }, ...categories.map((c) => ({ value: c._id, label: c.name }))]}
              onSelect={set('category')}
            />
            <PickerRow
              label="Status"
              value={draft.allocationStatus || ''}
              options={STATUS_OPTIONS}
              onSelect={set('allocationStatus')}
            />
            <PickerRow label="Source" value={draft.entrySource || ''} options={SOURCE_OPTIONS} onSelect={set('entrySource')} />
            <TextInput
              label="From (YYYY-MM-DD)"
              value={draft.dateFrom || ''}
              onChangeText={set('dateFrom')}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="To (YYYY-MM-DD)"
              value={draft.dateTo || ''}
              onChangeText={set('dateTo')}
              mode="outlined"
              style={styles.input}
            />
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button
            onPress={() => {
              onClear();
              onClose();
            }}
          >
            Clear
          </Button>
          <Button
            mode="contained"
            onPress={() => {
              onApply(draft);
              onClose();
            }}
          >
            Apply
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

export default TransactionFilterDialog;
