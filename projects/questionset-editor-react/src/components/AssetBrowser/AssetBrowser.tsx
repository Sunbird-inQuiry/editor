import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Upload as UploadIcon, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '../../api/client';
import { URLS } from '../../api/urls';
import { useEditorStore } from '../../store/editor.store';
import { uploadAsset } from '../../api/asset';
import { getUserFullName } from '../../utils/context';
import styles from './AssetBrowser.module.scss';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AssetBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: { url: string; name: string; id: string; thumbnail?: string }) => void;
  mediaType?: 'image' | 'audio' | 'video';
  channel: string;
  userId: string;
}

interface IAssetItem {
  identifier: string;
  name: string;
  downloadUrl?: string;
  thumbnail?: string;  appIcon?: string;
}

type Tab = 'my-assets' | 'upload';

const LIMIT = 20;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AssetBrowser: React.FC<AssetBrowserProps> = ({
  isOpen,
  onClose,
  onSelect,
  mediaType = 'image',
  channel,
  userId,
}) => {
  // ---- Tab state ------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<Tab>('my-assets');

  // ---- My Assets state ------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [assets, setAssets] = useState<IAssetItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // ---- Upload state ---------------------------------------------------------
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [assetName, setAssetName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Body scroll lock -----------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // ---- Escape key -----------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // ---- Reset state when modal closes ----------------------------------------
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('my-assets');
      setSearchQuery('');
      setAssets([]);
      setOffset(0);
      setHasMore(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setAssetName('');
      setUploadError(null);
      setSearchError(null);
    }
  }, [isOpen]);

  // ---- Search assets (reset on query change) --------------------------------
  const fetchAssets = useCallback(
    async (query: string, currentOffset: number, append: boolean) => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const response = await apiClient.post(URLS.composite.search, {
          request: {
            filters: {
              mediaType,
              createdBy: userId,
            },
            query: query || undefined,
            limit: LIMIT,
            offset: currentOffset,
          },
        });
        const content: IAssetItem[] = response.data?.result?.content ?? [];
        const count: number = response.data?.result?.count ?? 0;
        setAssets((prev) => (append ? [...prev, ...content] : content));
        setOffset(currentOffset + content.length);
        setHasMore(currentOffset + content.length < count);
      } catch {
        setSearchError('Failed to load assets. Please try again.');
      } finally {
        setIsSearching(false);
      }
    },
    [mediaType, userId],
  );

  // Re-fetch when debounced query changes (only when tab is visible)
  useEffect(() => {
    if (!isOpen || activeTab !== 'my-assets') return;
    setOffset(0);
    setAssets([]);
    fetchAssets(debouncedQuery, 0, false);
  }, [isOpen, activeTab, debouncedQuery, fetchAssets]);

  // ---- Load more ------------------------------------------------------------
  const handleLoadMore = () => {
    fetchAssets(debouncedQuery, offset, true);
  };

  // ---- Asset selection ------------------------------------------------------
  const handleAssetSelect = (asset: IAssetItem) => {
    const url = asset.downloadUrl ?? asset.thumbnail ?? '';
    onSelect({ url, name: asset.name, id: asset.identifier, thumbnail: asset.thumbnail ?? asset.appIcon });
    onClose();
  };

  // ---- File input change ----------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setUploadError(null);
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError('File exceeds the 5 MB size limit.');
      setSelectedFile(null);
      setPreviewUrl(null);
      // Reset input so the same file can be re-selected after error clear
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setSelectedFile(file);
    setAssetName(file.name.replace(/\.[^.]+$/, ''));
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // Revoke object URL on unmount / file change
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ---- Upload ---------------------------------------------------------------
  const handleUpload = async () => {
    if (!selectedFile || !assetName.trim()) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const presignedHeaders =
        useEditorStore.getState().editorConfig?.context?.cloudStorage?.presigned_headers ?? {};
      const url = await uploadAsset(
        selectedFile, channel, userId, presignedHeaders,
        getUserFullName(useEditorStore.getState().editorConfig?.context),
      );
      onSelect({ url, name: assetName.trim(), id: url.match(/(do_[A-Za-z0-9]+)/)?.[1] ?? '' });
      onClose();
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // ---- Tab change -----------------------------------------------------------
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  // ---- Overlay click --------------------------------------------------------
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // ---- Render ---------------------------------------------------------------
  if (!isOpen) return null;

  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  if (!portalTarget) return null;

  return createPortal(
    <div
      className={styles.modalOverlay}
      role="presentation"
      onClick={handleOverlayClick}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Asset Browser"
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <span>Asset Browser</span>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close asset browser"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs} role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'my-assets'}
            className={`${styles.tab}${activeTab === 'my-assets' ? ` ${styles.tabActive}` : ''}`}
            onClick={() => handleTabChange('my-assets')}
          >
            My Assets
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'upload'}
            className={`${styles.tab}${activeTab === 'upload' ? ` ${styles.tabActive}` : ''}`}
            onClick={() => handleTabChange('upload')}
          >
            Upload
          </button>
        </div>

        {/* Tab panels */}
        <div className={styles.tabBody}>
          {/* ---- My Assets ---- */}
          {activeTab === 'my-assets' && (
            <div role="tabpanel">
              <div className={styles.searchRow}>
                <Search size={16} className={styles.searchIcon} aria-hidden="true" />
                <input
                  type="search"
                  className={styles.searchInput}
                  placeholder="Search assets…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search assets"
                />
              </div>

              {isSearching && assets.length === 0 && (
                <div className={styles.statusMessage}>Loading…</div>
              )}

              {searchError && (
                <div className={styles.errorMessage}>{searchError}</div>
              )}

              {!isSearching && !searchError && assets.length === 0 && (
                <div className={styles.statusMessage}>No assets found.</div>
              )}

              {assets.length > 0 && (
                <div className={styles.grid} role="list">
                  {assets.map((asset) => (
                    <button
                      key={asset.identifier}
                      type="button"
                      role="listitem"
                      className={styles.thumb}
                      onClick={() => handleAssetSelect(asset)}
                      title={asset.name}
                    >
                      {asset.downloadUrl || asset.thumbnail ? (
                        <img
                          src={asset.downloadUrl ?? asset.thumbnail}
                          alt={asset.name}
                          className={styles.thumbImg}
                          loading="lazy"
                        />
                      ) : (
                        <span className={styles.thumbPlaceholder}>
                          <ImageIcon size={28} aria-hidden="true" />
                        </span>
                      )}
                      <span className={styles.thumbName}>{asset.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {hasMore && (
                <div className={styles.loadMoreRow}>
                  <button
                    type="button"
                    className={styles.loadMoreBtn}
                    onClick={handleLoadMore}
                    disabled={isSearching}
                  >
                    {isSearching ? 'Loading…' : 'Load more'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ---- Upload ---- */}
          {activeTab === 'upload' && (
            <div role="tabpanel">
              <div
                className={styles.uploadZone}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                }}
                role="button"
                tabIndex={0}
                aria-label="Click to choose a file"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className={styles.uploadPreview}
                  />
                ) : (
                  <div className={styles.uploadZonePlaceholder}>
                    <UploadIcon size={32} aria-hidden="true" />
                    <span>Click to choose an image</span>
                    <span className={styles.uploadHint}>Max 5 MB · PNG, JPG, GIF, SVG…</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className={styles.hiddenInput}
                  onChange={handleFileChange}
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </div>

              <div className={styles.uploadActions}>
                <label className={styles.uploadLabel} htmlFor="asset-name-input">
                  Asset name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="asset-name-input"
                  type="text"
                  className={styles.nameInput}
                  placeholder="Enter a name…"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  disabled={isUploading}
                />

                {uploadError && (
                  <div className={styles.errorMessage} role="alert">
                    {uploadError}
                  </div>
                )}

                <button
                  type="button"
                  className={styles.uploadBtn}
                  onClick={handleUpload}
                  disabled={!selectedFile || !assetName.trim() || isUploading}
                  aria-busy={isUploading}
                >
                  {isUploading ? 'Uploading…' : 'Upload'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    portalTarget,
  );
};

export default AssetBrowser;
