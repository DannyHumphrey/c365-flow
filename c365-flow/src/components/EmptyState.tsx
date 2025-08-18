import React from 'react';
import { View, Text } from 'react-native';

export default function EmptyState({ message }: { message: string }) {
  return (
    <View
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}
    >
      <Text>{message}</Text>
    </View>
  );
}

