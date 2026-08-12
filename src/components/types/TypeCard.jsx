import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FinoraCard from '../ui/FinoraCard';
import tokens from '../../theme/tokens';

// Mirrors CategoryCard's visual language (colored icon avatar, soft tint,
// pill badges) so Types no longer looks like a leftover admin table next to
// the rest of the redesigned app. Code is shown as a monospace-style pill
// rather than plain caption text since it's a machine key, not prose.
const TypeCard = ({ type, onPress, onDelete }) => {
  const color = type.color || tokens.brand.ink800;
  return (
    <FinoraCard style={styles.card} padded={false}>
      <Pressable onPress={onPress} style={styles.pressArea}>
        <View style={[styles.iconWrap, { backgroundColor: `${color}17` }]}>
          <MaterialCommunityIcons name={type.icon || 'label'} size={20} color={color} />
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.label} numberOfLines={1}>
            {type.label}
          </Text>
          <View style={styles.codeRow}>
            <View style={[styles.codePill, { backgroundColor: `${color}12` }]}>
              <Text style={[styles.codeText, { color }]}>{type.code}</Text>
            </View>
            {type.appliesToCategory && (
              <View style={styles.badge}>
                <MaterialCommunityIcons name="shape-outline" size={10} color={tokens.semantic.income} />
                <Text style={[styles.badgeText, { color: tokens.semantic.income }]}>Category-eligible</Text>
              </View>
            )}
          </View>
        </View>

        {type.isSystem ? (
          <View style={styles.systemBadge}>
            <MaterialCommunityIcons name="lock-outline" size={11} color={tokens.neutral.textMuted} />
            <Text style={styles.systemBadgeText}>System</Text>
          </View>
        ) : (
          <Pressable onPress={onDelete} hitSlop={8} style={styles.deleteBtn}>
            <MaterialCommunityIcons name="trash-can-outline" size={18} color={tokens.semantic.error} />
          </Pressable>
        )}
      </Pressable>
    </FinoraCard>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  pressArea: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: tokens.space.lg },
  iconWrap: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  label: { ...tokens.typography.bodyLg, fontWeight: '700', color: tokens.neutral.textPrimary },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5, flexWrap: 'wrap' },
  codePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: tokens.radius.sm },
  codeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: tokens.semantic.incomeTint, paddingHorizontal: 7, paddingVertical: 2, borderRadius: tokens.radius.pill },
  badgeText: { fontSize: 10, fontWeight: '700' },
  systemBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: tokens.neutral.surfaceAlt, paddingHorizontal: 8, paddingVertical: 4, borderRadius: tokens.radius.pill },
  systemBadgeText: { fontSize: 10, fontWeight: '700', color: tokens.neutral.textMuted },
  deleteBtn: { padding: 4 },
});

export default TypeCard;
