import React from 'react';
import { Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import type { FieldComponentProps } from '../types';

type Props = FieldComponentProps<string> & { keyboardType?: any };

export function NumberField({ field, value, onChange, onLayout, readOnly, keyboardType }: Props) {
  return (
    <View onLayout={onLayout} style={{ marginBottom: 8 }}>
      {field.label && <Text style={{ marginBottom: 4 }}>{field.label}</Text>}
      <TextInput
        mode="outlined"
        value={value ? String(value) : ''}
        editable={!readOnly}
        onChangeText={onChange}
        keyboardType={keyboardType}
      />
    </View>
  );
}
