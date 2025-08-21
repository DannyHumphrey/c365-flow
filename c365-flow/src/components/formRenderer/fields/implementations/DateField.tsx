import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { FieldComponentProps } from '../types';

export function DateField({ field, value, onChange, onLayout, readOnly }: FieldComponentProps<string>) {
  const [open, setOpen] = useState(false);
  const date = value ? new Date(value) : new Date();

  return (
    <View onLayout={onLayout} style={{ marginBottom: 8 }}>
      {field.label && <Text style={{ marginBottom: 4 }}>{field.label}</Text>}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          mode="outlined"
          value={value ? new Date(value).toLocaleDateString() : ''}
          editable={false}
          style={{ flex: 1 }}
        />
        <Button mode="outlined" onPress={() => !readOnly && setOpen(true)} disabled={readOnly}>
          Pick
        </Button>
      </View>
      {open && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.select({ ios: 'spinner', android: 'default' })}
          onChange={(_, d) => {
            setOpen(false);
            if (d) onChange(d.toISOString());
          }}
        />
      )}
    </View>
  );
}
