import React, { useCallback, useRef, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import {
  Search,
  X,
  ChevronsRight,
  ArrowUpDown,
  Plus,
  Loader2,
} from 'lucide-react';
import { useLibrary } from '../../hooks/useLibrary';
import { useTreeStore } from '../../store/tree.store';
import { useEditorStore } from '../../store/editor.store';
import type { IContent } from '../../types/content';
import { QUESTION_FILTERS } from '../../types/content';
import styles from './LibraryDock.module.scss';

// =============================================================================
// Helpers
// =============================================================================

/**
 * Derive a short display label (e.g. "MCQ") from a primaryCategory string.
 */
function getCategoryBadge(primaryCategory?: string): string {
  const cat = (primaryCategory ?? '').toLowerCase();
  if (cat.includes('multiple choice')) return 'MCQ';
  if (cat.includes('multi select')) return 'MSQ';
  if (cat.includes('subjective')) return 'SA';
  if (cat.includes('fill in')) return 'FTB';
  if (cat.includes('match')) return 'MTF';
  if (cat.includes('sequence')) return 'SEQ';
  if (cat.includes('reorder')) return 'REO';
  return 'Q';
}

/**
 * CSS class suffix for coloring the type badge.
 */
function getBadgeVariant(primaryCategory?: string): string {
  const cat = (primaryCategory ?? '').toLowerCase();
  if (cat.includes('multiple choice')) return 'mcq';
  if (cat.includes('multi select')) return 'msq';
  if (cat.includes('subjective')) return 'sa';
  if (cat.includes('fill in')) return 'ftb';
  if (cat.includes('match')) return 'mtf';
  if (cat.includes('sequence')) return 'seq';
  if (cat.includes('reorder')) return 'reo';
  return 'default';
}

// =============================================================================
// Toast — lightweight ephemeral notification
// =============================================================================

interface ToastMessage {
  id: number;
  text: string;
  kind: 'success' | 'error';
}

let _toastIdCounter = 0;

function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const show = useCallback((text: string, kind: 'success' | 'error' = 'success') => {
    const id = ++_toastIdCounter;
    setToasts((prev) => [...prev, { id, text, kind }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2800);
  }, []);

  return { toasts, show };
}

// =============================================================================
// QuestionCard — draggable card for a single IContent item
// =============================================================================

interface QuestionCardProps {
  item: IContent;
  onAdd: (item: IContent) => void;
}

function QuestionCard({ item, onAdd }: QuestionCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.identifier,
    data: { item },
  });

  const badge = getCategoryBadge(item.primaryCategory);
  const badgeVariant = getBadgeVariant(item.primaryCategory);
  const displayName = (item.name ?? '').slice(0, 80);

  const handleAdd = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onAdd(item);
    },
    [item, onAdd],
  );

  return (
    <div
      ref={setNodeRef}
      className={[styles.card, isDragging ? styles.cardDragging : ''].filter(Boolean).join(' ')}
      {...attributes}
      {...listeners}
    >
      {/* Card header — type badge + add button */}
      <div className={styles.cardHeader}>
        <span className={[styles.typeBadge, styles[`typeBadge--${badgeVariant}`]].join(' ')}>
          {badge}
        </span>
        <button
          className={styles.addBtn}
          onClick={handleAdd}
          title="Add to question set"
          aria-label={`Add question: ${item.name}`}
          // Prevent drag from triggering on button click
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Question name */}
      <p className={styles.cardName}>{displayName || 'Untitled Question'}</p>

      {/* Card footer — difficulty badge if present */}
      {(item as IContent & { difficultyLevel?: string }).difficultyLevel && (
        <div className={styles.cardFooter}>
          <span className={styles.diffBadge}>
            {(item as IContent & { difficultyLevel?: string }).difficultyLevel}
          </span>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// LibraryDock Props
// =============================================================================

interface LibraryDockProps {
  /** Called when the user clicks the collapse button */
  onCollapse: () => void;
}

// =============================================================================
// LibraryDock
// =============================================================================

export function LibraryDock({ onCollapse }: LibraryDockProps) {
  // ── Hook: library data + actions ─────────────────────────────────────────
  const {
    content,
    isLoading,
    totalCount,
    activeFilter,
    searchQuery,
    sortAZ,
    hasMore,
    search,
    setFilter,
    toggleSort,
    loadMore,
  } = useLibrary();

  // ── Store: selected node for adding questions ─────────────────────────────
  const selectedNodeId = useTreeStore((s) => s.selectedNodeId);
  const addNode = useTreeStore((s) => s.addNode);
  const getNodeById = useTreeStore((s) => s.getNodeById);
  const editorMode = useEditorStore((s) => s.editorMode);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const { toasts, show: showToast } = useToast();

  // ── Search input local state (controlled) ─────────────────────────────────
  const [inputValue, setInputValue] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputValue(val);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => search(val), 300);
    },
    [search],
  );

  const handleClearSearch = useCallback(() => {
    setInputValue('');
    search('');
  }, [search]);

  // ── Add question to tree ──────────────────────────────────────────────────
  const handleAdd = useCallback(
    (item: IContent) => {
      // Resolve the target parent node: must be a folder/section, not a question leaf
      let targetId = selectedNodeId;
      if (targetId) {
        const node = getNodeById(targetId);
        if (node && !node.isFolder) {
          // Use the parent section instead
          targetId = node.parent ?? null;
        }
      }

      if (!targetId) {
        showToast('Select a section to add the question to', 'error');
        return;
      }

      const newId = addNode(targetId, 'question', item.primaryCategory);
      if (!newId) {
        showToast('Cannot add here — maximum depth reached', 'error');
      } else {
        showToast(`"${(item.name ?? 'Question').slice(0, 40)}" added`, 'success');
      }
    },
    [selectedNodeId, getNodeById, addNode, showToast],
  );

  // ── Render ────────────────────────────────────────────────────────────────
  const isReadOnly = editorMode !== 'edit';

  return (
    <div className={styles.dock} aria-label="Question Bank">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <span className={styles.headerTitle}>Question Bank</span>
        <button
          className={styles.collapseBtn}
          onClick={onCollapse}
          title="Collapse library"
          aria-label="Collapse library panel"
        >
          <ChevronsRight size={16} />
        </button>
      </div>

      {/* ── Search bar ─────────────────────────────────────────────────────── */}
      <div className={styles.searchRow}>
        <div className={styles.searchInput}>
          <Search size={14} className={styles.searchIcon} aria-hidden="true" />
          <input
            className={styles.input}
            type="search"
            placeholder="Search questions…"
            value={inputValue}
            onChange={handleSearchChange}
            aria-label="Search questions"
          />
          {inputValue && (
            <button
              className={styles.clearBtn}
              onClick={handleClearSearch}
              aria-label="Clear search"
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Filter chips ───────────────────────────────────────────────────── */}
      <div className={styles.filterRow} aria-label="Filter by question type">
        {QUESTION_FILTERS.map((f) => (
          <button
            key={f.value}
            className={[
              styles.filterChip,
              activeFilter === f.value ? styles.filterChipActive : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setFilter(f.value)}
            aria-pressed={activeFilter === f.value}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Sort + count row ───────────────────────────────────────────────── */}
      <div className={styles.sortRow}>
        <span className={styles.countLabel} aria-live="polite">
          {totalCount} question{totalCount !== 1 ? 's' : ''}
        </span>
        <button
          className={styles.sortBtn}
          onClick={toggleSort}
          title={sortAZ ? 'Switch to recent first' : 'Sort A–Z'}
          aria-pressed={sortAZ}
        >
          <ArrowUpDown size={12} aria-hidden="true" />
          <span>{sortAZ ? 'A–Z' : 'Recent'}</span>
        </button>
      </div>

      {/* ── Question list ──────────────────────────────────────────────────── */}
      <div className={styles.list} role="list" aria-label="Question list">
        {isLoading && content.length === 0 ? (
          <div className={styles.loadingState} role="status">
            <Loader2 size={20} className={styles.spinner} aria-hidden="true" />
            <span>Loading questions…</span>
          </div>
        ) : content.length === 0 ? (
          <p className={styles.emptyState}>
            No questions found. Try a different search.
          </p>
        ) : (
          <>
            {content.map((item) => (
              <div key={item.identifier} role="listitem">
                <QuestionCard
                  item={item}
                  onAdd={isReadOnly ? () => {} : handleAdd}
                />
              </div>
            ))}

            {/* Load more */}
            {hasMore && (
              <button
                className={styles.loadMoreBtn}
                onClick={loadMore}
                disabled={isLoading}
                aria-label="Load more questions"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={13} className={styles.spinner} aria-hidden="true" />
                    Loading…
                  </>
                ) : (
                  'Load more'
                )}
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Toast container ────────────────────────────────────────────────── */}
      {toasts.length > 0 && (
        <div className={styles.toastContainer} aria-live="assertive" aria-atomic="true">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={[styles.toast, styles[`toast--${t.kind}`]].join(' ')}
              role="alert"
            >
              {t.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LibraryDock;
