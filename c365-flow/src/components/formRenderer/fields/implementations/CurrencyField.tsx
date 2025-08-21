import React from 'react';
import { Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import type { FieldComponentProps } from '../types';

export function CurrencyField({ field, value, onChange, onLayout, readOnly }: FieldComponentProps<string>) {
  return (
    <View onLayout={onLayout} style={{ marginBottom: 8 }}>
      {field.label && <Text style={{ marginBottom: 4 }}>{field.label}</Text>}
      <TextInput
        mode="outlined"
        value={value ? String(value) : ''}
        editable={!readOnly}
        onChangeText={onChange}
        keyboardType="decimal-pad"
      />
    </View>
  );
}
