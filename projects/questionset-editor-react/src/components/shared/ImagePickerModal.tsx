/**
 * ImagePickerModal — modal for selecting or uploading an image to insert
 * into the active contenteditable field.
 *
 * Tabs:
 *  • My Images  — /action/composite/v3/search (user's assets)
 *  • All Images — /action/composite/v3/search (all assets)
 *  • Upload     — drag/drop or browse → asset create + upload API
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';
import { searchAssets, uploadAsset, type IAssetItem } from '../../api/asset';
import { useEditorStore } from '../../store/editor.store';
import { rewriteAssetUrl } from '../../utils/assetUrl';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = 'my' | 'all' | 'upload';

export interface ImagePickerModalProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Constants / helpers
// ---------------------------------------------------------------------------

const LIMIT = 24;

function resolveUrl(img: IAssetItem): string {
  return img.downloadUrl ?? img.appIcon ?? img.thumbnail ?? '';
}

// ---------------------------------------------------------------------------
// ImageGrid
// ---------------------------------------------------------------------------

interface ImageGridProps {
  tab: 'my' | 'all';
  createdBy: string;
  cloudStorageUrls: string[];
  selectedUrl: string | null;
  onSelectedChange: (url: string | null) => void;
}

function ImageGrid({ tab, createdBy, cloudStorageUrls, selectedUrl, onSelectedChange }: ImageGridProps) {
  const [images, setImages]   = useState<IAssetItem[]>([]);
  const [count, setCount]     = useState(0);
  const [offset, setOffset]   = useState(0);
  const [query, setQuery]     = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (nextOffset: number, nextQuery: string, replace: boolean) => {
    setLoading(true);
    try {
      const { items, count: total } = await searchAssets({
        mediaType: 'image',
        query:     nextQuery || undefined,
        limit:     LIMIT,
        offset:    nextOffset,
        createdBy: tab === 'my' ? createdBy : undefined,
      });
      setImages(prev => replace ? items : [...prev, ...items]);
      setCount(total);
      setOffset(nextOffset);
    } finally {
      setLoading(false);
    }
  }, [tab, createdBy]);

  useEffect(() => {
    onSelectedChange(null);
    void load(0, query, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, query]);

  const hasMore = images.length < count;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Search */}
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--sb-text-faint)', display: 'flex', pointerEvents: 'none',
        }}>
          <Icon name="search" size={15} />
        </span>
        <input
          type="text"
          placeholder="Search images…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            width: '100%', padding: '10px 14px 10px 36px', borderRadius: 24,
            border: '1px solid var(--sb-border)', fontSize: 14, fontFamily: 'inherit',
            background: '#fff', outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Grid / empty state */}
      {loading && images.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--sb-text-faint)', padding: '40px 0', fontSize: 14, margin: 0 }}>Loading…</p>
      ) : images.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--sb-text-faint)', padding: '40px 0', fontSize: 14, margin: 0 }}>No images found</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
          {images.map(img => {
            const url = rewriteAssetUrl(resolveUrl(img), cloudStorageUrls);
            const isSel = selectedUrl === url && !!url;
            return (
              <div
                key={img.identifier}
                onClick={() => onSelectedChange(isSel ? null : (url || null))}
                title={img.name}
                style={{
                  aspectRatio: '1', borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                  border: `2px solid ${isSel ? 'var(--accent)' : 'var(--sb-border)'}`,
                  outline: isSel ? '2px solid var(--accent-soft)' : undefined,
                  background: 'var(--sb-bg)',
                }}
              >
                {url ? (
                  <img src={url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--sb-text-faint)' }}>
                    <Icon name="image" size={28} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <button
          type="button"
          onClick={() => void load(offset + LIMIT, query, false)}
          style={{
            display: 'block', width: '100%', padding: '12px', fontFamily: 'inherit',
            border: '1px solid var(--sb-border)', borderRadius: 10, background: '#fff',
            cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'var(--accent)',
          }}
        >
          Load More
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// UploadTab
// ---------------------------------------------------------------------------

interface UploadTabProps {
  channel: string;
  createdBy: string;
  presignedHeaders: Record<string, string>;
  cloudStorageUrls: string[];
  onUploaded: (url: string) => void;
  triggerRef: React.MutableRefObject<(() => void) | null>;
}

const COPYRIGHT_TEXT =
  'I understand and confirm that all resources and assets created through the content editor or ' +
  'uploaded on the platform shall be available for free and public use without limitations on the ' +
  'platform (web portal, applications and any other end user interface that the platform would ' +
  'enable) and will be licensed under terms & conditions and policy guidelines of the platform. ' +
  'In doing so, the copyright and license of the original author is not infringed.';

function UploadTab({ channel, createdBy, presignedHeaders, cloudStorageUrls, onUploaded, triggerRef }: UploadTabProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging,  setDragging]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    triggerRef.current = () => fileRef.current?.click();
  }, [triggerRef]);

  const handle = async (file: File | undefined) => {
    if (!file || uploading) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    if (file.size > 1024 * 1024)         { setError('File exceeds 1 MB limit.'); return; }
    setError('');
    setUploading(true);
    try {
      const rawUrl = await uploadAsset(file, channel, createdBy, presignedHeaders);
      onUploaded(rewriteAssetUrl(rawUrl, cloudStorageUrls));
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); void handle(e.dataTransfer.files?.[0]); }}
        onClick={() => !uploading && fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--accent)' : '#c4c4c4'}`,
          borderRadius: 12, padding: '36px 40px', textAlign: 'center',
          cursor: uploading ? 'default' : 'pointer',
          background: dragging ? 'var(--accent-soft)' : '#fafafa',
          transition: 'all .15s', userSelect: 'none',
        }}
      >
        <div style={{ color: '#aaa', marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
          <Icon name="upload" size={36} />
        </div>
        <p style={{ fontWeight: 700, fontSize: 16, margin: '0 0 6px', color: 'var(--sb-text-2)' }}>
          {uploading ? 'Uploading…' : 'Drag & drop or click to browse'}
        </p>
        <p style={{ fontSize: 13, color: 'var(--sb-text-muted)', margin: 0 }}>PNG, JPEG · max 1 MB</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => { void handle(e.target.files?.[0]); e.target.value = ''; }}
        />
      </div>

      {/* Copyright & License — informational only */}
      <div style={{
        borderTop: '1px solid var(--sb-border)', paddingTop: 12,
        fontFamily: 'var(--sb-font, "Plus Jakarta Sans", system-ui, sans-serif)',
      }}>
        <p style={{ fontWeight: 700, fontSize: '12px', color: '#1a1a1a', margin: '0 0 5px', lineHeight: 1.4 }}>
          Copyright &amp; License
          <span style={{ color: '#d22e2e', marginLeft: 2 }}>*</span>
        </p>
        <p style={{ fontSize: '11.5px', color: '#6b6b6b', lineHeight: 1.65, margin: 0 }}>
          {COPYRIGHT_TEXT}
        </p>
      </div>

      {error && (
        <p style={{ fontSize: 13, color: 'var(--sb-red)', margin: 0 }}>{error}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ImagePickerModal
// ---------------------------------------------------------------------------

export default function ImagePickerModal({ onSelect, onClose }: ImagePickerModalProps) {
  const [tab, setTab]                 = useState<Tab>('my');
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const uploadTriggerRef              = useRef<(() => void) | null>(null);

  // Read context values from editor store
  const editorConfig     = useEditorStore(s => s.editorConfig);
  const channel          = editorConfig?.context.channel          ?? '';
  const createdBy        = editorConfig?.context.userId           ?? '';
  const cloudStorageUrls = editorConfig?.context.cloudStorageUrls ?? [];
  const presignedHeaders = editorConfig?.context.cloudStorage?.presigned_headers ?? {};

  const switchTab = (next: Tab) => {
    setTab(next);
    setSelectedUrl(null);
  };

  // Escape key to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  // Portal into .ce so CSS variables (--accent etc.) are inherited
  const portalTarget = document.querySelector('.ce') ?? document.body;

  const TABS: { key: Tab; label: string; icon?: string }[] = [
    { key: 'my',     label: 'My Images' },
    { key: 'all',    label: 'All Images' },
    { key: 'upload', label: 'Upload', icon: 'upload' },
  ];

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        fontFamily: 'var(--sb-font)',
      }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'var(--sb-card)', borderRadius: 18,
          width: 680, maxWidth: '100%', maxHeight: 'calc(100vh - 48px)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: 'var(--sb-shadow-deep)',
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px 0' }}>
          <span style={{ fontWeight: 800, fontSize: 18, flex: 1, color: 'var(--sb-text)' }}>
            Select Image
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              padding: 4, borderRadius: 6, color: 'var(--sb-text-muted)',
              display: 'grid', placeItems: 'center',
            }}
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* ── Tabs ────────────────────────────────── */}
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid var(--sb-border)', marginTop: 4 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => switchTab(t.key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '12px 16px', border: 'none', background: 'transparent',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 14, fontWeight: tab === t.key ? 700 : 500,
                color: tab === t.key ? 'var(--accent)' : 'var(--sb-text-muted)',
                borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1, transition: 'color .12s',
              }}
            >
              {t.icon && <Icon name={t.icon} size={14} />}
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Body ────────────────────────────────── */}
        <div style={{ overflow: 'auto', padding: 24, minHeight: tab !== 'upload' ? 260 : 0 }}>
          {tab === 'my'  && (
            <ImageGrid
              tab="my"
              createdBy={createdBy}
              cloudStorageUrls={cloudStorageUrls}
              selectedUrl={selectedUrl}
              onSelectedChange={setSelectedUrl}
            />
          )}
          {tab === 'all' && (
            <ImageGrid
              tab="all"
              createdBy={createdBy}
              cloudStorageUrls={cloudStorageUrls}
              selectedUrl={selectedUrl}
              onSelectedChange={setSelectedUrl}
            />
          )}
          {tab === 'upload' && (
            <UploadTab
              channel={channel}
              createdBy={createdBy}
              presignedHeaders={presignedHeaders}
              cloudStorageUrls={cloudStorageUrls}
              onUploaded={url => onSelect(url)}
              triggerRef={uploadTriggerRef}
            />
          )}
        </div>

        {/* ── Footer ──────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: 10, padding: '16px 24px', borderTop: '1px solid var(--sb-border)',
          flexShrink: 0,
        }}>
          {tab === 'upload' ? (
            <>
              <button type="button" className="ce-btn ghost" onClick={onClose}>Cancel</button>
              <button
                type="button"
                className="ce-btn primary"
                onClick={() => uploadTriggerRef.current?.()}
              >
                <Icon name="upload" size={15} />
                Upload &amp; Use
              </button>
            </>
          ) : (
            <button
              type="button"
              className="ce-btn primary"
              disabled={!selectedUrl}
              onClick={() => { if (selectedUrl) onSelect(selectedUrl); }}
            >
              Use Selected
            </button>
          )}
        </div>
      </div>
    </div>,
    portalTarget,
  );
}
