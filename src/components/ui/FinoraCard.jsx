import { View, StyleSheet, Pressable } from 'react-native';
import tokens from '../../theme/tokens';

// Base surface for the whole app — every card (stat, account, transaction,
// insight) should render inside this rather than a one-off <Surface>, so
// radius/shadow/padding stay identical everywhere.
const FinoraCard = ({ children, onPress, style, padded = true, elevation = 'low' }) => {
  const content = (
    <View style={[styles.base, tokens.shadow[elevation], padded && styles.padded, style]}>{children}</View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: { backgroundColor: tokens.neutral.surface, borderRadius: tokens.radius.lg },
  padded: { padding: tokens.space.lg },
  pressed: { opacity: 0.85, transform: [{ scale: 0.995 }] },
});

export default FinoraCard;
