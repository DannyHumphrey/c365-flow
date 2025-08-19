import { apiFetch } from "./client";
import { v4 as uuidv4 } from "uuid";

export interface FormDefinition {
  formDefinitionId: string; // "6"
  formType: string; // "HC-One Helpdesk Job"
  name: string; // "HC-One Helpdesk Job"
  schema: FormSection[]; // Array of sections/fields
  ui: unknown | null; // Placeholder for UI config (null for now)
  version: number; // 6
  workflow: WorkflowConfig; // Workflow metadata
}

export interface FormSection {
  key: string; // e.g. "survey_overview"
  type: string; // e.g. "section"
  label: string; // e.g. "Survey Overview"
  [key: string]: any; // Allow extra dynamic fields in schema
}

export interface WorkflowConfig {
  creatorRoles: string[]; // e.g. ["Assessor"]
  [key: string]: any; // Extendable for additional workflow fields
}

export const getFormTemplates = async () => {
  const r = await apiFetch<FormDefinition[]>("/formTemplates");
  return r.data;
};

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
  }>("/form-instances", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": key,
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

export async function getInstance(id: string | number) {
  const { data, etag } = await apiFetch(`/form-instances/${id}`);
  return { ...data, etag };
}

export async function saveSection({
  id,
  sectionKey,
  patch,
  etag,
  idempotencyKey,
}: {
  id: string | number;
  sectionKey: string;
  patch: any[];
  etag?: string;
  idempotencyKey?: string;
}) {
  const { data, etag: newEtag } = await apiFetch(
    `/form-instances/${id}/sections/${sectionKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(etag ? { "If-Match": etag } : {}),
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: JSON.stringify({ patch: patch }),
    }
  );
  return { ...data, etag: newEtag };
}

export async function transitionInstance({
  id,
  transitionKey,
  etag,
}: {
  id: string | number;
  transitionKey: string;
  etag?: string;
}) {
  const { data, etag: newEtag } = await apiFetch(
    `/form-instances/${id}/transitions/${transitionKey}`,
    {
      method: "POST",
      headers: {
        ...(etag ? { "If-Match": etag } : {}),
      },
    }
  );
  return { ...data, etag: newEtag };
}
