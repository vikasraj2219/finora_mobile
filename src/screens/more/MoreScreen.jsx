import { View, StyleSheet } from 'react-native';
import { List } from 'react-native-paper';
import tokens from '../../theme/tokens';

// Light-touch pass for Phase 1 (added Import Statement, since it moved out of
// the bottom tabs into the floating Add + here) — full grouped-sections
// redesign (Profile / Data / Preferences / Support, per brief §14) lands in
// Phase 7 along with Settings. No in-body heading here — the Stack header
// (MoreStack.jsx) already shows "More", so this screen is just the list.
const MENU = [
  { label: 'Import Statement', icon: 'file-upload-outline', route: 'Imports' },
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
    {MENU.map((item) => (
      <List.Item
        key={item.route}
        title={item.label}
        left={(props) => <List.Icon {...props} icon={item.icon} color={tokens.brand.ink800} />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={() => navigation.navigate(item.route)}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.neutral.surface, paddingTop: 8 },
});

export default MoreScreen;
