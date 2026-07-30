import { View, StyleSheet } from 'react-native';
import { List, Divider, Text } from 'react-native-paper';
import { brand } from '../../theme/theme';

// Mirrors the web app's hamburger-drawer pattern: bottom tabs cover the
// thumb-reachable daily actions (Dashboard/Transactions/Accounts/Import),
// everything else lives here — one tap further, same as the web sidebar's
// less-frequent destinations. All screens below are now fully built (Phase 5 complete).
const MENU = [
  { label: 'Allocation', icon: 'checkbox-marked-outline', route: 'Allocation' },
  { label: 'Categories', icon: 'shape-outline', route: 'Categories' },
  { label: 'Types', icon: 'tune', route: 'Types' },
  { label: 'Subcategories', icon: 'file-tree-outline', route: 'Subcategories' },
  { label: 'Merchants', icon: 'store-outline', route: 'Merchants' },
  { label: 'Reports', icon: 'chart-box-outline', route: 'Reports' },
  { label: 'Notifications', icon: 'bell-outline', route: 'Notifications' },
  { label: 'Settings', icon: 'cog-outline', route: 'Settings' },
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
