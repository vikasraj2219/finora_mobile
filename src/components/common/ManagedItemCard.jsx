import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Mirrors frontend/src/components/common/ManagedItemCard.jsx — colored left accent
// bar (real metadata, not decoration), icon swatch, edit/delete actions. Always
// visible (not hover-reveal) since touch has no hover state.
const ManagedItemCard = ({ color = '#64748B', icon = 'shape-outline', title, meta, badges, onEdit, onDelete }) => (
  <View style={styles.card}>
    <View style={[styles.accentBar, { backgroundColor: color }]} />
    <View style={styles.content}>
      <View style={styles.mainRow}>
        <View style={[styles.iconWrap, { backgroundColor: `${color}1F` }]}>
          <MaterialCommunityIcons name={icon} size={18} color={color} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="bodyMedium" style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {meta && (
            <Text variant="bodySmall" style={styles.meta} numberOfLines={1}>
              {meta}
            </Text>
          )}
          {badges && <View style={styles.badgeRow}>{badges}</View>}
        </View>
      </View>
      <View style={styles.actions}>
        {onEdit && <IconButton icon="pencil-outline" size={16} onPress={onEdit} style={styles.actionBtn} />}
        {onDelete && <IconButton icon="delete-outline" size={16} iconColor="#EF4444" onPress={onDelete} style={styles.actionBtn} />}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: { borderRadius: 12, backgroundColor: '#FFFFFF', overflow: 'hidden', flexDirection: 'row', marginBottom: 10 },
  accentBar: { width: 4 },
  content: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', padding: 12, gap: 10 },
  mainRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  iconWrap: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '600' },
  meta: { color: '#94A3B8', marginTop: 1 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  actions: { flexDirection: 'row' },
  actionBtn: { margin: 0 },
});

export default ManagedItemCard;
