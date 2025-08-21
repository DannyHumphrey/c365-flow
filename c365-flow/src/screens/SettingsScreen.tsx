import React from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';

import { useAuth } from '../auth/AuthContext';

export default function SettingsScreen() {
  const { logout } = useAuth();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <Button mode="contained" onPress={logout}>
        Logout
      </Button>
    </View>
  );
}
