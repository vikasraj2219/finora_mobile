import { Component } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FinoraButton from '../ui/FinoraButton';
import tokens from '../../theme/tokens';

// Metro's red error screen only shows up in dev builds — a release APK (like
// one built with `gradlew assembleRelease`) just crashes to a blank/white
// screen on any uncaught render error, with nothing to go on. This boundary
// catches those errors and renders the actual message + component stack so
// the failure is diagnosable without a device log. Wrap this around any
// screen (or the whole app) that you want to fail loudly instead of silently.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info?.componentStack);
  }

  reset = () => this.setState({ error: null, info: null });

  render() {
    const { error, info } = this.state;
    if (!error) return this.props.children;

    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{String(error?.message || error)}</Text>
          {!!info?.componentStack && <Text style={styles.stack}>{info.componentStack}</Text>}
          <FinoraButton label="Try again" onPress={this.reset} style={{ marginTop: tokens.space.lg }} />
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.neutral.bg },
  content: { padding: tokens.space.lg },
  title: { ...tokens.typography.h2, color: tokens.semantic.error, marginBottom: tokens.space.md },
  message: { ...tokens.typography.body, color: tokens.neutral.textPrimary, marginBottom: tokens.space.md },
  stack: { ...tokens.typography.caption, color: tokens.neutral.textMuted },
});

export default ErrorBoundary;
