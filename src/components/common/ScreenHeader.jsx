import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { brand } from '../../theme/theme';

// Mirrors frontend/src/components/common/PageHeader.jsx — title + subtitle, action renders below
// on mobile (there's no room beside the title on a phone-width screen).
const ScreenHeader = ({ title, subtitle, action }) => (
  <View style={styles.container}>
    <Text variant="headlineSmall" style={styles.title}>
      {title}
    </Text>
    {subtitle && (
      <Text variant="bodyMedium" style={styles.subtitle}>
        {subtitle}
      </Text>
    )}
    {action && <View style={styles.action}>{action}</View>}
  </View>
);

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontWeight: '700', color: brand.navy },
  subtitle: { color: '#64748B', marginTop: 2 },
  action: { marginTop: 12 },
});

export default ScreenHeader;
