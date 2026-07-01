/**
 * SharedRichToolbar — a single sticky toolbar that applies to whichever
 * contentEditable field is currently focused. Uses document.execCommand so
 * it works with any native contenteditable, with no per-editor wiring.
 *
 * Buttons use onMouseDown + preventDefault to prevent stealing focus from
 * the active editor field — the same pattern as the design's RichToolbar.
 */
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';
import MathModal from './MathModal';
import { SPECIAL_CHAR_GROUPS, ALL_CATEGORIES, type CharCategory } from './specialCharsData';

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 36];

function applyFontSize(px: number) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  if (sel.isCollapsed) {
    // No selection — no-op; user should select text first
    return;
  }
  const range = sel.getRangeAt(0);
  try {
    const fragment = range.extractContents();
    const span = document.createElement('span');
    span.style.fontSize = `${px}px`;
    span.appendChild(fragment);
    range.insertNode(span);
    // Re-select the inserted span
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.removeAllRanges();
    sel.addRange(newRange);
  } catch {
    // Cross-element selection fallback
    document.execCommand('fontSize', false, String(Math.min(7, Math.max(1, Math.round(px / 7)))));
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const run  = (cmd: string, val?: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  document.execCommand(cmd, false, val);
};
const keep = (e: React.MouseEvent) => e.preventDefault();

// ---------------------------------------------------------------------------
// SpecialCharsPopup — full character set matching the old Angular editor
// ---------------------------------------------------------------------------
function SpecialCharsPopup({ anchor, onClose }: { anchor: DOMRect; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState<CharCategory>('All');
  const [hovered, setHovered] = useState<{ char: string; title: string } | null>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    const t = setTimeout(() => document.addEventListener('mousedown', h), 100);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', h); };
  }, [onClose]);

  const chars = category === 'All'
    ? Object.values(SPECIAL_CHAR_GROUPS).flat()
    : SPECIAL_CHAR_GROUPS[category] ?? [];

  const W = 390;
  const H = 360;
  const spaceBelow = window.innerHeight - anchor.bottom - 8;
  const top = spaceBelow >= H ? anchor.bottom + 6 : Math.max(8, anchor.top - H - 6);
  const left = Math.max(8, Math.min(anchor.left, window.innerWidth - W - 8));

  return createPortal(
    <div ref={ref} style={{
      position: 'fixed', top, left, zIndex: 9999,
      width: W, background: '#fff',
      border: '1px solid var(--sb-border)', borderRadius: 14,
      boxShadow: 'var(--sb-shadow-deep)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header: title + category filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px 8px', borderBottom: '1px solid var(--sb-divider)' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--sb-text-2)' }}>Special characters</span>
        <select
          value={category}
          onChange={e => setCategory(e.target.value as CharCategory)}
          onMouseDown={e => e.stopPropagation()}
          style={{ fontSize: 12, border: '1px solid var(--sb-border)', borderRadius: 6, padding: '3px 8px', fontFamily: 'inherit', cursor: 'pointer', background: '#fff' }}
        >
          {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Character grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 34px)', gap: 2, padding: 10, maxHeight: 260, overflowY: 'auto' }}>
        {chars.map((item, i) => (
          <button key={i} type="button"
            onMouseDown={e => { e.preventDefault(); document.execCommand('insertText', false, item.char); onClose(); }}
            onMouseEnter={() => setHovered(item)}
            onMouseLeave={() => setHovered(null)}
            style={{
              width: 32, height: 32, border: `1px solid ${hovered?.char === item.char ? 'var(--accent)' : 'transparent'}`,
              borderRadius: 6, background: hovered?.char === item.char ? 'var(--accent-soft)' : 'transparent',
              cursor: 'pointer', fontSize: 15, display: 'grid', placeItems: 'center', fontFamily: 'inherit',
            }}
          >{item.char}</button>
        ))}
      </div>

      {/* Status bar: name + unicode */}
      <div style={{ borderTop: '1px solid var(--sb-divider)', padding: '6px 14px', display: 'flex', justifyContent: 'space-between', minHeight: 28 }}>
        <span style={{ fontSize: 11, color: 'var(--sb-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>
          {hovered?.title?.toUpperCase() ?? ''}
        </span>
        {hovered && (
          <span style={{ fontSize: 11, color: 'var(--sb-text-faint)', fontFamily: 'monospace' }}>
            U+{hovered.char.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0')}
          </span>
        )}
      </div>
    </div>,
    document.body,
  );
}

// ---------------------------------------------------------------------------
// TablePickerPopup
// ---------------------------------------------------------------------------
function TablePickerPopup({ anchor, onClose }: { anchor: DOMRect; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState({ r: 0, c: 0 });

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    // Delay to avoid closing on the same mousedown that opened the picker
    const t = setTimeout(() => document.addEventListener('mousedown', h), 100);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', h); };
  }, [onClose]);

  const MAX = 10;
  const estimatedH = 280;
  const spaceBelow = window.innerHeight - anchor.bottom - 8;
  const top = spaceBelow >= estimatedH ? anchor.bottom + 6 : anchor.top - estimatedH - 6;
  const left = Math.max(8, Math.min(anchor.left, window.innerWidth - (MAX * 22 + 28) - 8));

  const insertTable = (rows: number, cols: number) => {
    let html = '<table style="border-collapse:collapse;width:100%"><tbody>';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) html += '<td style="border:1px solid #c4c4c4;padding:6px 10px;min-width:40px">&nbsp;</td>';
      html += '</tr>';
    }
    html += '</tbody></table><p><br></p>';
    document.execCommand('insertHTML', false, html);
    onClose();
  };

  const label = hover.r > 0 ? `${hover.r} × ${hover.c}` : '0 × 0';

  return createPortal(
    <div ref={ref} style={{
      position: 'fixed', top, left, zIndex: 9999,
      background: '#fff', border: '1px solid #c4c4c4',
      borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,.15)', padding: '8px 8px 6px',
    }}>
      <div
        style={{ display: 'grid', gridTemplateColumns: `repeat(${MAX}, 22px)`, gap: 1, marginBottom: 6 }}
        onMouseLeave={() => setHover({ r: 0, c: 0 })}
      >
        {Array.from({ length: MAX }, (_, r) => Array.from({ length: MAX }, (_, c) => {
          const active = r < hover.r && c < hover.c;
          return (
            <div key={`${r}-${c}`}
              onMouseEnter={() => setHover({ r: r + 1, c: c + 1 })}
              onMouseDown={e => { e.preventDefault(); insertTable(r + 1, c + 1); }}
              style={{
                width: 22, height: 22,
                border: `1px solid ${active ? '#4a9ef8' : '#bfbfbf'}`,
                background: active ? '#d0e9fd' : '#fff',
                cursor: 'pointer', boxSizing: 'border-box',
              }}
            />
          );
        }))}
      </div>
      <div style={{ textAlign: 'center', fontSize: 11, color: '#555', fontWeight: 500 }}>{label}</div>
    </div>,
    document.body,
  );
}

// ---------------------------------------------------------------------------
// SharedRichToolbar
// ---------------------------------------------------------------------------
export default function SharedRichToolbar({ disabled = false }: { disabled?: boolean }) {
  const [menu, setMenu] = useState<'align' | 'size' | 'chars' | 'table' | null>(null);
  const [mathOpen, setMathOpen] = useState(false);
  const [mathAnchor, setMathAnchor] = useState<DOMRect | null>(null);
  const mathBtnRef = useRef<HTMLButtonElement>(null);
  const charsRef = useRef<HTMLButtonElement>(null);
  const tableRef = useRef<HTMLButtonElement>(null);
  const fileRef  = useRef<HTMLInputElement>(null);
  const [charsRect, setCharsRect] = useState<DOMRect | null>(null);
  const [tableRect, setTableRect] = useState<DOMRect | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Track whether a contenteditable is focused — disable toolbar when none is
  const [editorFocused, setEditorFocused] = useState(false);
  useEffect(() => {
    const check = () => {
      const el = document.activeElement as HTMLElement | null;
      setEditorFocused(!!el?.closest('[contenteditable]'));
    };
    document.addEventListener('focusin', check);
    document.addEventListener('focusout', () => setTimeout(check, 0));
    return () => {
      document.removeEventListener('focusin', check);
      document.removeEventListener('focusout', check);
    };
  }, []);

  // Effective disabled: prop OR no editor focused
  const off = disabled || !editorFocused;

  // Close inline dropdowns (align/size) on outside click
  useEffect(() => {
    if (menu !== 'align' && menu !== 'size') return;
    const h = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setMenu(null);
      }
    };
    const t = setTimeout(() => document.addEventListener('mousedown', h), 50);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', h); };
  }, [menu]);

  // Save selection before any operation that steals focus
  const savedRange = useRef<Range | null>(null);

  const saveRange = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount) savedRange.current = sel.getRangeAt(0).cloneRange();
  };

  /** Insert HTML at savedRange using the Range API — no focused element required */
  const insertAtSavedRange = (html: string) => {
    const range = savedRange.current;
    if (!range) return;
    // Focus the host contenteditable
    const anchor = range.commonAncestorContainer;
    const el: Element | null = anchor.nodeType === Node.ELEMENT_NODE
      ? anchor as Element
      : (anchor as Node).parentElement;
    const host = el?.closest('[contenteditable]') as HTMLElement | null;
    if (host) host.focus();
    // Restore selection
    const sel = window.getSelection();
    if (sel) { sel.removeAllRanges(); sel.addRange(range); }
    // Insert via Range API
    range.deleteContents();
    const div = document.createElement('div');
    div.innerHTML = html;
    const frag = document.createDocumentFragment();
    while (div.firstChild) frag.appendChild(div.firstChild);
    range.insertNode(frag);
    range.collapse(false);
    if (sel) { sel.removeAllRanges(); sel.addRange(range); }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      insertAtSavedRange(`<img src="${reader.result}" alt="${file.name}" style="max-width:100%;border-radius:6px;margin:4px 0;" />`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const toggle = (name: 'align' | 'size' | 'chars' | 'table') =>
    setMenu(m => m === name ? null : name);

  const openChars = () => {
    if (charsRef.current) setCharsRect(charsRef.current.getBoundingClientRect());
    toggle('chars');
  };
  const openTable = () => {
    if (tableRef.current) setTableRect(tableRef.current.getBoundingClientRect());
    toggle('table');
  };

  const Btn = ({ cmd, val, title, children }: { cmd: string; val?: string; title: string; children: React.ReactNode }) => (
    <button type="button" className="re-tb" title={title} onMouseDown={run(cmd, val)} disabled={off}>{children}</button>
  );

  return (
    <div ref={toolbarRef} className="re-toolbar docked" role="toolbar" aria-label="Text formatting" onMouseDown={keep}
      style={{ opacity: off ? 0.4 : 1, pointerEvents: off ? 'none' : undefined, transition: 'opacity .15s' }}>
      {/* Language */}
      <label className="re-lang" onMouseDown={keep}>
        <span>Language</span>
        <select defaultValue="EN" onChange={() => {}}>
          <option>EN</option><option>HI</option><option>TE</option><option>TA</option><option>KN</option>
        </select>
      </label>
      <span className="re-div" />

      {/* Inline marks */}
      <div className="re-grp">
        <Btn cmd="bold"       title="Bold">      <span className="b">B</span></Btn>
        <Btn cmd="italic"     title="Italic">    <span className="i">I</span></Btn>
        <Btn cmd="underline"  title="Underline"> <span className="u">U</span></Btn>
      </div>
      <span className="re-div" />

      {/* Lists */}
      <div className="re-grp">
        <Btn cmd="insertUnorderedList" title="Bullet list">  <Icon name="bullet"  size={17} /></Btn>
        <Btn cmd="insertOrderedList"   title="Numbered list"><Icon name="numlist" size={17} /></Btn>
      </div>
      <span className="re-div" />

      {/* Alignment dropdown */}
      <div className="re-grp">
        <span className="re-pop">
          <button type="button" className={`re-tb caret${menu === 'align' ? ' on' : ''}`} title="Alignment"
            onMouseDown={e => { e.preventDefault(); toggle('align'); }} disabled={off}>
            <Icon name="align" size={17} /><Icon name="caret" size={10} />
          </button>
          {menu === 'align' && (
            <div className="re-menu" onMouseDown={keep}>
              <button type="button" onMouseDown={run('justifyLeft')}>  <Icon name="align-left"   size={16} />Left</button>
              <button type="button" onMouseDown={run('justifyCenter')}><Icon name="align-center" size={16} />Center</button>
              <button type="button" onMouseDown={run('justifyRight')}> <Icon name="align-right"  size={16} />Right</button>
            </div>
          )}
        </span>
      </div>
      <span className="re-div" />

      {/* Font size dropdown */}
      <div className="re-grp">
        <span className="re-pop">
          <button type="button" className={`re-tb caret${menu === 'size' ? ' on' : ''}`} title="Font size"
            onMouseDown={e => { e.preventDefault(); toggle('size'); }} disabled={off}>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-1px' }}>A</span><Icon name="caret" size={10} />
          </button>
          {menu === 'size' && (
            <div className="re-menu" onMouseDown={keep} style={{ minWidth: 80, maxHeight: 260, overflowY: 'auto' }}>
              {FONT_SIZES.map(px => (
                <button key={px} type="button" style={{ fontSize: px }}
                  onMouseDown={e => { e.preventDefault(); applyFontSize(px); setMenu(null); }}>
                  {px}
                </button>
              ))}
            </div>
          )}
        </span>
        <Btn cmd="subscript"   title="Subscript">  <span>X<sub>2</sub></span></Btn>
        <Btn cmd="superscript" title="Superscript"><span>X<sup>2</sup></span></Btn>
      </div>
      <span className="re-div" />

      {/* Special chars + equation */}
      <div className="re-grp">
        <button ref={charsRef} type="button" className={`re-tb${menu === 'chars' ? ' on' : ''}`} title="Special characters"
          onMouseDown={e => { e.preventDefault(); openChars(); }} disabled={off}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Ω</span>
        </button>
        <button ref={mathBtnRef} type="button" className="re-tb" title="Insert equation"
          onMouseDown={e => {
            e.preventDefault();
            saveRange();
            if (mathBtnRef.current) setMathAnchor(mathBtnRef.current.getBoundingClientRect());
            setMathOpen(v => !v);
          }} disabled={off}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Σ</span>
        </button>
      </div>
      <span className="re-div" />

      {/* Image */}
      <button type="button" className="re-tb" title="Insert image"
        onMouseDown={e => { e.preventDefault(); saveRange(); fileRef.current?.click(); }}
        disabled={off}>
        <Icon name="image" size={17} />
      </button>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />

      {/* Table */}
      <div className="re-grp">
        <button ref={tableRef} type="button" className={`re-tb${menu === 'table' ? ' on' : ''}`} title="Insert table"
          onMouseDown={e => { e.preventDefault(); openTable(); }} disabled={off}>
          <Icon name="table" size={17} />
        </button>
      </div>

      {/* Portalled popups */}
      {menu === 'chars' && charsRect && (
        <SpecialCharsPopup anchor={charsRect} onClose={() => setMenu(null)} />
      )}
      {menu === 'table' && tableRect && (
        <TablePickerPopup anchor={tableRect} onClose={() => setMenu(null)} />
      )}

      {/* MathQuill equation editor — dropdown below Σ button */}
      {mathOpen && mathAnchor && (
        <MathModal
          anchor={mathAnchor}
          savedRange={savedRange.current}
          onClose={() => { setMathOpen(false); setMathAnchor(null); }}
        />
      )}
    </div>
  );
}
