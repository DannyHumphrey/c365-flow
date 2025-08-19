import React from 'react';
import { Text, View } from 'react-native';
import type { FieldComponentProps } from '../types';

export function SignatureField({ field, value, onLayout }: FieldComponentProps<string | null>) {
  return (
    <View onLayout={onLayout} style={{ marginBottom: 8 }}>
      {field.label && <Text style={{ marginBottom: 4 }}>{field.label}</Text>}
      <Text>{value ? 'Signature captured' : 'No signature'}</Text>
    </View>
  );
}
