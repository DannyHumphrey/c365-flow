import React, { useState } from 'react';
import {
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Button,
} from 'react-native';
import type { FieldComponentProps } from '../types';
import { styles } from '../../styles';

export function SelectField({ field, value, onChange, onLayout, readOnly }: FieldComponentProps<string>) {
  const [visible, setVisible] = useState(false);

  const open = () => {
    if (!readOnly) setVisible(true);
  };

  const handleSelect = (option: string) => {
    onChange(option);
    setVisible(false);
  };

  return (
    <View onLayout={onLayout} style={{ marginBottom: 8 }}>
      {field.label && <Text style={{ marginBottom: 4 }}>{field.label}</Text>}
      <TouchableOpacity
        onPress={open}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 4 }}
        disabled={readOnly}
      >
        <Text>{value ?? 'Select...'}</Text>
      </TouchableOpacity>
      {visible && (
        <Modal transparent visible onRequestClose={() => setVisible(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setVisible(false)}
          >
            <View style={styles.modalContent}>
              <ScrollView>
                {Array.isArray(field.options) &&
                  field.options.map((opt: string) => (
                    <Button key={opt} title={opt} onPress={() => handleSelect(opt)} />
                  ))}
              </ScrollView>
              <Button title="Close" onPress={() => setVisible(false)} />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}
