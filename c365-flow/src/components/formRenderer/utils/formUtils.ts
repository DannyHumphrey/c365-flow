export function getNestedValue(obj: any, path: (string|number)[]) {
  return path.reduce((acc, key) => (acc == null ? undefined : acc[key as any]), obj);
}

export function evaluateVisibleWhen(
  visibleWhen: any,
  formState: Record<string, any>,
  localContext?: Record<string, any>
): boolean {
  if (!visibleWhen) return true;
  try {
    if (typeof visibleWhen === 'function') {
      return visibleWhen(formState, localContext);
    }
    if (visibleWhen.path && 'equals' in visibleWhen) {
      const value = getNestedValue(formState, String(visibleWhen.path).split('.'));
      return value === visibleWhen.equals;
    }
  } catch {
    // ignore errors and assume visible
  }
  return true;
}
