import React from 'react';
import { Text, View } from 'react-native';
import type { FieldComponentProps } from '../types';

export function ImageSelectField({ field, value, onLayout }: FieldComponentProps<string>) {
  return (
    <View onLayout={onLayout} style={{ marginBottom: 8 }}>
      {field.label && <Text style={{ marginBottom: 4 }}>{field.label}</Text>}
      <Text>{value ? '1 image selected' : 'No image selected'}</Text>
    </View>
  );
}
