import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';

import Navigation from './navigation';
import { AuthProvider } from '../auth/AuthContext';
import { useOfflineSync } from '../offline/useOfflineSync';

function RootNavigator() {
  useOfflineSync();
  return <Navigation />;
}

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}

