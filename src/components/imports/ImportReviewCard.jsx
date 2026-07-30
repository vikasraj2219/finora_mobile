import { View, StyleSheet } from 'react-native';
import { Text, Checkbox, Chip, Menu, TextInput, Surface } from 'react-native-paper';
import { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';

// Mirrors frontend/src/components/imports/ImportReviewTable.jsx as stacked cards —
// a 7-column table with two editable dropdowns per row has no room on a phone.
const ImportReviewCard = ({ row, index, categories, onChange }) => {
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const relevantCategories = categories.filter((c) => c.type === row.type);
  const selectedCategory = relevantCategories.find((c) => c._id === row.category);

  return (
    <Surface style={[styles.card, row.isDuplicate && styles.duplicateCard]} elevation={1}>
      <View style={styles.topRow}>
        <Checkbox checked={row.include} onPress={() => onChange(index, { include: !row.include })} />
        <View style={{ flex: 1 }}>
          <View style={styles.headRow}>
            <Text variant="bodyMedium" style={styles.desc} numberOfLines={1}>
              {row.description}
            </Text>
            <Text
              variant="bodyMedium"
              style={{ fontWeight: '700', color: row.type === 'income' ? '#22C55E' : '#EF4444' }}
            >
              {row.type === 'income' ? '+' : '-'}
              {formatCurrency(row.amount)}
            </Text>
          </View>
          <View style={styles.chipRow}>
            <Chip compact textStyle={{ fontSize: 10 }}>
              {row.type}
            </Chip>
            <Text variant="labelSmall" style={styles.muted}>
              {formatDate(row.date)}
            </Text>
            {row.isDuplicate && (
              <Chip compact textStyle={{ fontSize: 10 }}>
                Possible duplicate
              </Chip>
            )}
          </View>

          <Menu
            visible={catMenuOpen}
            onDismiss={() => setCatMenuOpen(false)}
            anchor={
              <TextInput
                label="Category"
                value={selectedCategory?.name || ''}
                mode="outlined"
                dense
                editable={false}
                onPressIn={() => setCatMenuOpen(true)}
                right={<TextInput.Icon icon="menu-down" onPress={() => setCatMenuOpen(true)} />}
                style={styles.input}
              />
            }
          >
            <Menu.Item title="Select…" onPress={() => { onChange(index, { category: '' }); setCatMenuOpen(false); }} />
            {relevantCategories.map((c) => (
              <Menu.Item
                key={c._id}
                title={c.name}
                onPress={() => {
                  onChange(index, { category: c._id });
                  setCatMenuOpen(false);
                }}
              />
            ))}
          </Menu>

          <TextInput
            label="Merchant"
            placeholder={row.suggestedMerchant?.name || 'New merchant name'}
            value={row.newMerchantName || ''}
            onChangeText={(text) => onChange(index, { newMerchantName: text })}
            mode="outlined"
            dense
            style={styles.input}
          />
        </View>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 12, backgroundColor: '#FFFFFF', marginBottom: 10, padding: 4 },
  duplicateCard: { backgroundColor: '#FFFBEB' },
  topRow: { flexDirection: 'row', alignItems: 'flex-start' },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 10, paddingRight: 8 },
  desc: { fontWeight: '600', flex: 1 },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, marginBottom: 10, flexWrap: 'wrap' },
  muted: { color: '#94A3B8' },
  input: { backgroundColor: '#FFFFFF', marginBottom: 8, marginRight: 8 },
});

export default ImportReviewCard;
