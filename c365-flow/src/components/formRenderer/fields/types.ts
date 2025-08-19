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

export interface FieldComponentProps<T = any> {
  fieldKey: string;
  field: FormField;
  value: T;
  onChange: (value: T) => void;
  onLayout: (e: import('react-native').LayoutChangeEvent) => void;
  error?: string;
  readOnly?: boolean;
  activeDateKey: string | null;
  setActiveDateKey: React.Dispatch<React.SetStateAction<string | null>>;
}
