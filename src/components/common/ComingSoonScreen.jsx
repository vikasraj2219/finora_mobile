import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { brand } from '../../theme/theme';

// Temporary stand-in for screens that land in a later phase — swapped out for the
// real screen as each phase is built, so navigation/tabs are testable end-to-end now.
const ComingSoonScreen = ({ title, phase }) => (
  <View style={styles.container}>
    <Text variant="titleMedium" style={styles.title}>
      {title}
    </Text>
    <Text variant="bodyMedium" style={styles.subtitle}>
      Coming in {phase}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: brand.bg },
  title: { color: brand.navy, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: '#64748B' },
});

export default ComingSoonScreen;
