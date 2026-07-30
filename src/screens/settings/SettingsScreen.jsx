import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Avatar, Button, Divider, List, TextInput, Menu, Surface, Snackbar, Chip } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { updateProfileRequest, updatePasswordRequest } from '../../api/authApi';
import { listAuditLogs } from '../../api/auditLogApi';
import { formatDate } from '../../utils/formatters';
import { brand } from '../../theme/theme';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

const ProfileTab = ({ onSaved }) => {
  const { user } = useAuth();
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { name: user?.name || '', currency: user?.currency || 'INR' } });

  const submit = async (values) => {
    await updateProfileRequest(values);
    onSaved('Profile updated');
  };

  return (
    <Surface style={styles.card} elevation={1}>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <TextInput label="Full Name" value={value} onChangeText={onChange} mode="outlined" style={styles.input} />
        )}
      />
      <TextInput label="Email" value={user?.email || ''} mode="outlined" disabled style={styles.input} />
      <Controller
        control={control}
        name="currency"
        render={({ field: { onChange, value } }) => (
          <Menu
            visible={currencyMenuOpen}
            onDismiss={() => setCurrencyMenuOpen(false)}
            anchor={
              <TextInput
                label="Currency"
                value={value}
                mode="outlined"
                editable={false}
                onPressIn={() => setCurrencyMenuOpen(true)}
                right={<TextInput.Icon icon="menu-down" onPress={() => setCurrencyMenuOpen(true)} />}
                style={styles.input}
              />
            }
          >
            {CURRENCIES.map((c) => (
              <Menu.Item key={c} title={c} onPress={() => { onChange(c); setCurrencyMenuOpen(false); }} />
            ))}
          </Menu>
        )}
      />
      <Button mode="contained" onPress={handleSubmit(submit)} loading={isSubmitting} disabled={isSubmitting} style={{ alignSelf: 'flex-start', marginTop: 4 }}>
        Save Changes
      </Button>
    </Surface>
  );
};

const SecurityTab = ({ onSaved }) => {
  const [secureCurrent, setSecureCurrent] = useState(true);
  const [secureNew, setSecureNew] = useState(true);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { currentPassword: '', newPassword: '' } });

  const submit = async (values) => {
    await updatePasswordRequest(values);
    reset({ currentPassword: '', newPassword: '' });
    onSaved('Password updated');
  };

  return (
    <Surface style={styles.card} elevation={1}>
      <Controller
        control={control}
        name="currentPassword"
        rules={{ required: 'Required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Current Password"
            value={value}
            onChangeText={onChange}
            mode="outlined"
            secureTextEntry={secureCurrent}
            right={<TextInput.Icon icon={secureCurrent ? 'eye-off' : 'eye'} onPress={() => setSecureCurrent(!secureCurrent)} />}
            error={!!errors.currentPassword}
            style={styles.input}
          />
        )}
      />
      <Controller
        control={control}
        name="newPassword"
        rules={{ required: 'Required', minLength: { value: 8, message: 'At least 8 characters' } }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="New Password"
            value={value}
            onChangeText={onChange}
            mode="outlined"
            secureTextEntry={secureNew}
            right={<TextInput.Icon icon={secureNew ? 'eye-off' : 'eye'} onPress={() => setSecureNew(!secureNew)} />}
            error={!!errors.newPassword}
            style={styles.input}
          />
        )}
      />
      <Button mode="contained" onPress={handleSubmit(submit)} loading={isSubmitting} disabled={isSubmitting} style={{ alignSelf: 'flex-start', marginTop: 4 }}>
        Update Password
      </Button>
    </Surface>
  );
};

const ActivityLogTab = () => {
  const [logs, setLogs] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      listAuditLogs({ limit: 50 })
        .then(({ data }) => setLogs(data.data.items))
        .catch(() => {})
        .finally(() => setLoaded(true));
    }, [])
  );

  if (!loaded) return null;

  return (
    <View>
      {logs.length === 0 ? (
        <Text variant="bodyMedium" style={{ color: '#64748B', padding: 16 }}>
          No activity recorded yet.
        </Text>
      ) : (
        logs.map((l) => (
          <Surface key={l._id} style={styles.logCard} elevation={1}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Chip compact textStyle={{ fontSize: 10 }}>
                {l.action}
              </Chip>
              <Text variant="labelSmall" style={{ color: '#94A3B8' }}>
                {formatDate(l.createdAt)}
              </Text>
            </View>
            <Text variant="bodySmall" style={{ fontWeight: '600' }}>
              {l.entityType}
            </Text>
            <Text variant="bodySmall" style={{ color: '#64748B', marginTop: 2 }}>
              {l.description}
            </Text>
          </Surface>
        ))
      )}
    </View>
  );
};

// Mirrors frontend/src/pages/settings/Settings.jsx — Profile / Security / Activity Log
// tabs, plus the logout action from Phase 1.
const SettingsScreen = () => {
  const { user, logout, isAdmin } = useAuth();
  const [tab, setTab] = useState('profile');
  const [snackbar, setSnackbar] = useState('');

  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar.Text size={56} label={initials} style={{ backgroundColor: brand.navy }} />
          <View style={{ marginLeft: 12 }}>
            <Text variant="titleMedium" style={{ fontWeight: '700', color: brand.navy }}>
              {user?.name}
            </Text>
            <Text variant="bodySmall" style={{ color: '#64748B' }}>
              {user?.email} · {isAdmin ? 'Admin' : 'Member'}
            </Text>
          </View>
        </View>

        <View style={styles.tabRow}>
          {[
            { value: 'profile', label: 'Profile' },
            { value: 'security', label: 'Security' },
            { value: 'activity', label: 'Activity Log' },
          ].map((t) => (
            <Button
              key={t.value}
              mode={tab === t.value ? 'contained' : 'outlined'}
              compact
              onPress={() => setTab(t.value)}
              style={{ flex: 1 }}
            >
              {t.label}
            </Button>
          ))}
        </View>

        {tab === 'profile' && <ProfileTab onSaved={setSnackbar} />}
        {tab === 'security' && <SecurityTab onSaved={setSnackbar} />}
        {tab === 'activity' && <ActivityLogTab />}

        <Divider style={{ marginVertical: 20 }} />
        <Button mode="outlined" icon="logout" onPress={logout} textColor={brand.navy} style={{ borderColor: brand.navy }}>
          Log Out
        </Button>
      </ScrollView>

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={2500}>
        {snackbar}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: brand.bg },
  content: { padding: 16, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  card: { borderRadius: 12, padding: 16, backgroundColor: '#FFFFFF' },
  input: { backgroundColor: '#FFFFFF', marginBottom: 12 },
  logCard: { borderRadius: 12, padding: 12, backgroundColor: '#FFFFFF', marginBottom: 8 },
});

export default SettingsScreen;
