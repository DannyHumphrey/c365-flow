import { v4 as uuidv4 } from "uuid";

import { apiFetch } from "./client";

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
  const r = await apiFetch<FormDefinition[]>("/api/formTemplates");
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
