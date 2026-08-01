import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FinoraBottomSheet from '../ui/FinoraBottomSheet';
import FinoraButton from '../ui/FinoraButton';
import FinoraChip from '../ui/FinoraChip';
import tokens from '../../theme/tokens';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'UNALLOCATED', label: '🔴 Unallocated' },
  { value: 'PARTIALLY_ALLOCATED', label: '🟡 Partial' },
  { value: 'FULLY_ALLOCATED', label: '🟢 Complete' },
];

const SOURCE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'IMPORTED', label: 'Imported' },
];

const OptionRow = ({ options, value, onSelect, title }) => (
  <View style={{ marginBottom: tokens.space.lg }}>
    <Text style={styles.groupTitle}>{title}</Text>
    <View style={styles.chipWrap}>
      {options.map((o) => (
        <Pressable key={o.value} onPress={() => onSelect(o.value)}>
          <FinoraChip label={o.label} tone={value === o.value ? 'brand' : 'neutral'} />
        </Pressable>
      ))}
    </View>
  </View>
);

// Premium filter bottom sheet — brief §8. Category filter list is passed in
// (real categories from the API); Amount-range filtering isn't wired to the
// backend yet (transaction.service.js has no min/max amount query param) —
// left out rather than faked; flagged as a backend follow-up.
const TransactionFilterSheet = ({ open, onClose, filters, categories, onApply, onClear }) => {
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const set = (key) => (val) => setDraft((d) => ({ ...d, [key]: d[key] === val ? '' : val }));

  return (
    <FinoraBottomSheet visible={open} onClose={onClose} title={<Text style={styles.title}>Filter & Sort</Text>}>
      <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>
        <OptionRow
          title="Sort by"
          value={`${draft.sortBy || 'date'}:${draft.sortDir || 'desc'}`}
          onSelect={(v) => {
            const [sortBy, sortDir] = v.split(':');
            setDraft((d) => ({ ...d, sortBy, sortDir }));
          }}
          options={[
            { value: 'date:desc', label: 'Newest' },
            { value: 'date:asc', label: 'Oldest' },
            { value: 'amount:desc', label: 'Highest amount' },
            { value: 'amount:asc', label: 'Lowest amount' },
          ]}
        />
        <OptionRow title="Status" value={draft.allocationStatus || ''} onSelect={set('allocationStatus')} options={STATUS_OPTIONS} />
        <OptionRow title="Source" value={draft.entrySource || ''} onSelect={set('entrySource')} options={SOURCE_OPTIONS} />
        <View style={{ marginBottom: tokens.space.lg }}>
          <Text style={styles.groupTitle}>Category</Text>
          <View style={styles.chipWrap}>
            <Pressable onPress={set('category')('')}>
              <FinoraChip label="All" tone={!draft.category ? 'brand' : 'neutral'} />
            </Pressable>
            {categories.map((c) => (
              <Pressable key={c._id} onPress={set('category')(c._id)}>
                <FinoraChip label={c.name} tone={draft.category === c._id ? 'brand' : 'neutral'} />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <FinoraButton
          label="Clear"
          variant="ghost"
          style={{ flex: 1 }}
          onPress={() => {
            onClear();
            onClose();
          }}
        />
        <FinoraButton
          label="Apply"
          variant="primary"
          style={{ flex: 1 }}
          onPress={() => {
            onApply(draft);
            onClose();
          }}
        />
      </View>
    </FinoraBottomSheet>
  );
};

const styles = StyleSheet.create({
  title: { ...tokens.typography.h3, color: tokens.neutral.textPrimary },
  groupTitle: { ...tokens.typography.label, color: tokens.neutral.textMuted, marginBottom: 8 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  footer: { flexDirection: 'row', gap: 10, paddingTop: tokens.space.md, borderTopWidth: 1, borderTopColor: tokens.neutral.border },
});

export default TransactionFilterSheet;
