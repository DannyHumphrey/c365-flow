export function getNestedValue(obj: any, path: (string|number)[]) {
  return path.reduce((acc, key) => (acc == null ? undefined : acc[key as any]), obj);
}
