import React from 'react';
import { Text, View } from 'react-native';
import type { FieldComponentProps } from '../types';

export function PhotoField({ field, value, onLayout }: FieldComponentProps<string[]>) {
  const count = Array.isArray(value) ? value.length : 0;
  return (
    <View onLayout={onLayout} style={{ marginBottom: 8 }}>
      {field.label && <Text style={{ marginBottom: 4 }}>{field.label}</Text>}
      <Text>{`${count} photo(s)`}</Text>
    </View>
  );
}
