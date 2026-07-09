import 'katex/dist/katex.min.css';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Link from '@tiptap/extension-link';
import Mathematics from '@tiptap/extension-mathematics';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { getUserId } from '../../utils/context';
import { escapeHtmlAttr } from '../../utils/html';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Subscript as SubIcon,
  Superscript as SupIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Undo,
  Redo,
  Sigma,
  Grid2x2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Special characters
// ---------------------------------------------------------------------------

const SPECIAL_CHARS = '× ÷ ± ≤ ≥ ≠ ≈ → ← ↔ ∞ π α β γ θ λ μ Ω Δ √ ∫ ° ½ ¼ ¾ ² ³ ₂ • —'.split(' ');

// ---------------------------------------------------------------------------
// SpecialCharsPopup
// ---------------------------------------------------------------------------

interface SpecialCharsPopupProps {
  anchor: DOMRect;
  onInsert: (ch: string) => void;
  onClose: () => void;
}

function SpecialCharsPopup({ anchor, onInsert, onClose }: SpecialCharsPopupProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Estimated popup height — flip above if it would go off-screen
  const estimatedH = 220;
  const spaceBelow = window.innerHeight - anchor.bottom - 6;
  const top = spaceBelow >= estimatedH
    ? anchor.bottom + 6
    : anchor.top - estimatedH - 6;

  const popup = (
    <div ref={ref} style={{
      position: 'fixed',
      top,
      left: anchor.left + anchor.width / 2,
      transform: 'translateX(-50%)',
      zIndex: 9999, background: '#fff', border: '1px solid var(--sb-border)',
      borderRadius: 14, boxShadow: 'var(--sb-shadow-deep)', padding: 12,
      display: 'grid', gridTemplateColumns: 'repeat(7, 36px)', gap: 4, minWidth: 280,
    }}>
      {SPECIAL_CHARS.map((ch, i) => (
        <button
          key={i}
          type="button"
          title={ch}
          onMouseDown={e => { e.preventDefault(); onInsert(ch); onClose(); }}
          style={{
            width: 36, height: 36, border: '1px solid transparent', borderRadius: 8,
            background: 'transparent', cursor: 'pointer', fontSize: 16,
            display: 'grid', placeItems: 'center', fontFamily: 'inherit',
            color: 'var(--sb-text)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-soft)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; }}
        >
          {ch}
        </button>
      ))}
    </div>
  );
  return createPortal(popup, document.body);
}

// ---------------------------------------------------------------------------
// TablePickerPopup
// ---------------------------------------------------------------------------

interface TablePickerPopupProps {
  anchor: DOMRect;
  onInsert: (rows: number, cols: number) => void;
  onClose: () => void;
}

function TablePickerPopup({ anchor, onInsert, onClose }: TablePickerPopupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const MAX = 10;
  const hr = hover?.r ?? 0;
  const hc = hover?.c ?? 0;

  // Estimated popup height — flip above if it would go off-screen
  const estH2 = 260;
  const below2 = window.innerHeight - anchor.bottom - 6;
  const top2 = below2 >= estH2 ? anchor.bottom + 6 : anchor.top - estH2 - 6;

  const popup = (
    <div ref={ref} style={{
      position: 'fixed',
      top: top2,
      right: Math.max(8, window.innerWidth - anchor.right),
      zIndex: 9999, background: '#fff', border: '1px solid var(--sb-border)',
      borderRadius: 14, boxShadow: 'var(--sb-shadow-deep)', padding: 12,
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${MAX}, 22px)`, gap: 2, marginBottom: 8 }}>
        {Array.from({ length: MAX }, (_, r) =>
          Array.from({ length: MAX }, (_, c) => {
            const active = r < hr && c < hc;
            return (
              <div
                key={`${r}-${c}`}
                onMouseEnter={() => setHover({ r: r + 1, c: c + 1 })}
                onMouseDown={e => { e.preventDefault(); onInsert(r + 1, c + 1); onClose(); }}
                style={{
                  width: 22, height: 22, border: `1.5px solid ${active ? 'var(--accent)' : 'var(--sb-border)'}`,
                  borderRadius: 3, background: active ? 'var(--accent-soft)' : '#fff', cursor: 'pointer',
                }}
              />
            );
          })
        )}
      </div>
      <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--sb-text-muted)' }}>
        {hr > 0 ? `${hr} × ${hc}` : '0 × 0'}
      </div>
    </div>
  );
  return createPortal(popup, document.body);
}
import AssetBrowser from '../AssetBrowser/AssetBrowser';
import { useEditorStore } from '../../store/editor.store';
import styles from './RichTextEditor.module.scss';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
  enableImages?: boolean;
  maxLength?: number;
  /** Compact mode: smaller toolbar, reduced padding */
  compact?: boolean;
  /** No outer border — use when parent container already provides a border */
  borderless?: boolean;
  /** Hide the built-in toolbar (use when rendering the toolbar externally) */
  hideToolbar?: boolean;
  /** Called once the editor instance is ready — use to render an external toolbar */
  onEditorReady?: (editor: Editor) => void;
}

// ---------------------------------------------------------------------------
// Toolbar button helper
// ---------------------------------------------------------------------------

interface ToolbarBtnProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}

function ToolbarBtn({ onClick, active, title, disabled, children }: ToolbarBtnProps) {
  return (
    <button
      type="button"
      className={[styles.toolbarBtn, active ? styles.toolbarBtnActive : ''].filter(Boolean).join(' ')}
      onMouseDown={(e) => {
        e.preventDefault(); // prevent editor blur
        if (!disabled) onClick();
      }}
      title={title}
      disabled={disabled}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className={styles.toolbarDivider} aria-hidden="true" />;
}

// ---------------------------------------------------------------------------
// Full toolbar (exported so QuestionEditor can render it externally)
// ---------------------------------------------------------------------------

export interface ToolbarProps {
  editor: Editor | null;
  disabled?: boolean;
  enableImages?: boolean;
  onImageClick?: () => void;
}

export function Toolbar({ editor, disabled, enableImages, onImageClick }: ToolbarProps) {
  const [popup, setPopup] = useState<'chars' | 'table' | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const charsRef = useRef<HTMLButtonElement>(null);
  const tableRef = useRef<HTMLButtonElement>(null);
  if (!editor) return null;

  const openPopup = (name: 'chars' | 'table') => {
    const el = name === 'chars' ? charsRef.current : tableRef.current;
    if (!el) return;
    if (popup === name) { setPopup(null); setAnchorRect(null); return; }
    setAnchorRect(el.getBoundingClientRect());
    setPopup(name);
  };

  const addLink = () => {
    const url = window.prompt('Enter URL');
    if (!url) return;
    // Only http/https — a javascript: href would persist as an XSS vector.
    if (!/^https?:\/\//i.test(url.trim())) return;
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent({
        type: 'text',
        text: url,
        marks: [{ type: 'link', attrs: { href: url } }],
      }).run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const insertMath = () => {
    const latex = window.prompt('Enter LaTeX expression (e.g. x^2 + y^2 = z^2)');
    if (!latex) return;
    editor.chain().focus().insertContent(`<span data-type="inlineMath" data-latex="${escapeHtmlAttr(latex)}"></span>`).run();
  };

  const insertChar = (ch: string) => {
    editor.chain().focus().insertContent(ch).run();
  };

  const insertTable = (rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: false }).run();
  };

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Text formatting" style={{ position: 'relative' }}>
      <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Undo" disabled={disabled || !editor.can().undo()}>
        <Undo size={13} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Redo" disabled={disabled || !editor.can().redo()}>
        <Redo size={13} />
      </ToolbarBtn>

      <ToolbarDivider />

      <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold" disabled={disabled}>
        <Bold size={13} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic" disabled={disabled}>
        <Italic size={13} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline" disabled={disabled}>
        <UnderlineIcon size={13} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript" disabled={disabled}>
        <SubIcon size={13} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript" disabled={disabled}>
        <SupIcon size={13} />
      </ToolbarBtn>

      <ToolbarDivider />

      <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list" disabled={disabled}>
        <List size={13} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list" disabled={disabled}>
        <ListOrdered size={13} />
      </ToolbarBtn>

      <ToolbarDivider />

      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left" disabled={disabled}>
        <AlignLeft size={13} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center" disabled={disabled}>
        <AlignCenter size={13} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right" disabled={disabled}>
        <AlignRight size={13} />
      </ToolbarBtn>

      <ToolbarDivider />

      {/* Special characters */}
      <button
        ref={charsRef}
        type="button"
        className={[styles.toolbarBtn, popup === 'chars' ? styles.toolbarBtnActive : ''].filter(Boolean).join(' ')}
        onMouseDown={e => e.preventDefault()}
        onClick={() => !disabled && openPopup('chars')}
        title="Special characters"
        disabled={disabled}
        aria-pressed={popup === 'chars'}
      >
        <span style={{ fontSize: 14, fontWeight: 600 }}>Ω</span>
      </button>
      {popup === 'chars' && anchorRect && (
        <SpecialCharsPopup anchor={anchorRect} onInsert={insertChar} onClose={() => { setPopup(null); setAnchorRect(null); }} />
      )}

      {/* KaTeX math equations */}
      <ToolbarBtn onClick={insertMath} title="Add Equations" disabled={disabled}>
        <Sigma size={13} />
      </ToolbarBtn>

      <ToolbarDivider />

      {/* Image */}
      {enableImages && (
        <ToolbarBtn onClick={() => onImageClick?.()} title="Insert image" disabled={disabled}>
          <ImageIcon size={13} />
        </ToolbarBtn>
      )}

      {/* Table */}
      <button
        ref={tableRef}
        type="button"
        className={[styles.toolbarBtn, popup === 'table' ? styles.toolbarBtnActive : ''].filter(Boolean).join(' ')}
        onMouseDown={e => e.preventDefault()}
        onClick={() => !disabled && openPopup('table')}
        title="Insert table"
        disabled={disabled}
        aria-pressed={popup === 'table'}
      >
        <Grid2x2 size={13} />
      </button>
      {popup === 'table' && anchorRect && (
        <TablePickerPopup anchor={anchorRect} onInsert={insertTable} onClose={() => { setPopup(null); setAnchorRect(null); }} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compact toolbar — inline marks + image + math
// ---------------------------------------------------------------------------

interface CompactToolbarProps {
  editor: Editor | null;
  disabled?: boolean;
  enableImages?: boolean;
  onImageClick?: () => void;
}

function CompactToolbar({ editor, disabled, enableImages, onImageClick }: CompactToolbarProps) {
  if (!editor) return null;

  const insertMath = () => {
    const latex = window.prompt('Enter LaTeX expression (e.g. x^2 + y^2 = z^2)');
    if (!latex) return;
    editor.chain().focus().insertContent(`<span data-type="inlineMath" data-latex="${latex}"></span>`).run();
  };

  return (
    <div className={`${styles.toolbar} ${styles.toolbarCompact}`} role="toolbar" aria-label="Text formatting">
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold" disabled={disabled}>
        <Bold size={12} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic" disabled={disabled}>
        <Italic size={12} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline" disabled={disabled}>
        <UnderlineIcon size={12} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript" disabled={disabled}>
        <SubIcon size={12} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript" disabled={disabled}>
        <SupIcon size={12} />
      </ToolbarBtn>

      <span className={styles.toolbarDivider} aria-hidden="true" />

      {/* Math */}
      <ToolbarBtn onClick={insertMath} title="Insert math (KaTeX)" disabled={disabled}>
        <Sigma size={12} />
      </ToolbarBtn>

      {/* Image (only when enabled) */}
      {enableImages && (
        <ToolbarBtn onClick={() => onImageClick?.()} title="Insert image" disabled={disabled}>
          <ImageIcon size={12} />
        </ToolbarBtn>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Character count helper
// ---------------------------------------------------------------------------

function getCharCount(editor: Editor | null): number {
  if (!editor) return 0;
  return editor.state.doc.textContent.length;
}

// ---------------------------------------------------------------------------
// RichTextEditor
// ---------------------------------------------------------------------------

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter text…',
  disabled = false,
  minHeight,
  enableImages = false,
  maxLength,
  compact = false,
  borderless = false,
  hideToolbar = false,
  onEditorReady,
}: RichTextEditorProps) {
  const editorConfig = useEditorStore((s) => s.editorConfig);
  const [showAssetBrowser, setShowAssetBrowser] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const limitExceeded = maxLength !== undefined && charCount > maxLength;

  const actualMinHeight = minHeight ?? (compact ? 48 : 120);
  const channel  = editorConfig?.context?.channel  ?? '';
  const userId   = getUserId(editorConfig?.context);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
      Image.configure({ inline: false, allowBase64: true }),
      Subscript,
      Superscript,
      Link.configure({ openOnClick: false }),
      Mathematics,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || '',
    editable: !disabled,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      onChange(html === '<p></p>' ? '' : html);
      setCharCount(getCharCount(ed));
    },
    onCreate: ({ editor: ed }) => {
      setCharCount(getCharCount(ed));
      onEditorReady?.(ed);
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (!editor) return;
    const current  = editor.getHTML();
    const incoming = value || '';
    if (current !== incoming && incoming !== '<p></p>') {
      editor.commands.setContent(incoming);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Sync disabled state
  useEffect(() => {
    if (editor) editor.setEditable(!disabled);
  }, [disabled, editor]);

  const handleImageSelect = useCallback(
    (asset: { url: string; name: string; id: string }) => {
      editor?.chain().focus().setImage({ src: asset.url, alt: asset.name }).run();
      setShowAssetBrowser(false);
    },
    [editor],
  );

  const wrapperClass = [
    styles.wrapper,
    compact    ? styles.wrapperCompact    : '',
    borderless ? styles.wrapperBorderless : '',
    limitExceeded ? styles.limitExceeded  : '',
  ].filter(Boolean).join(' ');

  const editorAreaClass = [
    styles.editorArea,
    compact ? styles.editorAreaCompact : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClass}>
      {!hideToolbar && (compact ? (
        <CompactToolbar
          editor={editor}
          disabled={disabled}
          enableImages={enableImages}
          onImageClick={() => setShowAssetBrowser(true)}
        />
      ) : (
        <Toolbar
          editor={editor}
          disabled={disabled}
          enableImages={enableImages}
          onImageClick={() => setShowAssetBrowser(true)}
        />
      ))}

      <div
        className={editorAreaClass}
        style={{ minHeight: actualMinHeight }}
        onClick={() => editor?.commands.focus()}
      >
        <EditorContent editor={editor} className={styles.editorContent} />
      </div>

      {maxLength !== undefined && (
        <div className={[styles.charCount, limitExceeded ? styles.charCountError : ''].filter(Boolean).join(' ')}>
          {charCount} / {maxLength}
        </div>
      )}

      {showAssetBrowser && (
        <AssetBrowser
          isOpen={showAssetBrowser}
          onClose={() => setShowAssetBrowser(false)}
          onSelect={handleImageSelect}
          mediaType="image"
          channel={channel}
          userId={userId}
        />
      )}
    </div>
  );
}
