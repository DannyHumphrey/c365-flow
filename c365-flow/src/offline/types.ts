export interface LocalInstanceMeta {
  id: string;
  formType: string;
  version: number;
  currentState: any;
  etag?: string;
}

export interface CreateJob {
  tmpId: string;
  formType: string;
  version?: number;
  initialData?: any;
  idempotencyKey: string;
}

