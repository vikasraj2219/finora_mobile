import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import { QuickAddProvider } from './src/context/QuickAddContext';
import RootNavigator from './src/navigation/RootNavigator';
import theme from './src/theme/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <QuickAddProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </QuickAddProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
