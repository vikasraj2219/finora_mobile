import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, View, StyleSheet, Dimensions, Easing } from 'react-native';
import { Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import tokens from '../../theme/tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Lightweight bottom sheet built on RN's own Animated API (no @gorhom/bottom-sheet
// or similar) — the brief explicitly warns against unnecessary heavy
// dependencies (§21), and we already have a working Modal-based dialog pattern
// from earlier phases. This gives the same slide-up/backdrop-fade feel used by
// Revolut/Monzo-style pickers without adding new native modules to the build
// (the exact thing that caused the Gradle debugging earlier in this project).
const FinoraBottomSheet = ({ visible, onClose, children, title }) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  // Keeps the Portal mounted for the duration of the close animation instead
  // of unmounting the instant `visible` flips to false. Unmounting the Portal
  // (which tears down a native view tree) at the exact same moment something
  // else — e.g. a tab navigation triggered by the same tap — is also
  // transitioning views is a real crash trigger on Android; this was actually
  // happening (not just a cosmetic animation skip) whenever an action inside
  // a sheet both closed the sheet and navigated in the same call.
  const [rendered, setRendered] = useState(visible);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setRendered(false);
      });
    }
  }, [visible, translateY, backdropOpacity]);

  if (!rendered) return null;

  return (
    <Portal>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </Pressable>
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <SafeAreaView edges={['bottom']}>
          <View style={styles.handle} />
          {title && <View style={styles.titleRow}>{title}</View>}
          {children}
        </SafeAreaView>
      </Animated.View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(7,26,48,0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: tokens.neutral.surface,
    borderTopLeftRadius: tokens.radius.xl,
    borderTopRightRadius: tokens.radius.xl,
    paddingHorizontal: tokens.space.lg,
    paddingBottom: tokens.space.md,
    ...tokens.shadow.high,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: tokens.neutral.border,
    alignSelf: 'center',
    marginTop: tokens.space.sm,
    marginBottom: tokens.space.sm,
  },
  titleRow: { marginBottom: tokens.space.md },
});

export default FinoraBottomSheet;
