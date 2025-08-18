import AsyncStorage from '@react-native-async-storage/async-storage';

import { createInstance } from '../api/formsApi';
import { apiFetch } from '../api/client';
import { K } from './keys';
import { CreateJob } from './types';
import { resolveToServerId } from './getInstanceSmart';

/**
 * Performs a single sync pass for queued operations.
 * This is a simplified engine that handles create jobs and queued patches.
 */
export async function syncOnce() {
  // Drain create queue
  const createRaw = await AsyncStorage.getItem(K.CreateQueue);
  const createQueue: CreateJob[] = createRaw ? JSON.parse(createRaw) : [];
  const remainingCreates: CreateJob[] = [];
  for (const job of createQueue) {
    try {
      const res = await createInstance(
        job.formType,
        job.version,
        job.initialData,
        job.idempotencyKey
      );
      const serverId = String(res.formInstanceId);
      await AsyncStorage.setItem(K.IdMap(job.tmpId), serverId);
      const meta = await AsyncStorage.getItem(K.InstanceMeta(job.tmpId));
      if (meta) {
        await AsyncStorage.setItem(K.InstanceMeta(serverId), meta);
        await AsyncStorage.removeItem(K.InstanceMeta(job.tmpId));
      }
      const data = await AsyncStorage.getItem(K.InstanceData(job.tmpId));
      if (data) {
        await AsyncStorage.setItem(K.InstanceData(serverId), data);
        await AsyncStorage.removeItem(K.InstanceData(job.tmpId));
      }
      const patches = await AsyncStorage.getItem(K.PatchQueue(job.tmpId));
      if (patches) {
        await AsyncStorage.setItem(K.PatchQueue(serverId), patches);
        await AsyncStorage.removeItem(K.PatchQueue(job.tmpId));
      }
    } catch (e) {
      console.warn('create sync failed', e);
      remainingCreates.push(job);
    }
  }
  await AsyncStorage.setItem(K.CreateQueue, JSON.stringify(remainingCreates));

  // Drain patch queues
  const allKeys = await AsyncStorage.getAllKeys();
  const patchKeys = allKeys.filter(k => k.startsWith('queue:form:'));
  for (const key of patchKeys) {
    const id = key.replace('queue:form:', '');
    const serverId = await resolveToServerId(id);
    if (serverId.startsWith('tmp_')) continue;
    const patchesRaw = await AsyncStorage.getItem(key);
    const patches: any[] = patchesRaw ? JSON.parse(patchesRaw) : [];
    let etag = undefined;
    const metaRaw = await AsyncStorage.getItem(K.InstanceMeta(serverId));
    if (metaRaw) {
      try {
        etag = JSON.parse(metaRaw).etag;
      } catch {}
    }
    const remaining: any[] = [];
    for (const patch of patches) {
      try {
        const { etag: newEtag } = await apiFetch(`/form-instances/${serverId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(etag ? { 'If-Match': etag } : {}),
          },
          body: JSON.stringify(patch),
        });
        etag = newEtag || etag;
      } catch {
        remaining.push(patch);
      }
    }
    if (remaining.length) {
      await AsyncStorage.setItem(key, JSON.stringify(remaining));
    } else {
      await AsyncStorage.removeItem(key);
    }
  }
}

