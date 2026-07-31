import { Pressable, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tokens from '../../theme/tokens';

// Thin, opinionated wrapper — three variants (primary/secondary/ghost) instead
// of Paper's many mode combinations, so button styling can't drift screen to
// screen. Press feedback is a scale+opacity micro-interaction (brief §15).
const FinoraButton = ({ label, onPress, variant = 'primary', icon, loading, disabled, fullWidth, style }) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        variants[variant],
        fullWidth && { width: '100%' },
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? '#fff' : tokens.brand.ink800} />
      ) : (
        <View style={styles.content}>
          {icon && (
            <MaterialCommunityIcons
              name={icon}
              size={16}
              color={variant === 'primary' ? '#fff' : tokens.brand.ink800}
              style={{ marginRight: 6 }}
            />
          )}
          <Text style={[styles.label, textVariants[variant]]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: tokens.radius.md,
    paddingVertical: 12,
    paddingHorizontal: tokens.space.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center' },
  label: { ...tokens.typography.button },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});

const variants = StyleSheet.create({
  primary: { backgroundColor: tokens.brand.ink800 },
  secondary: { backgroundColor: tokens.brand.teal100 },
  ghost: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: tokens.neutral.border },
});

const textVariants = StyleSheet.create({
  primary: { color: '#fff' },
  secondary: { color: tokens.brand.ink800 },
  ghost: { color: tokens.brand.ink800 },
});

export default FinoraButton;
