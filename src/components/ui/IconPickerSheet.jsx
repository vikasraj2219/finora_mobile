import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FinoraBottomSheet from './FinoraBottomSheet';
import ICON_LIBRARY from '../../utils/iconLibrary';
import tokens from '../../theme/tokens';

// Grid icon picker — replaces free-text icon name entry across Category/
// Subcategory/Type forms per brief §10 ("beautiful icon picker, avoid
// question-mark placeholder icons").
const IconPickerSheet = ({ visible, onClose, value, onSelect, accentColor = tokens.brand.ink800 }) => (
  <FinoraBottomSheet visible={visible} onClose={onClose} title={<Text style={styles.title}>Choose an Icon</Text>}>
    <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {ICON_LIBRARY.map((icon) => {
          const selected = value === icon.name;
          return (
            <Pressable
              key={icon.name}
              style={[styles.tile, selected && { backgroundColor: `${accentColor}17`, borderColor: accentColor }]}
              onPress={() => {
                onSelect(icon.name);
                onClose();
              }}
            >
              <MaterialCommunityIcons name={icon.name} size={22} color={selected ? accentColor : tokens.neutral.textSecondary} />
              <Text style={[styles.tileLabel, selected && { color: accentColor, fontWeight: '700' }]} numberOfLines={1}>
                {icon.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  </FinoraBottomSheet>
);

const styles = StyleSheet.create({
  title: { ...tokens.typography.h3, color: tokens.neutral.textPrimary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 8 },
  tile: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: tokens.radius.md,
    borderWidth: 1.5,
    borderColor: tokens.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 2,
  },
  tileLabel: { fontSize: 9, color: tokens.neutral.textMuted, textAlign: 'center' },
});

export default IconPickerSheet;
