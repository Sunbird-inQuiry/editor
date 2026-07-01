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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = 'my' | 'all' | 'upload';

interface ImageItem {
  identifier: string;
  name: string;
  downloadUrl?: string;
  appIcon?: string;
  thumbnail?: string;
}

export interface ImagePickerModalProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Constants / helpers
// ---------------------------------------------------------------------------

const LIMIT = 24;

function resolveUrl(img: ImageItem): string {
  return img.downloadUrl ?? img.appIcon ?? img.thumbnail ?? '';
}

async function searchImages(
  offset: number,
  query: string,
): Promise<{ items: ImageItem[]; count: number }> {
  const filters: Record<string, unknown> = { contentType: ['Asset'], mediaType: ['image'] };
  if (query) filters['name'] = query;
  try {
    const res = await fetch('/action/composite/v3/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request: { filters, limit: LIMIT, offset } }),
    });
    const data = (await res.json()) as { result?: { content?: ImageItem[]; count?: number } };
    return { items: data.result?.content ?? [], count: data.result?.count ?? 0 };
  } catch {
    return { items: [], count: 0 };
  }
}

async function uploadImage(file: File): Promise<string> {
  const createRes = await fetch('/action/asset/v1/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      request: {
        asset: { name: file.name, mimeType: file.type, mediaType: 'image', contentType: 'Asset' },
      },
    }),
  });
  const createData = (await createRes.json()) as { result?: { identifier?: string } };
  const identifier = createData.result?.identifier;
  if (!identifier) throw new Error('Asset creation failed');

  const fd = new FormData();
  fd.append('file', file);
  const uploadRes = await fetch(`/action/asset/v1/upload/${identifier}`, { method: 'POST', body: fd });
  const uploadData = (await uploadRes.json()) as { result?: { content_url?: string } };
  const url = uploadData.result?.content_url;
  if (!url) throw new Error('No content_url returned');
  return url;
}

// ---------------------------------------------------------------------------
// ImageGrid
// ---------------------------------------------------------------------------

interface ImageGridProps {
  selectedUrl: string | null;
  onSelectedChange: (url: string | null) => void;
}

function ImageGrid({ selectedUrl, onSelectedChange }: ImageGridProps) {
  const [images, setImages]   = useState<ImageItem[]>([]);
  const [count, setCount]     = useState(0);
  const [offset, setOffset]   = useState(0);
  const [query, setQuery]     = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (nextOffset: number, nextQuery: string, replace: boolean) => {
    setLoading(true);
    const { items, count: total } = await searchImages(nextOffset, nextQuery);
    setImages(prev => replace ? items : [...prev, ...items]);
    setCount(total);
    setOffset(nextOffset);
    setLoading(false);
  }, []);

  useEffect(() => {
    onSelectedChange(null);
    void load(0, query, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

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
            const url = resolveUrl(img);
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
  licenseAgreed: boolean;
  onLicenseChange: (v: boolean) => void;
  onUploaded: (url: string) => void;
  triggerRef: React.MutableRefObject<(() => void) | null>;
}

const COPYRIGHT_TEXT =
  'I understand and confirm that all resources and assets created through the content editor or ' +
  'uploaded on the platform shall be available for free and public use without limitations on the ' +
  'platform (web portal, applications and any other end user interface that the platform would ' +
  'enable) and will be licensed under terms & conditions and policy guidelines of the platform. ' +
  'In doing so, the copyright and license of the original author is not infringed.';

function UploadTab({ licenseAgreed, onLicenseChange, onUploaded, triggerRef }: UploadTabProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging,  setDragging]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState('');

  // Expose trigger to parent for "Upload & Use" footer button
  useEffect(() => {
    triggerRef.current = () => fileRef.current?.click();
  }, [triggerRef]);

  const canUpload = licenseAgreed && !uploading;

  const handle = async (file: File | undefined) => {
    if (!file || !canUpload) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    if (file.size > 1024 * 1024)         { setError('File exceeds 1 MB limit.'); return; }
    setError('');
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onUploaded(url);
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
        onDragOver={e => { e.preventDefault(); if (canUpload) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); void handle(e.dataTransfer.files?.[0]); }}
        onClick={() => canUpload && fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--accent)' : canUpload ? '#c4c4c4' : 'var(--sb-border)'}`,
          borderRadius: 12, padding: '52px 40px', textAlign: 'center',
          cursor: canUpload ? 'pointer' : 'default',
          background: dragging ? 'var(--accent-soft)' : canUpload ? '#fafafa' : '#f9f9f9',
          opacity: licenseAgreed ? 1 : 0.55,
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

      {/* Copyright & License */}
      <div style={{
        borderTop: '1px solid var(--sb-border)', paddingTop: 16,
      }}>
        <label style={{ display: 'flex', gap: 12, cursor: 'pointer', alignItems: 'flex-start' }}>
          <input
            type="checkbox"
            checked={licenseAgreed}
            onChange={e => onLicenseChange(e.target.checked)}
            style={{ marginTop: 2, flexShrink: 0, accentColor: 'var(--accent)', width: 15, height: 15 }}
          />
          <span>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--sb-text)' }}>
              Copyright &amp; License
              <span style={{ color: 'var(--sb-red)', marginLeft: 2 }}>*</span>
            </span>
            <span style={{ display: 'block', fontSize: 13, color: 'var(--sb-text-2)', lineHeight: 1.65, marginTop: 6 }}>
              {COPYRIGHT_TEXT}
            </span>
          </span>
        </label>
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
  const [licenseAgreed, setLicenseAgreed] = useState(false);
  const uploadTriggerRef              = useRef<(() => void) | null>(null);

  // Reset selection / license when switching tabs
  const switchTab = (next: Tab) => {
    setTab(next);
    setSelectedUrl(null);
    if (next !== 'upload') setLicenseAgreed(false);
  };

  // Escape key to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

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
      }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#fff', borderRadius: 18,
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
        <div style={{ flex: 1, overflow: 'auto', padding: 24, minHeight: 0 }}>
          {tab === 'my'  && (
            <ImageGrid
              selectedUrl={selectedUrl}
              onSelectedChange={setSelectedUrl}
            />
          )}
          {tab === 'all' && (
            <ImageGrid
              selectedUrl={selectedUrl}
              onSelectedChange={setSelectedUrl}
            />
          )}
          {tab === 'upload' && (
            <UploadTab
              licenseAgreed={licenseAgreed}
              onLicenseChange={setLicenseAgreed}
              onUploaded={url => onSelect(url)}
              triggerRef={uploadTriggerRef}
            />
          )}
        </div>

        {/* ── Footer ──────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: 10, padding: '16px 24px', borderTop: '1px solid var(--sb-border)',
        }}>
          <button type="button" className="ce-btn ghost" onClick={onClose}>Cancel</button>
          {tab !== 'upload' ? (
            <button
              type="button"
              className="ce-btn primary"
              disabled={!selectedUrl}
              onClick={() => { if (selectedUrl) onSelect(selectedUrl); }}
            >
              Use Selected
            </button>
          ) : (
            <button
              type="button"
              className="ce-btn primary"
              disabled={!licenseAgreed}
              onClick={() => uploadTriggerRef.current?.()}
            >
              <Icon name="upload" size={15} />
              Upload &amp; Use
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
