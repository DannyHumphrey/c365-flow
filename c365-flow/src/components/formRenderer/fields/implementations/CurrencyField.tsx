import React from 'react';
import { Text, TextInput, View } from 'react-native';
import type { FieldComponentProps } from '../types';

export function CurrencyField({ field, value, onChange, onLayout, readOnly }: FieldComponentProps<string>) {
  return (
    <View onLayout={onLayout} style={{ marginBottom: 8 }}>
      {field.label && <Text style={{ marginBottom: 4 }}>{field.label}</Text>}
      <TextInput
        value={value ? String(value) : ''}
        editable={!readOnly}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 4 }}
      />
    </View>
  );
}
