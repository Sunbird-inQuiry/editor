/**
 * ContentEditable — a styled div[contenteditable] that participates in the
 * shared SharedRichToolbar. When focused, toolbar commands apply here.
 * Clicking on an inserted <table> or <img> shows a floating delete toolbar.
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

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

// ---------------------------------------------------------------------------
// Floating delete toolbar for tables and images
// ---------------------------------------------------------------------------
interface FloatingToolbarProps {
  target: HTMLElement;
  onDelete: () => void;
  onClose: () => void;
}

function FloatingToolbar({ target, onDelete, onClose }: FloatingToolbarProps) {
  const rect = target.getBoundingClientRect();
  const isTable = target.tagName === 'TABLE';

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (!target.contains(el) && !(el.closest('[data-float-toolbar]'))) {
        onClose();
      }
    };
    const t = setTimeout(() => document.addEventListener('mousedown', h), 100);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', h); };
  }, [target, onClose]);

  return createPortal(
    <div
      data-float-toolbar="true"
      style={{
        position: 'fixed',
        top: Math.max(4, rect.top - 38),
        left: rect.left,
        zIndex: 9990,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: '#fff',
        border: '1px solid var(--sb-border)',
        borderRadius: 8,
        boxShadow: 'var(--sb-shadow-deep)',
        padding: '4px 8px',
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--sb-text-2)',
      }}
    >
      <span style={{ marginRight: 4 }}>{isTable ? 'Table' : 'Image'}</span>
      <button
        type="button"
        onMouseDown={e => { e.preventDefault(); onDelete(); }}
        title="Delete"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 8px', borderRadius: 6, border: '1px solid var(--sb-red-border)',
          background: '#fff', color: 'var(--sb-red)', cursor: 'pointer', fontSize: 12, fontWeight: 700,
        }}
      >
        <Icon name="trash" size={13} /> Delete
      </button>
    </div>,
    document.body,
  );
}

// ---------------------------------------------------------------------------
// ContentEditable
// ---------------------------------------------------------------------------
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

  const [floatTarget, setFloatTarget] = useState<HTMLElement | null>(null);

  // Seed content once on mount
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value
  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.innerHTML !== value) ref.current.innerHTML = value;
    // Clear float toolbar when value resets
    setFloatTarget(null);
  }, [value]);

  // Click handler: detect table/image clicks
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    const target = e.target as HTMLElement;
    const img = target.tagName === 'IMG' ? target : null;
    const table = target.closest('table') as HTMLElement | null;
    if (img) { setFloatTarget(img); return; }
    if (table) { setFloatTarget(table); return; }
    // Click outside any table/img — close toolbar
    setFloatTarget(null);
  }, [disabled]);

  const handleDelete = useCallback(() => {
    if (!floatTarget || !ref.current) return;
    floatTarget.remove();
    setFloatTarget(null);
    onChangeRef.current?.(ref.current.innerHTML);
  }, [floatTarget]);

  return (
    <>
      <div
        ref={ref}
        className={`re-body ${bodyClass}`}
        contentEditable={!disabled}
        suppressContentEditableWarning
        spellCheck={false}
        data-ph={placeholder}
        style={{
          ...(minHeight ? { minHeight } : {}),
          // Highlight tables and images on hover for discoverability
        }}
        onInput={() => onChangeRef.current?.(ref.current?.innerHTML ?? '')}
        onClick={handleClick}
        onKeyDown={e => {
          if (inline && e.key === 'Enter') { e.preventDefault(); (e.currentTarget as HTMLDivElement).blur(); }
        }}
      />
      {floatTarget && (
        <FloatingToolbar
          target={floatTarget}
          onDelete={handleDelete}
          onClose={() => setFloatTarget(null)}
        />
      )}
    </>
  );
}
