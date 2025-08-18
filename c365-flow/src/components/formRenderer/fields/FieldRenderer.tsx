import React from 'react';
import { Text, TextInput, View } from 'react-native';

interface Props {
  field: any;
  path: (string|number)[];
  formState: any;
  localContext: any;
  activeDateKey: any;
  setActiveDateKey: (k: any) => void;
  readOnly: boolean;
  error: any;
  registerFieldPosition: any;
  handleChange: (path: (string|number)[], value: any) => void;
}

function getValue(obj: any, path: (string|number)[]) {
  return path.reduce((acc, key) => (acc ? acc[key as any] : undefined), obj);
}

export function FieldRenderer({ field, path, formState, readOnly, handleChange }: Props) {
  const value = getValue(formState, path);
  if (field.type === 'text' || field.type === 'string') {
    return (
      <View style={{ marginBottom: 8 }}>
        {field.label && <Text style={{ marginBottom: 4 }}>{field.label}</Text>}
        <TextInput
          value={value ?? ''}
          editable={!readOnly}
          onChangeText={(t) => handleChange(path, t)}
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 4 }}
        />
      </View>
    );
  }
  // fallback
  return (
    <View style={{ marginBottom: 8 }}>
      {field.label && <Text style={{ marginBottom: 4 }}>{field.label}</Text>}
      <Text>{value ?? ''}</Text>
    </View>
  );
}
