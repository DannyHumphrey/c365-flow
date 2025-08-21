export type Ref =
  | { ref: (string | number)[] }
  | { ref: ['@row', string] }
  | { ref: ['@section', string] }
  | { ref: ['@root', ...string[]] };

export type Condition =
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition }
  | { eq: [any, any] }
  | { ne: [any, any] }
  | { in: [any, any[]] }
  | { gt: [any, number] }
  | { gte: [any, number] }
  | { lt: [any, number] }
  | { lte: [any, number] }
  | { truthy: Ref }
  | { exists: Ref };

type Ctx = {
  root: any;
  section?: any;
  row?: any;
};

function isRef(x: any): x is Ref {
  return x && typeof x === 'object' && Array.isArray(x.ref);
}

function getFrom(obj: any, path: (string | number)[]) {
  let cur = obj;
  for (const k of path) {
    if (cur == null) return undefined;
    cur = cur[String(k)];
  }
  return cur;
}

function resolveRef(r: Ref, ctx: Ctx) {
  const [head, ...tail] = r.ref as any[];
  if (head === '@row') return getFrom(ctx.row, tail);
  if (head === '@section') return getFrom(ctx.section, tail);
  if (head === '@root') return getFrom(ctx.root, tail);
  return getFrom(ctx.root, r.ref as any[]);
}

function val(x: any, ctx: Ctx) {
  return isRef(x) ? resolveRef(x, ctx) : x;
}

export function evalCondition(cond: Condition | undefined, ctx: Ctx): boolean {
  if (!cond) return true;
  if ('all' in cond) return cond.all.every(c => evalCondition(c, ctx));
  if ('any' in cond) return cond.any.some(c => evalCondition(c, ctx));
  if ('not' in cond) return !evalCondition(cond.not, ctx);
  if ('eq' in cond) { const [a,b] = cond.eq; return val(a,ctx) === val(b,ctx); }
  if ('ne' in cond) { const [a,b] = cond.ne; return val(a,ctx) !== val(b,ctx); }
  if ('in' in cond) { const [a, arr] = cond.in; const v = val(a,ctx); return Array.isArray(arr) && arr.includes(v); }
  if ('gt' in cond) { const [a, n] = cond.gt; return Number(val(a,ctx)) > n; }
  if ('gte' in cond) { const [a, n] = cond.gte; return Number(val(a,ctx)) >= n; }
  if ('lt' in cond) { const [a, n] = cond.lt; return Number(val(a,ctx)) < n; }
  if ('lte' in cond) { const [a, n] = cond.lte; return Number(val(a,ctx)) <= n; }
  if ('truthy' in cond) { return !!resolveRef(cond.truthy, ctx); }
  if ('exists' in cond) { return resolveRef(cond.exists, ctx) !== undefined; }
  return true;
}

export function defaultValueForType(type: string) {
  switch (type) {
    case 'multiselect':
    case 'photo':
    case 'imageSelect': return [];
    case 'checkbox': return false;
    case 'signature': return null;
    default: return null;
  }
}
