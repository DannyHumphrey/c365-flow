import AsyncStorage from '@react-native-async-storage/async-storage';

import { apiFetch } from '../api/client';
import { K } from './keys';

export async function resolveToServerId(id: string) {
  if (id.startsWith('tmp_')) {
    const mapped = await AsyncStorage.getItem(K.IdMap(id));
    return mapped || id;
  }
  return id;
}

export async function getInstanceSmart(id: string | number, online = true) {
  const realId = await resolveToServerId(String(id));
  if (online && !realId.startsWith('tmp_')) {
    const { data, etag } = await apiFetch(`/form-instances/${realId}`);
    await AsyncStorage.setItem(
      K.InstanceMeta(realId),
      JSON.stringify({ ...data, etag })
    );
    return { ...data, etag };
  }

  const meta = await AsyncStorage.getItem(K.InstanceMeta(realId));
  const data = await AsyncStorage.getItem(K.InstanceData(realId));
  return {
    meta: meta ? JSON.parse(meta) : null,
    data: data ? JSON.parse(data) : null,
  };
}

