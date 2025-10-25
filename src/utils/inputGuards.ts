import React from 'react';

export function inputNoSelectGuards(): React.InputHTMLAttributes<HTMLInputElement> {
  const collapse = (el: HTMLInputElement) => {
    const pos = el.value.length;
    try { el.setSelectionRange(pos, pos); } catch {}
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      e.stopPropagation();
      collapse(e.currentTarget);
    }
  };

  const onDoubleClick: React.MouseEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    collapse(e.currentTarget as HTMLInputElement);
  };

  const onSelect: React.ReactEventHandler<HTMLInputElement> = (e) => {
    const el = e.currentTarget;
    if (el.selectionStart !== el.selectionEnd) collapse(el);
  };

  return { onKeyDown, onDoubleClick, onSelect };
}

export function composeInputProps(
  ...parts: Array<React.InputHTMLAttributes<HTMLInputElement>>
): React.InputHTMLAttributes<HTMLInputElement> {
  const out: React.InputHTMLAttributes<HTMLInputElement> = {};

  const chain = <K extends keyof React.InputHTMLAttributes<HTMLInputElement>>(key: K, fn?: any) => {
    const prev = out[key] as any;
    if (prev && fn) {
      out[key] = ((...args: any[]) => { prev(...args); fn(...args); }) as any;
    } else if (fn) {
      out[key] = fn;
    }
  };

  const handlerKeys: Array<keyof React.InputHTMLAttributes<HTMLInputElement>> = [
    'onKeyDown', 'onKeyUp', 'onKeyPress',
    'onDoubleClick', 'onClick',
    'onSelect',
    'onCopy', 'onCut', 'onPaste',
    'onFocus', 'onBlur', 'onChange',
  ];

  for (const p of parts) {
    for (const k of handlerKeys) {
      if (p[k]) chain(k, p[k]);
    }
    for (const [k, v] of Object.entries(p)) {
      const key = k as keyof React.InputHTMLAttributes<HTMLInputElement>;
      if (!handlerKeys.includes(key)) (out as any)[key] = v;
    }
  }

  return out;
}