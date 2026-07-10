import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { escapeHtml, escapeHtmlAttr } from '../../utils/html';

interface MathModalProps {
  /** Position of the Σ toolbar button — dropdown appears below it */
  anchor: DOMRect;
  onClose: () => void;
  savedRange: Range | null;
}

interface MathModalWindow extends Window {
  mathModal?: {
    ckeditor: {
      mathtext: {
        modal: (opts: {
          onInit: (data: { latexFrmla: string; imgURL?: string }) => void;
          detail?: string;
        }) => void;
      };
    };
  };
}

/** Insert HTML directly at a Range — no focused element required */
function insertAtRange(html: string, range: Range) {
  try {
    // Focus the host contenteditable
    const anchor = range.commonAncestorContainer;
    const el: Element | null = anchor.nodeType === Node.ELEMENT_NODE
      ? anchor as Element
      : (anchor as ChildNode).parentElement;
    const host = el?.closest('[contenteditable]') as HTMLElement | null;
    if (host) host.focus();

    // Restore selection
    const sel = window.getSelection();
    if (sel) { sel.removeAllRanges(); sel.addRange(range); }

    // Insert using Range API (works without active focus)
    range.deleteContents();
    const div = document.createElement('div');
    div.innerHTML = html;
    const frag = document.createDocumentFragment();
    while (div.firstChild) frag.appendChild(div.firstChild);
    range.insertNode(frag);
    range.collapse(false);
    if (sel) { sel.removeAllRanges(); sel.addRange(range); }
  } catch (err) {
    console.error('[MathModal] insertAtRange failed:', err);
  }
}

// Resolved against this bundle's own URL (not the host page's domain root) —
// this package is published to npm and its dist/ assets get consumed from
// node_modules by the portal, so a root-relative '/assets/...' path resolves
// against the portal's own origin instead of wherever this package's dist/
// actually lives, and 404s through to the portal's own SPA fallback page.
const MATH_MODAL_URL = new URL('./assets/libs/mathEquation/plugin/mathModal/index.html', import.meta.url).href;

export default function MathModal({ anchor, onClose, savedRange }: MathModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const IFRAME_W = Math.min(500, window.innerWidth - 48);
  const IFRAME_H = Math.min(500, window.innerHeight - 60);

  const initModal = (iwin: MathModalWindow) => {
    iwin.mathModal!.ckeditor.mathtext.modal({
      detail: '',
      onInit: (data) => {
        const imgURL   = data.imgURL?.trim();
        const latex    = data.latexFrmla?.trim();
        if (!imgURL && !latex) { onClose(); return; }

        // Same as Angular editor: insert the server-rendered PNG image.
        // Iframe-provided strings are encoded — a quote/`<` in the formula
        // would otherwise inject markup that gets saved into the body.
        const html = imgURL
          ? `<img src="${escapeHtmlAttr(imgURL)}" alt="${escapeHtmlAttr(latex ?? 'equation')}" style="vertical-align:middle;max-height:2em;" />&nbsp;`
          : `<span>${escapeHtml(latex ?? '')}</span>&nbsp;`;

        if (savedRange) {
          insertAtRange(html, savedRange);
        } else {
          document.execCommand('insertHTML', false, html);
        }

        onClose();
      },
    });
  };

  const handleLoad = () => {
    const tryInit = (attempt: number) => {
      const iwin = iframeRef.current?.contentWindow as MathModalWindow | null;
      if (iwin?.mathModal?.ckeditor?.mathtext) {
        initModal(iwin);
      } else if (attempt < 10) {
        setTimeout(() => tryInit(attempt + 1), 200);
      } else {
        console.error('[MathModal] mathModal API not available after retries');
      }
    };
    tryInit(0);
  };

  // Close on Escape or outside click
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const onDown = (e: MouseEvent) => {
      const popup = document.getElementById('math-modal-popup');
      if (popup && !popup.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    // Small delay so the opening click doesn't immediately close it
    const t = setTimeout(() => document.addEventListener('mousedown', onDown), 100);
    return () => {
      document.removeEventListener('keydown', onKey);
      clearTimeout(t);
      document.removeEventListener('mousedown', onDown);
    };
  }, [onClose]);

  return createPortal(
    <>
      {/* Backdrop */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.45)' }}
        onMouseDown={onClose} />
      {/* Centered popup */}
      <div
        id="math-modal-popup"
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          width: IFRAME_W,
          height: IFRAME_H,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        <iframe
          ref={iframeRef}
          src={MATH_MODAL_URL}
          onLoad={handleLoad}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          title="Equation Editor"
        />
      </div>
    </>,
    document.body,
  );
}
