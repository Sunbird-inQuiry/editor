/**
 * CKEditorField — React wrapper around @project-sunbird/ckeditor-build-classic.
 * Uses the same editor and toolbar as the Angular-based questionset editor.
 */
import React, { useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const ClassicEditor: any;

export interface CKEditorFieldProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
  compact?: boolean;
}

// Toolbar matching the Angular ckeditor-tool component
const FULL_TOOLBAR = [
  'bold', '|', 'italic', '|', 'underline', '|',
  'BulletedList', '|', 'numberedList', '|',
  'alignment', '|',
  'fontSize', '|',
  'subscript', '|', 'superscript', '|',
  'MathText', '|',
  'specialCharacters', '|',
  'insertTable', '|',
  'imageUpload',
];

const COMPACT_TOOLBAR = ['bold', 'italic', 'underline', 'imageUpload'];

export default function CKEditorField({
  value = '',
  onChange,
  placeholder = 'Type here…',
  disabled = false,
  minHeight = 100,
  compact = false,
}: CKEditorFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef   = useRef<unknown>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;

    // CKEditor is loaded as a UMD global via the Vite config
    const CK = (window as unknown as Record<string, unknown>).ClassicEditor as typeof ClassicEditor;
    if (!CK) {
      console.error('[CKEditorField] ClassicEditor not found on window. Make sure it is loaded.');
      return;
    }

    CK.create(containerRef.current, {
      toolbar: compact ? COMPACT_TOOLBAR : FULL_TOOLBAR,
      placeholder,
      initialData: value,
    })
      .then((editor: unknown) => {
        if (destroyed) {
          (editor as { destroy: () => Promise<void> }).destroy();
          return;
        }
        editorRef.current = editor;
        const ed = editor as {
          isReadOnly: boolean;
          model: { document: { on: (ev: string, fn: () => void) => void } };
          getData: () => string;
          setData: (v: string) => void;
        };

        ed.isReadOnly = disabled;

        ed.model.document.on('change:data', () => {
          onChangeRef.current?.(ed.getData());
        });
      })
      .catch((err: unknown) => {
        if (!destroyed) console.error('[CKEditorField] init error:', err);
      });

    return () => {
      destroyed = true;
      if (editorRef.current) {
        (editorRef.current as { destroy: () => Promise<void> }).destroy().catch(() => undefined);
        editorRef.current = null;
      }
    };
    // Run only on mount/unmount — value sync is handled below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync disabled state
  useEffect(() => {
    if (!editorRef.current) return;
    (editorRef.current as { isReadOnly: boolean }).isReadOnly = disabled;
  }, [disabled]);

  // Sync external value changes (e.g. loading from store)
  useEffect(() => {
    if (!editorRef.current) return;
    const ed = editorRef.current as { getData: () => string; setData: (v: string) => void };
    if (ed.getData() !== value) ed.setData(value ?? '');
  }, [value]);

  return (
    <div
      ref={containerRef}
      style={{ minHeight, fontSize: 15 }}
      data-placeholder={placeholder}
    />
  );
}
