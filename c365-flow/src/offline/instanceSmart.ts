import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";

import { createInstance } from "../api/formsApi";
import { K } from "./keys";
import { CreateJob, LocalInstanceMeta } from "./types";
import { getFormTemplatesCached } from "./templatesCache";

export async function createInstanceSmart(
  formType: string,
  formVersion?: number,
  initialData?: any,
  online = true
) {
  if (online) {
    debugger;
    const res = await createInstance(formType, formVersion, initialData);
    const id = String(res.formInstanceId);
    const meta: LocalInstanceMeta = {
      id,
      formType,
      version: res.version,
      currentState: res.currentState,
      etag: res.etag,
    };
    await AsyncStorage.setItem(K.InstanceMeta(id), JSON.stringify(meta));
    if (initialData) {
      await AsyncStorage.setItem(
        K.InstanceData(id),
        JSON.stringify(initialData)
      );
    }
    return { id, etag: res.etag };
  }

  const tmpId = `tmp_${uuidv4()}`;
  const templates = await getFormTemplatesCached(false);
  const template = templates.find((t: any) => t.formType === formType);
  const meta: LocalInstanceMeta = {
    id: tmpId,
    formType,
    version: formVersion || template?.version || 1,
    currentState: template?.initialState || {},
  };
  await AsyncStorage.setItem(K.InstanceMeta(tmpId), JSON.stringify(meta));
  if (initialData) {
    await AsyncStorage.setItem(
      K.InstanceData(tmpId),
      JSON.stringify(initialData)
    );
  }

  const job: CreateJob = {
    tmpId,
    formType,
    version: meta.version,
    initialData,
    idempotencyKey: uuidv4(),
  };
  const qRaw = await AsyncStorage.getItem(K.CreateQueue);
  const queue: CreateJob[] = qRaw ? JSON.parse(qRaw) : [];
  queue.push(job);
  await AsyncStorage.setItem(K.CreateQueue, JSON.stringify(queue));
  await AsyncStorage.setItem(K.PatchQueue(tmpId), JSON.stringify([]));

  return { id: tmpId, etag: "local" };
}
