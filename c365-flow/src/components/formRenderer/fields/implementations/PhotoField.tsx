import React from 'react';
import { Image, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import type { FieldComponentProps } from '../types';

export function PhotoField({ field, value, onChange, onLayout, readOnly }: FieldComponentProps<string[]>) {
  const current = Array.isArray(value) ? value : [];

  const pick = async () => {
    if (readOnly) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: (field as any).max ?? 10,
      quality: 0.8,
    });
    if (!res.canceled) {
      const uris = res.assets.map(a => a.uri);
      onChange([...(current || []), ...uris]);
    }
  };

  const removeAt = (idx: number) => {
    const next = current.slice();
    next.splice(idx, 1);
    onChange(next);
  };

  return (
    <View onLayout={onLayout} style={{ marginBottom: 8 }}>
      {field.label && <Text style={{ marginBottom: 4 }}>{field.label}</Text>}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {current.map((uri, idx) => (
          <View key={uri} style={{ width: 96, height: 96, borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
            <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
            {!readOnly && (
              <IconButton
                icon="close"
                size={16}
                style={{ position: 'absolute', top: -8, right: -8 }}
                onPress={() => removeAt(idx)}
              />
            )}
          </View>
        ))}
        {!readOnly && (
          <Button icon="image-plus" mode="outlined" onPress={pick}>
            Add photo
          </Button>
        )}
      </View>
    </View>
  );
}
