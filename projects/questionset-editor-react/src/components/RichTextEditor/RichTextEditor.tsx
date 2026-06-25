import 'katex/dist/katex.min.css';
import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
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
// Full toolbar
// ---------------------------------------------------------------------------

interface ToolbarProps {
  editor: Editor | null;
  disabled?: boolean;
  enableImages?: boolean;
  onImageClick?: () => void;
}

function Toolbar({ editor, disabled, enableImages, onImageClick }: ToolbarProps) {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('Enter URL');
    if (!url) return;
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const insertMath = () => {
    const latex = window.prompt('Enter LaTeX expression (e.g. x^2 + y^2 = z^2)');
    if (!latex) return;
    editor.chain().focus().insertContent(`<span data-type="inlineMath" data-latex="${latex}"></span>`).run();
  };

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Text formatting">
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

      <ToolbarBtn onClick={addLink} active={editor.isActive('link')} title="Insert link" disabled={disabled}>
        <LinkIcon size={13} />
      </ToolbarBtn>
      {enableImages && (
        <ToolbarBtn onClick={() => onImageClick?.()} title="Insert image" disabled={disabled}>
          <ImageIcon size={13} />
        </ToolbarBtn>
      )}
      <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule" disabled={disabled}>
        <Minus size={13} />
      </ToolbarBtn>

      <ToolbarDivider />

      {/* KaTeX math */}
      <ToolbarBtn onClick={insertMath} title="Insert math (KaTeX)" disabled={disabled}>
        <Sigma size={13} />
      </ToolbarBtn>
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
}: RichTextEditorProps) {
  const editorConfig = useEditorStore((s) => s.editorConfig);
  const [showAssetBrowser, setShowAssetBrowser] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const limitExceeded = maxLength !== undefined && charCount > maxLength;

  const actualMinHeight = minHeight ?? (compact ? 48 : 120);
  const channel  = editorConfig?.context?.channel  ?? '';
  const userId   = editorConfig?.context?.userId   ?? '';

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
      {compact ? (
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
      )}

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
