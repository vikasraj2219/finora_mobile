import { View, StyleSheet } from 'react-native';
import { Text, Avatar, Button, Divider, List } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { brand } from '../../theme/theme';

// Minimal, functional Settings screen for Phase 1 (profile + logout) so the auth
// loop is fully testable end to end. Password change, currency, activity log, and
// other settings from the web app's Settings page land in Phase 5.
const SettingsScreen = () => {
  const { user, logout, isAdmin } = useAuth();

  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text size={64} label={initials} style={{ backgroundColor: brand.navy }} />
        <Text variant="titleLarge" style={styles.name}>
          {user?.name}
        </Text>
        <Text variant="bodyMedium" style={styles.email}>
          {user?.email}
        </Text>
      </View>

      <Divider style={{ marginVertical: 16 }} />

      <List.Item title="Role" description={isAdmin ? 'Admin' : 'Member'} left={(props) => <List.Icon {...props} icon="shield-account-outline" />} />
      <List.Item title="Currency" description={user?.currency || 'INR'} left={(props) => <List.Icon {...props} icon="cash" />} />

      <Divider style={{ marginVertical: 16 }} />

      <Button mode="outlined" icon="logout" onPress={logout} textColor={brand.navy} style={styles.logoutBtn}>
        Log Out
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: brand.bg, padding: 24 },
  header: { alignItems: 'center', marginTop: 16 },
  name: { marginTop: 12, fontWeight: '700', color: brand.navy },
  email: { color: '#64748B' },
  logoutBtn: { borderColor: brand.navy },
});

export default SettingsScreen;
