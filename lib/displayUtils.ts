/**
 * Ensures a value is safe to render as text (avoids "[object Object]" when APIs return objects).
 */
export function toDisplayString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(toDisplayString).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    const o = value as Record<string, unknown>;
    const s = o.text ?? o.title ?? o.body ?? o.reference ?? o.key_verse ?? '';
    return s != null ? toDisplayString(s) : '';
  }
  return String(value);
}
