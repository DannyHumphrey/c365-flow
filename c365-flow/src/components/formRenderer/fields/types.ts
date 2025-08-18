export type FormField = {
  key: string;
  type: string;
  label?: string;
  repeatable?: boolean;
  useModal?: boolean;
  fields?: FormField[];
  [key: string]: any;
};

export interface FormSection {
  key: string;
  label: string;
  repeatable?: boolean;
  useModal?: boolean;
  fields: FormField[];
}
