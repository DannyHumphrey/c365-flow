import React, { useState, useEffect } from 'react';
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

export function MultiSelectField({ field, value, onChange, onLayout, readOnly }: FieldComponentProps<string[]>) {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<string[]>(Array.isArray(value) ? value : []);

  useEffect(() => {
    setSelected(Array.isArray(value) ? value : []);
  }, [value]);

  const toggleOption = (option: string) => {
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const confirm = () => {
    onChange(selected);
    setVisible(false);
  };

  const open = () => {
    if (!readOnly) setVisible(true);
  };

  const display = selected.join(', ');

  return (
    <View onLayout={onLayout} style={{ marginBottom: 8 }}>
      {field.label && <Text style={{ marginBottom: 4 }}>{field.label}</Text>}
      <TouchableOpacity
        onPress={open}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 4 }}
        disabled={readOnly}
      >
        <Text>{display || 'Select...'}</Text>
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
                  field.options.map((opt: string) => {
                    const checked = selected.includes(opt);
                    return (
                      <TouchableOpacity
                        key={opt}
                        onPress={() => toggleOption(opt)}
                        style={{ padding: 8, flexDirection: 'row', alignItems: 'center' }}
                      >
                        <Text style={{ marginRight: 8 }}>{checked ? '☑' : '☐'}</Text>
                        <Text>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
              <Button title="Done" onPress={confirm} />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}
