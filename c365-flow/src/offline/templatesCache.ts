import AsyncStorage from '@react-native-async-storage/async-storage';

import { getFormTemplates } from '../api/formsApi';
import { K } from './keys';

export async function getFormTemplatesCached(online: boolean) {
  if (online) {
    const templates = await getFormTemplates();
    await AsyncStorage.setItem(K.Templates, JSON.stringify(templates));
    return templates;
  }

  const cached = await AsyncStorage.getItem(K.Templates);
  return cached ? JSON.parse(cached) : [];
}

