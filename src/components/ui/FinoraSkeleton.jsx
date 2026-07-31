import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import tokens from '../../theme/tokens';

// Shimmering placeholder block — built on RN's built-in Animated API rather
// than pulling in a skeleton-loader package, per the "don't add heavy
// dependencies unnecessarily" rule. Use in place of ActivityIndicator
// full-screen spinners on data-heavy screens (Dashboard, Transactions).
const FinoraSkeleton = ({ width = '100%', height = 16, radius = tokens.radius.sm, style }) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: tokens.neutral.surfaceAlt, opacity },
        style,
      ]}
    />
  );
};

export const FinoraCardSkeleton = ({ lines = 2 }) => (
  <Animated.View style={styles.cardSkeleton}>
    <FinoraSkeleton width={36} height={36} radius={10} style={{ marginBottom: 10 }} />
    {Array.from({ length: lines }).map((_, i) => (
      <FinoraSkeleton key={i} width={i === lines - 1 ? '60%' : '90%'} height={12} style={{ marginTop: 8 }} />
    ))}
  </Animated.View>
);

const styles = StyleSheet.create({
  cardSkeleton: {
    backgroundColor: tokens.neutral.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.space.lg,
    marginBottom: tokens.space.md,
  },
});

export default FinoraSkeleton;
