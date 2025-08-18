import AsyncStorage from '@react-native-async-storage/async-storage';
import { getInstance } from '../api/formsApi';
import { K } from './keys';

export async function resolveToServerId(id: string | number) {
  return id;
}

export async function getInstanceSmart(id: string | number) {
  try {
    if (typeof id === 'number' || (typeof id === 'string' && !id.startsWith('tmp_'))) {
      const res = await getInstance(id);
      await AsyncStorage.setItem(
        K.InstanceMeta(id),
        JSON.stringify({
          id: res.formInstanceId ?? id,
          formDefinitionId: res.formDefinitionId,
          currentState: res.currentState,
          version: res.version,
          etag: res.etag,
        })
      );
      await AsyncStorage.setItem(K.InstanceData(id), JSON.stringify(res.data));
      return res;
    }
  } catch {}
  const [metaRaw, dataRaw] = await Promise.all([
    AsyncStorage.getItem(K.InstanceMeta(id)),
    AsyncStorage.getItem(K.InstanceData(id)),
  ]);
  const meta = metaRaw ? JSON.parse(metaRaw) : null;
  const data = dataRaw ? JSON.parse(dataRaw) : {};
  if (!meta) throw new Error('Instance not available offline');
  return {
    formInstanceId: meta.id,
    formDefinitionId: meta.formDefinitionId ?? null,
    currentState: meta.currentState,
    version: meta.version,
    data,
    etag: meta.etag,
  };
}
