import React from 'react';

export function tdesktopInputShields(
  enabled: boolean
): React.InputHTMLAttributes<HTMLInputElement> {
  if (!enabled) return {};
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();
  return {
    autoComplete: 'off',
    autoCorrect: 'off' as any,
    autoCapitalize: 'off' as any,
    spellCheck: false,
    onKeyDown: stop as React.KeyboardEventHandler<HTMLInputElement>,
    onCopy: stop as React.ClipboardEventHandler<HTMLInputElement>,
    onCut: stop as React.ClipboardEventHandler<HTMLInputElement>,
    onPaste: stop as React.ClipboardEventHandler<HTMLInputElement>,
  };
}

export function tdesktopTextareaShields(
  enabled: boolean
): React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  if (!enabled) return {};
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();
  return {
    autoComplete: 'off',
    autoCorrect: 'off' as any,
    autoCapitalize: 'off' as any,
    spellCheck: false,
    onKeyDown: stop as React.KeyboardEventHandler<HTMLTextAreaElement>,
    onCopy: stop as React.ClipboardEventHandler<HTMLTextAreaElement>,
    onCut: stop as React.ClipboardEventHandler<HTMLTextAreaElement>,
    onPaste: stop as React.ClipboardEventHandler<HTMLTextAreaElement>,
  };
}