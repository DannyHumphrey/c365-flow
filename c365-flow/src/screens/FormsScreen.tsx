import React, { useEffect, useState } from "react";
import { View, FlatList } from "react-native";
import { List } from "react-native-paper";
import { useNetInfo } from "@react-native-community/netinfo";

import FloatingCreateFab from "../components/FloatingCreateFab";
import EmptyState from "../components/EmptyState";
import { getFormTemplatesCached } from "../offline/templatesCache";
import { createInstanceSmart } from "../offline/instanceSmart";
import { FormDefinition } from "../api/formsApi";

export default function FormsScreen({ navigation }: any) {
  const netInfo = useNetInfo();
  const online = Boolean(netInfo.isConnected);
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    getFormTemplatesCached(online).then(setTemplates);
  }, [online]);

  const handleCreate = async (tpl: FormDefinition) => {
    const res = await createInstanceSmart(
      tpl.formType || tpl.formDefinitionId,
      tpl.version,
      {},
      online
    );
    navigation.navigate('FormInstance', { id: res.id });
  };

  return (
    <View style={{ flex: 1 }}>
      {templates.length === 0 ? (
        <EmptyState message="No templates" />
      ) : (
        <>
          <FlatList
            data={templates}
            keyExtractor={(item) => String(item.id || item.formType)}
            renderItem={({ item }) => (
              <List.Item title={item.name || item.formType} />
            )}
          />
          <FloatingCreateFab templates={templates} onSelect={handleCreate} />
        </>
      )}
    </View>
  );
}
