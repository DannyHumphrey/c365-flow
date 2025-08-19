import React from 'react';
import { Text, TextInput, View } from 'react-native';
import type { FieldComponentProps } from '../types';

export function MultiSelectField({ field, value, onChange, onLayout, readOnly }: FieldComponentProps<string[]>) {
  const joined = Array.isArray(value) ? value.join(', ') : '';
  return (
    <View onLayout={onLayout} style={{ marginBottom: 8 }}>
      {field.label && <Text style={{ marginBottom: 4 }}>{field.label}</Text>}
      <TextInput
        value={joined}
        editable={!readOnly}
        onChangeText={(t) => onChange(t.split(',').map(s => s.trim()))}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 4 }}
      />
    </View>
  );
}
