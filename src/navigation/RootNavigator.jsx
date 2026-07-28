import { NavigationContainer } from '@react-navigation/native';
import { View, Image, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import { brand } from '../theme/theme';

const SplashLoading = () => (
  <View style={styles.splash}>
    <Image source={require('../../assets/logo-full.png')} style={styles.logo} resizeMode="contain" />
    <ActivityIndicator animating color={brand.teal} style={{ marginTop: 24 }} />
  </View>
);

const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) return <SplashLoading />;

  return <NavigationContainer>{user ? <MainTabs /> : <AuthStack />}</NavigationContainer>;
};

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  logo: { width: 200, height: 60 },
});

export default RootNavigator;
