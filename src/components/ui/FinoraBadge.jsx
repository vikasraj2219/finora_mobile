import { View, Text, StyleSheet } from 'react-native';
import tokens from '../../theme/tokens';

// Small numeric/dot badge — unread counts, filter-active counts, etc.
const FinoraBadge = ({ count, dot = false, style }) => {
  if (dot) return <View style={[styles.dot, style]} />;
  if (!count) return null;
  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.text}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: tokens.semantic.expense },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: tokens.semantic.expense,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: '#fff', fontSize: 10, fontWeight: '700' },
});

export default FinoraBadge;
