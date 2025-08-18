import React, { useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import { List } from 'react-native-paper';
import { useNetInfo } from '@react-native-community/netinfo';

import FloatingCreateFab from '../components/FloatingCreateFab';
import EmptyState from '../components/EmptyState';
import { getFormTemplatesCached } from '../offline/templatesCache';
import { createInstanceSmart } from '../offline/instanceSmart';

export default function FormsScreen() {
  const netInfo = useNetInfo();
  const online = Boolean(netInfo.isConnected);
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    getFormTemplatesCached(online).then(setTemplates);
  }, [online]);

  const handleCreate = async (tpl: any) => {
    await createInstanceSmart(tpl.formType || tpl.id, tpl.version, {}, online);
  };

  return (
    <View style={{ flex: 1 }}>
      {templates.length === 0 ? (
        <EmptyState message="No templates" />
      ) : (
        <FlatList
          data={templates}
          keyExtractor={item => String(item.id || item.formType)}
          renderItem={({ item }) => <List.Item title={item.name || item.formType} />}
        />
      )}
      <FloatingCreateFab templates={templates} onSelect={handleCreate} />
    </View>
  );
}

