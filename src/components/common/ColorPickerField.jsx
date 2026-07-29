import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// A tap-to-pick swatch row instead of the web app's native <input type="color"> —
// there's no equivalent HTML color picker on mobile, and typing hex codes is poor
// mobile UX, so this offers a curated palette instead (still stores a plain hex string,
// same as the web app's `color` field).
const PALETTE = [
  '#0B2643', '#12A59D', '#22C55E', '#EF4444', '#F59E0B', '#3B82F6',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#64748B', '#A855F7',
];

const ColorPickerField = ({ label = 'Color', value, onChange }) => (
  <View style={{ marginBottom: 4 }}>
    <Text variant="labelMedium" style={styles.label}>
      {label}
    </Text>
    <View style={styles.row}>
      {PALETTE.map((c) => (
        <Pressable key={c} onPress={() => onChange(c)} style={[styles.swatch, { backgroundColor: c }]}>
          {value === c && <MaterialCommunityIcons name="check" size={16} color="#fff" />}
        </Pressable>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  label: { color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 11, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});

export default ColorPickerField;
