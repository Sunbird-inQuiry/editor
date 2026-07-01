/**
 * ContentEditable — a styled div[contenteditable] that participates in the
 * shared SharedRichToolbar. When focused, toolbar commands apply here.
 */
import React, { useRef, useEffect } from 'react';

export interface ContentEditableProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Inline mode: Enter blurs instead of inserting newline */
  inline?: boolean;
  minHeight?: number;
  /** Extra className appended to .re-body */
  bodyClass?: string;
}

export default function ContentEditable({
  value = '',
  onChange,
  placeholder = '',
  disabled = false,
  inline = false,
  minHeight,
  bodyClass = '',
}: ContentEditableProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Seed content once on mount
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value when it changes (e.g. store reset)
  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.innerHTML !== value) ref.current.innerHTML = value;
  }, [value]);

  return (
    <div
      ref={ref}
      className={`re-body ${bodyClass}`}
      contentEditable={!disabled}
      suppressContentEditableWarning
      spellCheck={false}
      data-ph={placeholder}
      style={minHeight ? { minHeight } : undefined}
      onInput={() => onChangeRef.current?.(ref.current?.innerHTML ?? '')}
      onKeyDown={e => {
        if (inline && e.key === 'Enter') { e.preventDefault(); (e.currentTarget as HTMLDivElement).blur(); }
      }}
    />
  );
}
