import React from 'react';
import { Switch, Text, View } from 'react-native';
import type { FieldComponentProps } from '../types';

export function BooleanField({ field, value, onChange, onLayout, readOnly }: FieldComponentProps<boolean>) {
  return (
    <View onLayout={onLayout} style={{ marginBottom: 8 }}>
      {field.label && <Text style={{ marginBottom: 4 }}>{field.label}</Text>}
      <Switch value={!!value} onValueChange={onChange} disabled={readOnly} />
    </View>
  );
}
