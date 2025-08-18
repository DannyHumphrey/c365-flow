import { useCallback, useEffect, useRef } from 'react';

const escapePtr = (s: string) => s.replace(/~/g, '~0').replace(/\//g, '~1');
export const ptrFromPath = (path: (string|number)[]) => '/' + path.map(p => escapePtr(String(p))).join('/');

type Entry = { timer: any; ops: Map<string, any> };

export function useSectionPatchBuffer(opts: {
  debounceMs?: number;
  onFlush: (sectionKey: string, patch: {op:'add'; path:string; value:any}[]) => Promise<void>;
}) {
  const { debounceMs = 500, onFlush } = opts;
  const pendingRef = useRef<Map<string, Entry>>(new Map());

  const flushSection = useCallback(async (sectionKey: string) => {
    const entry = pendingRef.current.get(sectionKey);
    if (!entry || entry.ops.size === 0) return;
    if (entry.timer) clearTimeout(entry.timer);
    pendingRef.current.delete(sectionKey);
    const patch = Array.from(entry.ops.entries()).map(([path, value]) => ({ op: 'add' as const, path, value }));
    await onFlush(sectionKey, patch);
  }, [onFlush]);

  const flushAll = useCallback(async () => {
    const keys = Array.from(pendingRef.current.keys());
    for (const k of keys) await flushSection(k);
  }, [flushSection]);

  const schedule = useCallback((sectionKey: string, path: (string|number)[], value: any) => {
    const ptr = ptrFromPath(path);
    let entry = pendingRef.current.get(sectionKey);
    if (!entry) { entry = { timer: null, ops: new Map() }; pendingRef.current.set(sectionKey, entry); }
    entry.ops.set(ptr, value);
    if (entry.timer) clearTimeout(entry.timer);
    entry.timer = setTimeout(() => { flushSection(sectionKey).catch(()=>{}); }, debounceMs);
  }, [flushSection, debounceMs]);

  useEffect(() => () => {
    // cleanup timers on unmount
    pendingRef.current.forEach(e => e.timer && clearTimeout(e.timer));
  }, []);

  return { schedule, flushSection, flushAll };
}
