import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useHardware } from '@/hooks/useHardware';
import { EmergencyAlertScreen } from '@/screens/EmergencyAlertScreen';
import { PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../theme/global.css';

const queryClient = new QueryClient();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  useHardware();

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider style={{ backgroundColor: '#0F172A' }}>
        <PaperProvider theme={MD3DarkTheme}>
          <ThemeProvider value={colorScheme === 'dark' ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: '#0F172A' } } : DefaultTheme}>
            <StatusBar style="light" />
            <Stack screenOptions={{ contentStyle: { backgroundColor: '#0F172A' } }}>
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="contacts" options={{ headerShown: false }} />
              <Stack.Screen name="history" options={{ title: 'Activity Log', headerStyle: { backgroundColor: '#0F172A' }, headerTintColor: '#fff' }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
            <EmergencyAlertScreen />
          </ThemeProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
