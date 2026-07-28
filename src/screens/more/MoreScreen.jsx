import { View, StyleSheet } from 'react-native';
import { List, Divider, Text } from 'react-native-paper';
import { brand } from '../../theme/theme';

// Mirrors the web app's hamburger-drawer pattern: bottom tabs cover the
// thumb-reachable daily actions (Dashboard/Transactions/Accounts/Import),
// everything else lives here — one tap further, same as the web sidebar's
// less-frequent destinations.
const MENU = [
  { label: 'Allocation', icon: 'checkbox-marked-outline', route: 'Allocation', phase: 'Phase 3' },
  { label: 'Categories', icon: 'shape-outline', route: 'Categories', phase: 'Phase 4' },
  { label: 'Types', icon: 'tune', route: 'Types', phase: 'Phase 4' },
  { label: 'Subcategories', icon: 'file-tree-outline', route: 'Subcategories', phase: 'Phase 4' },
  { label: 'Merchants', icon: 'store-outline', route: 'Merchants', phase: 'Phase 4' },
  { label: 'Reports', icon: 'chart-box-outline', route: 'Reports', phase: 'Phase 5' },
  { label: 'Settings', icon: 'cog-outline', route: 'Settings', phase: 'Phase 1' },
];

const MoreScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text variant="titleMedium" style={styles.heading}>
      More
    </Text>
    <Divider />
    {MENU.map((item) => (
      <List.Item
        key={item.route}
        title={item.label}
        description={item.phase !== 'Phase 1' ? `Coming in ${item.phase}` : undefined}
        left={(props) => <List.Icon {...props} icon={item.icon} color={brand.navy} />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={() => navigation.navigate(item.route)}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: brand.paper },
  heading: { padding: 16, color: brand.navy, fontWeight: '700' },
});

export default MoreScreen;
