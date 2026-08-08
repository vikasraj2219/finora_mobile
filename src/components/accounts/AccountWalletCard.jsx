import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FinoraCard from '../ui/FinoraCard';
import { formatCurrency } from '../../utils/formatters';
import tokens from '../../theme/tokens';

const relativeUpdated = (isoDate) => {
  if (!isoDate) return null;
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days <= 0) return 'Updated today';
  if (days === 1) return 'Updated yesterday';
  if (days < 30) return `Updated ${days}d ago`;
  return `Updated ${new Date(isoDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`;
};

// Wallet-style account card per brief §7 — icon, name, masked number, balance,
// transaction count, last-updated, all in one compact tap target that opens
// the action sheet (rather than a separate always-visible kebab menu).
const AccountWalletCard = ({
  icon,
  iconTone,
  name,
  subtitle,
  maskedNumber,
  balance,
  currency,
  isActive,
  transactionCount,
  updatedAt,
  onPress,
}) => {
  const negative = balance < 0;
  const balanceColor = negative ? tokens.semantic.expense : tokens.neutral.textPrimary;
  const updated = relativeUpdated(updatedAt);

  return (
    <Pressable onPress={onPress}>
      <FinoraCard style={[styles.card, !isActive && styles.inactiveCard]}>
        <View style={styles.topRow}>
          <View style={[styles.iconWrap, { backgroundColor: `${iconTone}17` }]}>
            <MaterialCommunityIcons name={icon} size={19} color={iconTone} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {[subtitle, maskedNumber].filter(Boolean).join(' · ')}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color={tokens.neutral.textMuted} />
        </View>

        {balance !== null && (
          <Text style={[styles.balance, { color: balanceColor }]}>
            {negative && '-'}
            {formatCurrency(Math.abs(balance), currency)}
          </Text>
        )}

        <View style={styles.footerRow}>
          {!isActive && <Text style={styles.archivedTag}>Archived</Text>}
          {transactionCount != null && <Text style={styles.footerText}>{transactionCount} transactions</Text>}
          {updated && <Text style={styles.footerText}>{updated}</Text>}
        </View>
      </FinoraCard>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  inactiveCard: { opacity: 0.55 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  name: { ...tokens.typography.bodyLg, fontWeight: '700', color: tokens.neutral.textPrimary },
  subtitle: { ...tokens.typography.caption, color: tokens.neutral.textMuted, marginTop: 1 },
  balance: { ...tokens.typography.h2, marginTop: tokens.space.md },
  footerRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  footerText: { ...tokens.typography.caption, color: tokens.neutral.textMuted },
  archivedTag: { ...tokens.typography.caption, color: tokens.semantic.warning, fontWeight: '700' },
});

export default AccountWalletCard;
