import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Tree } from 'react-arborist';
import type { NodeRendererProps, MoveHandler } from 'react-arborist';
import {
  BookOpen,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  ChevronsLeft,
  MoreVertical,
  Plus,
  Trash2,
  CircleDot,
  CheckSquare,
  AlignLeft,
  Underline,
  Shuffle,
  List,
  ArrowUpDown,
  GripVertical,
} from 'lucide-react';
import { useTreeStore } from '../../store/tree.store';
import { useEditorStore } from '../../store/editor.store';
import { useUiStore } from '../../store/ui.store';
import type { INode } from '../../types/editor';
import { QUESTION_TYPE_ICONS, type QuestionType } from '../../types/question';
import styles from './OutlineTree.module.scss';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface OutlineTreeProps {
  /** Called when the user clicks the collapse button */
  onCollapse: () => void;
}

// ---------------------------------------------------------------------------
// Helpers — lucide icon lookup by name string
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, React.ElementType> = {
  CircleDot,
  CheckSquare,
  AlignLeft,
  Underline,
  Shuffle,
  List,
  ArrowUpDown,
};

function QuestionTypeIcon({
  questionType,
  size = 14,
}: {
  questionType: string;
  size?: number;
}) {
  const iconName = QUESTION_TYPE_ICONS[questionType as QuestionType] ?? 'CircleDot';
  const IconComponent = ICON_MAP[iconName] ?? CircleDot;
  return <IconComponent size={size} />;
}

// ---------------------------------------------------------------------------
// Status dot color
// ---------------------------------------------------------------------------

function getStatusDotColor(status?: string): string {
  switch ((status ?? '').toLowerCase()) {
    case 'live':
      return '#059669'; // green
    case 'review':
      return '#D97706'; // amber
    default:
      return '#9CA3AF'; // gray (Draft / unknown)
  }
}

// ---------------------------------------------------------------------------
// Inline name editor
// ---------------------------------------------------------------------------

interface InlineNameEditorProps {
  value: string;
  onCommit: (name: string) => void;
  onCancel: () => void;
}

const InlineNameEditor: React.FC<InlineNameEditorProps> = ({ value, onCommit, onCancel }) => {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  const commit = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed) onCommit(trimmed);
    else onCancel();
  }, [draft, onCommit, onCancel]);

  return (
    <input
      ref={inputRef}
      className={styles.nameInput}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') onCancel();
        e.stopPropagation();
      }}
      onClick={(e) => e.stopPropagation()}
    />
  );
};

// ---------------------------------------------------------------------------
// Context menu
// ---------------------------------------------------------------------------

interface ContextMenuProps {
  isRoot: boolean;
  isFolder: boolean;
  isEditMode: boolean;
  onClose: () => void;
  onAddSection: () => void;
  onAddQuestion: () => void;
  onDelete: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  isRoot,
  isFolder,
  isEditMode,
  onClose,
  onAddSection,
  onAddQuestion,
  onDelete,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div className={styles.contextMenu} ref={menuRef} role="menu">
      {isRoot && isEditMode && (
        <button
          className={styles.contextMenuItem}
          role="menuitem"
          onClick={(e) => {
            e.stopPropagation();
            onAddSection();
            onClose();
          }}
        >
          <Plus size={13} />
          Add Section
        </button>
      )}
      {(isRoot || isFolder) && isEditMode && (
        <button
          className={styles.contextMenuItem}
          role="menuitem"
          onClick={(e) => {
            e.stopPropagation();
            onAddQuestion();
            onClose();
          }}
        >
          <Plus size={13} />
          Add Question
        </button>
      )}
      {!isRoot && isEditMode && (
        <button
          className={`${styles.contextMenuItem} ${styles.contextMenuItemDanger}`}
          role="menuitem"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
            onClose();
          }}
        >
          <Trash2 size={13} />
          Delete
        </button>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Per-node renderer — injected extra props via a closure in OutlineTree
// ---------------------------------------------------------------------------

type ExtraNodeProps = {
  editingNodeId: string | null;
  contextMenuNodeId: string | null;
  editorMode: string;
  onStartEdit: (id: string) => void;
  onCommitEdit: (id: string, name: string) => void;
  onCancelEdit: () => void;
  onOpenContextMenu: (id: string, e: React.MouseEvent) => void;
  onCloseContextMenu: () => void;
  onAddSection: (parentId: string) => void;
  onAddQuestion: (parentId: string) => void;
  onDeleteNode: (id: string) => void;
  onSelectNode: (id: string) => void;
};

function makeNodeRenderer(extra: ExtraNodeProps) {
  // eslint-disable-next-line react/display-name
  return function NodeRow({ node, style, dragHandle }: NodeRendererProps<INode>) {
    const iNode = node.data;
    const depth = node.level;
    const isRoot = !iNode.parent;
    const isFolder = iNode.isFolder ?? false;
    const isSelected = node.isSelected;
    const isEditing = extra.editingNodeId === node.id;
    const isContextOpen = extra.contextMenuNodeId === node.id;
    const isEditMode = extra.editorMode === 'edit';
    const status = (iNode.metadata?.status ?? iNode.status) as string | undefined;

    // Choose node icon
    let nodeIcon: React.ReactNode;
    if (isRoot) {
      nodeIcon = <BookOpen size={14} className={styles.nodeIconBlue} />;
    } else if (isFolder) {
      nodeIcon = node.isOpen ? (
        <FolderOpen size={14} className={styles.nodeIconAmber} />
      ) : (
        <Folder size={14} className={styles.nodeIconAmber} />
      );
    } else {
      nodeIcon = (
        <span className={styles.nodeIconQuestion}>
          <QuestionTypeIcon questionType={iNode.questionType ?? 'mcq'} size={14} />
        </span>
      );
    }

    const isExpandable = (iNode.children?.length ?? 0) > 0 || isFolder;

    return (
      <div
        style={style}
        className={[
          styles.nodeRow,
          isSelected ? styles.nodeRowSelected : '',
          isEditMode ? styles.nodeRowEditable : '',
        ].join(' ')}
        onClick={(e) => {
          e.stopPropagation();
          extra.onSelectNode(node.id);
          node.select();
        }}
        onDoubleClick={(e) => {
          if (!isEditMode) return;
          e.stopPropagation();
          extra.onStartEdit(node.id);
        }}
        aria-selected={isSelected}
        role="treeitem"
        aria-expanded={isExpandable ? node.isOpen : undefined}
      >
        {/* Drag handle — edit mode only */}
        {isEditMode && (
          <div
            ref={dragHandle}
            className={styles.dragHandle}
            title="Drag to reorder"
            aria-hidden="true"
          >
            <GripVertical size={12} />
          </div>
        )}

        {/* Indentation */}
        <span
          className={styles.nodeIndent}
          style={{ width: depth * 16 }}
          aria-hidden="true"
        />

        {/* Expand / collapse chevron */}
        <button
          className={styles.expandBtn}
          onClick={(e) => {
            e.stopPropagation();
            node.toggle();
          }}
          tabIndex={isExpandable ? 0 : -1}
          style={{ visibility: isExpandable ? 'visible' : 'hidden' }}
          aria-label={node.isOpen ? 'Collapse' : 'Expand'}
        >
          {node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Node type icon */}
        <span className={styles.nodeIcon} aria-hidden="true">
          {nodeIcon}
        </span>

        {/* Name — inline editor or label */}
        <span className={styles.nodeName}>
          {isEditing ? (
            <InlineNameEditor
              value={iNode.name}
              onCommit={(name) => extra.onCommitEdit(node.id, name)}
              onCancel={extra.onCancelEdit}
            />
          ) : (
            <span className={styles.nodeNameText} title={iNode.name}>
              {iNode.name}
            </span>
          )}
        </span>

        {/* Status dot */}
        <span
          className={styles.statusDot}
          style={{ backgroundColor: getStatusDotColor(status) }}
          title={status ?? 'Draft'}
          aria-label={`Status: ${status ?? 'Draft'}`}
        />

        {/* Context menu button — shown on hover in edit mode */}
        {isEditMode && !isEditing && (
          <div className={styles.contextMenuWrapper}>
            <button
              className={styles.contextMenuBtn}
              onClick={(e) => {
                e.stopPropagation();
                extra.onOpenContextMenu(node.id, e);
              }}
              aria-label="Node options"
              aria-haspopup="menu"
              aria-expanded={isContextOpen}
            >
              <MoreVertical size={14} />
            </button>

            {isContextOpen && (
              <ContextMenu
                isRoot={isRoot}
                isFolder={isFolder}
                isEditMode={isEditMode}
                onClose={extra.onCloseContextMenu}
                onAddSection={() => extra.onAddSection(node.id)}
                onAddQuestion={() => extra.onAddQuestion(node.id)}
                onDelete={() => extra.onDeleteNode(node.id)}
              />
            )}
          </div>
        )}
      </div>
    );
  };
}

// ---------------------------------------------------------------------------
// OutlineTree — main component
// ---------------------------------------------------------------------------

const OutlineTree: React.FC<OutlineTreeProps> = ({ onCollapse }) => {
  const treeData = useTreeStore((s) => s.treeData);
  const selectedNodeId = useTreeStore((s) => s.selectedNodeId);
  const selectNode = useTreeStore((s) => s.selectNode);
  const addNode = useTreeStore((s) => s.addNode);
  const deleteNode = useTreeStore((s) => s.deleteNode);
  const updateNode = useTreeStore((s) => s.updateNode);
  const reorderChildren = useTreeStore((s) => s.reorderChildren);

  const editorMode = useEditorStore((s) => s.editorMode);
  const { openModal } = useUiStore();

  const isEditMode = editorMode === 'edit';

  // ── Local UI state ──────────────────────────────────────────────────────────
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [contextMenuNodeId, setContextMenuNodeId] = useState<string | null>(null);

  // ── Container height tracking via ResizeObserver ────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const [treeHeight, setTreeHeight] = useState(400);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setTreeHeight(entry.contentRect.height);
    });
    ro.observe(el);
    setTreeHeight(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSelect = useCallback(
    (nodes: Array<{ id: string }>) => {
      const first = nodes[0];
      if (first && first.id !== selectedNodeId) {
        selectNode(first.id);
      }
    },
    [selectedNodeId, selectNode],
  );

  const handleMove: MoveHandler<INode> = useCallback(
    ({ parentId, parentNode, index, dragIds }) => {
      if (!parentId) return;
      // Find the current children of the parent node
      const parentData = parentNode?.data;
      const children = parentData?.children ?? [];
      dragIds.forEach((dragId) => {
        const fromIndex = children.findIndex((c) => c.id === dragId);
        if (fromIndex !== -1) {
          reorderChildren(parentId, fromIndex, index);
        }
      });
    },
    [reorderChildren],
  );

  const handleStartEdit = useCallback((id: string) => {
    setEditingNodeId(id);
    setContextMenuNodeId(null);
  }, []);

  const handleCommitEdit = useCallback(
    (id: string, name: string) => {
      updateNode(id, { name });
      setEditingNodeId(null);
    },
    [updateNode],
  );

  const handleCancelEdit = useCallback(() => {
    setEditingNodeId(null);
  }, []);

  const handleOpenContextMenu = useCallback((id: string, _e: React.MouseEvent) => {
    setContextMenuNodeId((prev) => (prev === id ? null : id));
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenuNodeId(null);
  }, []);

  const handleAddSection = useCallback(
    (parentId: string) => {
      addNode(parentId, 'section');
    },
    [addNode],
  );

  const handleAddQuestion = useCallback(
    (parentId: string) => {
      openModal('questionTypeSelector', { parentId });
    },
    [openModal],
  );

  const handleDeleteNode = useCallback(
    (id: string) => {
      openModal('confirmDelete', { nodeId: id });
    },
    [openModal],
  );

  const handleSelectNode = useCallback(
    (id: string) => {
      selectNode(id);
    },
    [selectNode],
  );

  // ── Node renderer — rebuilt only when shared state changes ──────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const NodeRow = React.useMemo(
    () =>
      makeNodeRenderer({
        editingNodeId,
        contextMenuNodeId,
        editorMode,
        onStartEdit: handleStartEdit,
        onCommitEdit: handleCommitEdit,
        onCancelEdit: handleCancelEdit,
        onOpenContextMenu: handleOpenContextMenu,
        onCloseContextMenu: handleCloseContextMenu,
        onAddSection: handleAddSection,
        onAddQuestion: handleAddQuestion,
        onDeleteNode: handleDeleteNode,
        onSelectNode: handleSelectNode,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      editingNodeId,
      contextMenuNodeId,
      editorMode,
      handleStartEdit,
      handleCommitEdit,
      handleCancelEdit,
      handleOpenContextMenu,
      handleCloseContextMenu,
      handleAddSection,
      handleAddQuestion,
      handleDeleteNode,
      handleSelectNode,
    ],
  );

  // ── Root node id for "Add Section" bottom button ────────────────────────────
  const rootId = treeData[0]?.id;
  const isEmpty = treeData.length === 0;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.panel} role="navigation" aria-label="Question set outline">
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.headerTitle}>Outline</span>
        <button
          className={styles.collapseBtn}
          onClick={onCollapse}
          title="Collapse outline"
          aria-label="Collapse outline panel"
        >
          <ChevronsLeft size={16} />
        </button>
      </div>

      {/* Tree area */}
      <div className={styles.tree} ref={containerRef}>
        {isEmpty ? (
          <p className={styles.emptyState}>
            No questions yet. Add a section to get started.
          </p>
        ) : (
          <Tree<INode>
            data={treeData}
            selection={selectedNodeId ?? undefined}
            onSelect={handleSelect}
            onMove={handleMove}
            height={treeHeight}
            rowHeight={36}
            indent={0}
            disableDrag={!isEditMode}
            disableDrop={!isEditMode}
            openByDefault={true}
          >
            {NodeRow}
          </Tree>
        )}
      </div>

      {/* Add Section button — bottom bar, edit mode only */}
      {isEditMode && rootId && (
        <div className={styles.addBar}>
          <button
            className={styles.addBtn}
            onClick={() => handleAddSection(rootId)}
            aria-label="Add a new section"
          >
            <Plus size={14} />
            Add Section
          </button>
        </div>
      )}
    </div>
  );
};

export default OutlineTree;
