import { v4 as uuidv4 } from 'uuid';

import { apiFetch } from './client';

export function getFormTemplates() {
  return apiFetch<any[]>('/FormTemplates').then(r => r.data);
}

export async function createInstance(
  formType: string,
  formVersion?: number,
  initialData?: any,
  idempotencyKey?: string
) {
  const key = idempotencyKey ?? uuidv4();
  const { data, etag } = await apiFetch<{
    formInstanceId: number;
    formDefinitionId: string;
    currentState: any;
    version: number;
  }>('/form-instances', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': key,
    },
    body: JSON.stringify({
      formType,
      version: formVersion,
      initialData,
      clientGeneratedId: key,
    }),
  });

  return { ...data, etag, idempotencyKey: key };
}

