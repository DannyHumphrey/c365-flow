import { evalCondition } from './conditions';
import type { FormSection } from '../fields/types';
import { getNestedValue } from '../utils/formUtils';

function isEmpty(val: any, type: string) {
  if (val === undefined || val === null) return true;
  if (type === 'multiselect' || type === 'photo' || type === 'imageSelect') return !Array.isArray(val) || val.length === 0;
  if (type === 'text') return String(val).trim() === '';
  return false;
}

export function collectRequiredMissing(schema: FormSection[], data: any, editableSections: string[]) {
  const errors: string[] = [];
  const walk = (section: FormSection, basePath: (string|number)[], row: any) => {
    const ctx = { root: data, section: row, row };
    const visibleSec = evalCondition((section as any).visibleWhen, ctx);
    if (!visibleSec) return;
    const sectionKey = String(basePath[0]);
    const sectionEditable = editableSections.includes(sectionKey);

    if (section.repeatable) {
      const entries = getNestedValue(data, basePath) ?? [];
      entries.forEach((r: any, idx: number) => {
        section.fields.forEach((f: any) => {
          if (f.type === 'section') return walk(f, [...basePath, idx, f.key], r);
          const vctx = { root: data, section: r, row: r };
          const visible = evalCondition(f.visibleWhen, vctx);
          if (!visible) return;
          const required = f.required === true || evalCondition(f.requiredWhen, vctx);
          if (!sectionEditable || !required) return;
          const val = getNestedValue(data, [...basePath, idx, f.key]);
          if (isEmpty(val, f.type)) errors.push(`${section.label} #${idx+1} → ${f.label}`);
        });
      });
      return;
    }

    const rowObj = getNestedValue(data, basePath) ?? {};
    section.fields.forEach((f: any) => {
      if (f.type === 'section') return walk(f, [...basePath, f.key], rowObj);
      const vctx = { root: data, section: rowObj, row: rowObj };
      const visible = evalCondition(f.visibleWhen, vctx);
      if (!visible) return;
      const required = f.required === true || evalCondition(f.requiredWhen, vctx);
      if (!sectionEditable || !required) return;
      const val = getNestedValue(data, [...basePath, f.key]);
      if (isEmpty(val, f.type)) errors.push(`${section.label} → ${f.label}`);
    });
  };

  schema.forEach(s => walk(s, [s.key], getNestedValue(data, [s.key]) ?? {}));
  return errors;
}
