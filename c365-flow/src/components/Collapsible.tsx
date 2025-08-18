import React, { PropsWithChildren } from 'react';
import { Pressable, Text, View } from 'react-native';

interface Props {
  title: string;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  hasError?: boolean;
  onLayout?: () => void;
}

export function Collapsible({ title, isOpen, onToggle, children, onLayout }: PropsWithChildren<Props>) {
  return (
    <View onLayout={onLayout} style={{ marginBottom: 12 }}>
      <Pressable onPress={() => onToggle(!isOpen)} style={{ padding: 8, backgroundColor: '#eee' }}>
        <Text>{title}</Text>
      </Pressable>
      {isOpen && <View style={{ padding: 8 }}>{children}</View>}
    </View>
  );
}
