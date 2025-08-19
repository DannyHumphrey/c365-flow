import React from 'react';
import { Text, TextInput, View } from 'react-native';
import type { FieldComponentProps } from '../types';

type Props = FieldComponentProps<string> & { keyboardType?: any };

export function NumberField({ field, value, onChange, onLayout, readOnly, keyboardType }: Props) {
  return (
    <View onLayout={onLayout} style={{ marginBottom: 8 }}>
      {field.label && <Text style={{ marginBottom: 4 }}>{field.label}</Text>}
      <TextInput
        value={value ? String(value) : ''}
        editable={!readOnly}
        onChangeText={onChange}
        keyboardType={keyboardType}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 4 }}
      />
    </View>
  );
}
