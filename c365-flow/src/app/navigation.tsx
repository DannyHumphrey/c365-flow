import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../auth/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import FormsScreen from '../screens/FormsScreen';
import FormInstanceScreen from '../screens/FormInstanceScreen';

export type RootStackParamList = {
  Login: undefined;
  Forms: undefined;
  FormInstance: { id: string | number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  const { token } = useAuth();

  return (
    <Stack.Navigator>
      {token ? (
        <><Stack.Screen name="Forms" component={FormsScreen} />
        <Stack.Screen name="FormInstance" component={FormInstanceScreen} />
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

