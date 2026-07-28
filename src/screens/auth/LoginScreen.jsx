import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { View, Image, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText, Snackbar } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { brand } from '../../theme/theme';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');
  const [secure, setSecure] = useState(true);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await login(values);
      // Navigation swaps to MainTabs automatically once `user` is set in AuthContext.
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Check your details and try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: brand.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Image source={require('../../../assets/logo-full.png')} style={styles.logo} resizeMode="contain" />

        <Text variant="headlineSmall" style={styles.title}>
          Welcome back
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Sign in to manage your finances
        </Text>

        <Controller
          control={control}
          name="email"
          rules={{ required: 'Email is required' }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Email"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              autoCapitalize="none"
              keyboardType="email-address"
              left={<TextInput.Icon icon="email-outline" />}
              error={!!errors.email}
              style={styles.input}
            />
          )}
        />
        <HelperText type="error" visible={!!errors.email}>
          {errors.email?.message}
        </HelperText>

        <Controller
          control={control}
          name="password"
          rules={{ required: 'Password is required' }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Password"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              secureTextEntry={secure}
              left={<TextInput.Icon icon="lock-outline" />}
              right={<TextInput.Icon icon={secure ? 'eye-off' : 'eye'} onPress={() => setSecure(!secure)} />}
              error={!!errors.password}
              style={styles.input}
            />
          )}
        />
        <HelperText type="error" visible={!!errors.password}>
          {errors.password?.message}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.submit}
          contentStyle={{ paddingVertical: 6 }}
        >
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </Button>

        <View style={styles.footerRow}>
          <Text variant="bodyMedium">New here? </Text>
          <Text variant="bodyMedium" style={styles.link} onPress={() => navigation.navigate('Register')}>
            Create the admin account
          </Text>
        </View>
      </ScrollView>

      <Snackbar visible={!!serverError} onDismiss={() => setServerError('')} duration={4000}>
        {serverError}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { height: 48, alignSelf: 'center', marginBottom: 28 },
  title: { textAlign: 'center', fontWeight: '700', color: brand.navy },
  subtitle: { textAlign: 'center', color: '#64748B', marginBottom: 24 },
  input: { backgroundColor: brand.paper },
  submit: { marginTop: 8, borderRadius: 8 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  link: { color: brand.teal, fontWeight: '600' },
});

export default LoginScreen;
