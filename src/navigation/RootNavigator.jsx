import { NavigationContainer } from '@react-navigation/native';
import { View, Image, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import { brand } from '../theme/theme';

const SplashLoading = ({ retrying }) => (
  <View style={styles.splash}>
    <Image source={require('../../assets/logo-full.png')} style={styles.logo} resizeMode="contain" />
    <ActivityIndicator animating color={brand.teal} style={{ marginTop: 24 }} />
    {retrying && (
      <Text variant="bodySmall" style={styles.retryText}>
        Waking up the server — this can take up to a minute on the free tier…
      </Text>
    )}
  </View>
);

const RootNavigator = () => {
  const { user, loading, retrying } = useAuth();

  if (loading) return <SplashLoading retrying={retrying} />;

  return <NavigationContainer>{user ? <MainTabs /> : <AuthStack />}</NavigationContainer>;
};

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 40 },
  logo: { width: 200, height: 60 },
  retryText: { color: '#94A3B8', textAlign: 'center', marginTop: 16 },
});

export default RootNavigator;
