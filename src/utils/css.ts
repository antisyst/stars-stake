export function resolveCssVarToHex(varName?: string): string | null {
  if (!varName) return null;
  try {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();

    if (!raw) return null;

    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) return normalizeHex(raw);

    const m = raw.match(
      /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|1|0?\.\d+))?\s*\)$/
    );
    if (m) {
      const r = clamp255(parseInt(m[1], 10));
      const g = clamp255(parseInt(m[2], 10));
      const b = clamp255(parseInt(m[3], 10));
      return (
        '#' +
        [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
      ).toUpperCase();
    }

    return null;
  } catch {
    return null;
  }
}

function clamp255(n: number) { return Math.max(0, Math.min(255, n)); }

function normalizeHex(h: string) {
  const hex = h.startsWith('#') ? h.slice(1) : h;
  if (hex.length === 3) {
    const [a,b,c] = hex;
    return `#${a}${a}${b}${b}${c}${c}`.toUpperCase();
  }
  return `#${hex}`.toUpperCase();
}

export function resolveHeaderColorSpec(spec?: string): string | undefined {
  if (!spec) return undefined;
  if (spec.startsWith('--')) {
    return resolveCssVarToHex(spec) || undefined;
  }
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(spec)) return normalizeHex(spec);
  return spec;
}