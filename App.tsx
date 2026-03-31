import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AlertProvider } from './src/context/AlertContext';
import AlertContainer from './src/components/AlertContainer';
import { useAlert } from './src/context/AlertContext';

function AppContent() {
  const { alerts, dismiss } = useAlert();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppNavigator />
      <AlertContainer alerts={alerts} onDismiss={dismiss} />
    </SafeAreaView>
  );
}

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AlertProvider>
        <AppContent />
      </AlertProvider>
    </SafeAreaProvider>
  );
}
