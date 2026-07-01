import React, { useState, useCallback } from 'react';
import { Icon } from '../shared/Icon';
import { useTreeStore } from '../../store/tree.store';
import { useEditorStore } from '../../store/editor.store';
import { useUiStore } from '../../store/ui.store';
import type { INode } from '../../types/editor';
import { QUESTION_TYPE_LABELS } from '../../types/question';
import { detectNodeKind } from '../../utils/nodeKind';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface OutlineTreeProps {
  onCollapse: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------


function shortTypeLabel(questionType?: string): string {
  if (!questionType) return '';
  const full = QUESTION_TYPE_LABELS[questionType as keyof typeof QUESTION_TYPE_LABELS];
  if (!full) return questionType.toUpperCase();
  const map: Record<string, string> = {
    'Multiple Choice': 'MCQ', 'Multi-Select': 'MSQ', 'Subjective Answer': 'SA',
    'Fill in the Blank': 'FTB', 'Match the Following': 'MTF',
    'Sequence': 'SEQ', 'Reorder': 'REO', 'Slider / Rating': 'SLDR',
  };
  return map[full] ?? questionType.toUpperCase().slice(0, 3);
}

function getStatusClass(status?: string): string {
  return (status ?? '').toLowerCase() === 'live' ? 'ready' : 'draft';
}

// ---------------------------------------------------------------------------
// Context menu
// ---------------------------------------------------------------------------

interface ContextMenuProps {
  isRoot: boolean;
  isFolder: boolean;
  isEditMode: boolean;
  nodeId: string;
  onClose: () => void;
  onAddSection: () => void;
  onAddQuestion: () => void;
  onDelete: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  isRoot, isFolder, isEditMode, onClose, onAddSection, onAddQuestion, onDelete,
}) => {
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('[data-ctxmenu]');
      if (!el) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      data-ctxmenu="true"
      style={{
        position: 'absolute', right: 0, top: '100%', zIndex: 200,
        background: '#fff', border: '1px solid var(--sb-border)', borderRadius: 12,
        boxShadow: 'var(--sb-shadow-deep)', padding: 6, minWidth: 160,
      }}
    >
      {isFolder && isEditMode && (
        <button
          style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '9px 11px', border: 'none', background: 'transparent', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, textAlign: 'left', color: 'var(--sb-text-2)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-soft)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          onClick={() => { onAddQuestion(); onClose(); }}
        >
          <Icon name="plus" size={13} /> Add Question
        </button>
      )}
      {isRoot && isEditMode && (
        <button
          style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '9px 11px', border: 'none', background: 'transparent', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, textAlign: 'left', color: 'var(--sb-text-2)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-soft)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          onClick={() => { onAddSection(); onClose(); }}
        >
          <Icon name="plus" size={13} /> Add Section
        </button>
      )}
      {!isRoot && isEditMode && (
        <button
          style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '9px 11px', border: 'none', background: 'transparent', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, textAlign: 'left', color: 'var(--sb-red)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--sb-red-soft)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          onClick={() => { onDelete(); onClose(); }}
        >
          <Icon name="trash" size={13} /> Delete
        </button>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Recursive node renderer
// ---------------------------------------------------------------------------

interface NodeProps {
  node: INode;
  selectedId: string | null;
  openIds: Set<string>;
  contextMenuId: string | null;
  isEditMode: boolean;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onOpenCtx: (id: string) => void;
  onCloseCtx: () => void;
  onAddSection: (parentId: string) => void;
  onAddQuestion: (parentId: string) => void;
  onDelete: (id: string) => void;
}

const TreeNode: React.FC<NodeProps> = ({
  node, selectedId, openIds, contextMenuId, isEditMode,
  onSelect, onToggle, onOpenCtx, onCloseCtx,
  onAddSection, onAddQuestion, onDelete,
}) => {
  const kind = detectNodeKind(node);
  const isRoot = kind === 'root';
  const isSection = kind === 'section';
  const isQuestion = kind === 'question';
  const isSelected = node.id === selectedId;
  const isOpen = openIds.has(node.id);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const isCtxOpen = contextMenuId === node.id;
  const canExpand = (isRoot || isSection) && hasChildren;

  const nodeType = isRoot ? 'set' : isSection ? 'section' : 'question';
  const className = `ce-node ${nodeType}${isSelected ? ' active' : ''}`;

  return (
    <>
      {/* div instead of button to allow nested buttons (context menu) */}
      <div
        className={className}
        onClick={() => { onSelect(node.id); if (canExpand) onToggle(node.id); }}
        aria-selected={isSelected}
        role="treeitem"
        tabIndex={0}
        aria-expanded={canExpand ? isOpen : undefined}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(node.id); if (canExpand) onToggle(node.id); } }}
      >
        {/* Expand / collapse twist */}
        <span
          className={`twist${canExpand ? (isOpen ? ' open' : ' closed') : ' leaf'}`}
          onClick={e => { e.stopPropagation(); if (canExpand) onToggle(node.id); }}
        >
          <Icon name="caret" size={13} />
        </span>

        {/* Icon — only for root and section, NOT for questions */}
        {isRoot && (
          <span className="ico">
            <Icon name="book" size={15} />
          </span>
        )}
        {isSection && (
          <span className="ico">
            <Icon name="folder" size={14} />
          </span>
        )}

        {/* Question type label (questions only) */}
        {isQuestion && (
          <span className="type">{shortTypeLabel(node.questionType ?? (node.metadata?.questionType as string))}</span>
        )}

        {/* Name */}
        <span className="nm">{node.name}</span>

        {/* Question count badge (sections only, not root) */}
        {isSection && (
          <span className="qbadge">{node.children?.length ?? 0}</span>
        )}

        {/* Status dot (questions only) */}
        {isQuestion && (
          <span className={`stat ${getStatusClass(node.status ?? (node.metadata?.status as string))}`} />
        )}

        {/* Context menu */}
        {isEditMode && (
          <div style={{ position: 'relative', marginLeft: isQuestion ? undefined : '2px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <button
              style={{
                width: 26, height: 26, borderRadius: 7, border: 'none', background: 'transparent',
                cursor: 'pointer', display: 'grid', placeItems: 'center',
                color: 'var(--sb-text-faint)', opacity: isCtxOpen ? 1 : undefined,
              }}
              className="ce-ctx-btn"
              onClick={e => { e.stopPropagation(); isCtxOpen ? onCloseCtx() : onOpenCtx(node.id); }}
              aria-label="Node options"
            >
              <Icon name="more" size={14} />
            </button>
            {isCtxOpen && (
              <ContextMenu
                isRoot={isRoot}
                isFolder={isSection}
                isEditMode={isEditMode}
                nodeId={node.id}
                onClose={onCloseCtx}
                onAddSection={() => onAddSection(node.id)}
                onAddQuestion={() => onAddQuestion(node.id)}
                onDelete={() => onDelete(node.id)}
              />
            )}
          </div>
        )}
      </div>

      {/* Children */}
      {canExpand && isOpen && (
        <div className="ce-children" role="group">
          {node.children!.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              openIds={openIds}
              contextMenuId={contextMenuId}
              isEditMode={isEditMode}
              onSelect={onSelect}
              onToggle={onToggle}
              onOpenCtx={onOpenCtx}
              onCloseCtx={onCloseCtx}
              onAddSection={onAddSection}
              onAddQuestion={onAddQuestion}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------
// OutlineTree
// ---------------------------------------------------------------------------

const OutlineTree: React.FC<OutlineTreeProps> = ({ onCollapse }) => {
  const treeData = useTreeStore((s) => s.treeData);
  const selectedNodeId = useTreeStore((s) => s.selectedNodeId);
  const selectNode = useTreeStore((s) => s.selectNode);
  const addNode = useTreeStore((s) => s.addNode);
  const deleteNode = useTreeStore((s) => s.deleteNode);
  const editorMode = useEditorStore((s) => s.editorMode);
  const { openModal } = useUiStore();

  const isEditMode = editorMode === 'edit';

  // Open root + all sections by default
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    function collect(nodes: typeof treeData) {
      nodes.forEach(n => {
        const kind = detectNodeKind(n);
        if (kind === 'root' || kind === 'section') ids.add(n.id);
        if (n.children) collect(n.children);
      });
    }
    collect(treeData);
    return ids;
  });
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);

  const handleToggle = useCallback((id: string) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleSelect = useCallback((id: string) => {
    selectNode(id);
  }, [selectNode]);

  const handleAddSection = useCallback((parentId: string) => {
    addNode(parentId, 'section');
  }, [addNode]);

  const handleAddQuestion = useCallback((parentId: string) => {
    openModal('questionTypeSelector', { parentId });
  }, [openModal]);

  const handleDelete = useCallback((id: string) => {
    openModal('confirmDelete', { nodeId: id });
  }, [openModal]);

  const rootId = treeData[0]?.id;

  // Determine selected node kind to conditionally disable footer buttons
  const selectedNode = selectedNodeId
    ? useTreeStore.getState().getNodeById(selectedNodeId)
    : null;
  const selectedKind = selectedNode ? detectNodeKind(selectedNode) : null;
  const addSectionDisabled  = selectedKind === 'section' || selectedKind === 'question';
  const addQuestionDisabled = selectedKind === 'root'    || selectedKind === 'question';

  // Resolve parent for "Add Question" (only used when not disabled)
  const questionParentId = selectedKind === 'section'
    ? (selectedNodeId ?? rootId)
    : rootId;

  return (
    <>
      <div className="ce-tree-head">
        <span className="lbl">Hierarchy</span>
        <button title="Collapse" onClick={onCollapse} aria-label="Collapse outline">
          <Icon name="panel-left" size={17} />
        </button>
      </div>

      <div className="ce-tree-scroll" role="tree" aria-label="Question set outline">
        {treeData.length === 0 ? (
          <p style={{ padding: '16px 12px', fontSize: 13, color: 'var(--sb-text-faint)', fontStyle: 'italic' }}>
            No content yet.
          </p>
        ) : (
          treeData.map(node => (
            <TreeNode
              key={node.id}
              node={node}
              selectedId={selectedNodeId}
              openIds={openIds}
              contextMenuId={contextMenuId}
              isEditMode={isEditMode}
              onSelect={handleSelect}
              onToggle={handleToggle}
              onOpenCtx={setContextMenuId}
              onCloseCtx={() => setContextMenuId(null)}
              onAddSection={handleAddSection}
              onAddQuestion={handleAddQuestion}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {isEditMode && rootId && (
        <div className="ce-tree-foot">
          <button
            onClick={() => handleAddSection(rootId)}
            disabled={addSectionDisabled}
            style={addSectionDisabled ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
          >
            <Icon name="plus" size={15} />Add Section
          </button>
          <button
            onClick={() => handleAddQuestion(questionParentId ?? rootId)}
            disabled={addQuestionDisabled}
            style={addQuestionDisabled ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
          >
            <Icon name="plus" size={15} />Add Question
          </button>
        </div>
      )}
    </>
  );
};

export default OutlineTree;
