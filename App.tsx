import React from 'react';
import { Platform, UIManager } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import OnboardingOverlay from './src/components/OnboardingOverlay';
import { SettingsProvider } from './src/context/SettingsContext';
import { ToastProvider } from './src/context/ToastContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <NavigationContainer>
        <StatusBar style="dark" />
        <SettingsProvider>
          <ToastProvider>
            <RootNavigator />
            <OnboardingOverlay />
          </ToastProvider>
        </SettingsProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
