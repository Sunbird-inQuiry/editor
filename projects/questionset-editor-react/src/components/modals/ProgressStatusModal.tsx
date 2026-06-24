import React, { useMemo } from 'react';
import { BookOpen, CheckCircle2, FolderOpen, HelpCircle, XCircle } from 'lucide-react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { useTreeStore } from '../../store/tree.store';
import type { INode } from '../../types/editor';
import styles from './ProgressStatusModal.module.scss';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface ProgressStatusModalProps {
  onClose: () => void;
}

interface TreeStats {
  totalSections: number;
  totalQuestions: number;
  completedQuestions: number;
  incompleteQuestions: number;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
    unset: number;
  };
}

// -----------------------------------------------------------------------------
// Tree traversal helpers
// -----------------------------------------------------------------------------

function collectStats(nodes: INode[], isRoot = true): TreeStats {
  let totalSections = 0;
  let totalQuestions = 0;
  let completedQuestions = 0;
  const difficulty = { easy: 0, medium: 0, hard: 0, unset: 0 };

  function traverse(nodeList: INode[], depth: number): void {
    for (const node of nodeList) {
      if (node.isFolder) {
        // Skip root node itself when counting sections
        if (!isRoot || depth > 0) {
          totalSections += 1;
        }
        if (node.children?.length) {
          traverse(node.children, depth + 1);
        }
      } else if (node.isQuestion) {
        totalQuestions += 1;

        // A question is considered complete when it has a body/editorState set
        const meta = node.metadata ?? {};
        const hasBody =
          !!meta.body ||
          !!meta.editorState ||
          !!meta.questionBody ||
          !!meta.question;
        if (hasBody) {
          completedQuestions += 1;
        }

        // Difficulty breakdown
        const diff = String(meta.difficulty ?? meta.bloomsLevel ?? '').toLowerCase();
        if (diff === 'easy' || diff === 'remember' || diff === 'understand') {
          difficulty.easy += 1;
        } else if (diff === 'medium' || diff === 'apply' || diff === 'analyse') {
          difficulty.medium += 1;
        } else if (diff === 'hard' || diff === 'evaluate' || diff === 'create') {
          difficulty.hard += 1;
        } else {
          difficulty.unset += 1;
        }

        if (node.children?.length) {
          traverse(node.children, depth + 1);
        }
      } else {
        // Neither folder nor question — traverse children anyway
        if (node.children?.length) {
          traverse(node.children, depth + 1);
        }
      }
    }
  }

  // For the root array, depth 0 means we're at the root level
  // Root folders at depth 0 are the tree root nodes; their children are sections
  for (const node of nodes) {
    if (node.isFolder && node.children?.length) {
      // Root node — traverse its children starting at depth 1 so they count as sections
      traverse(node.children, 1);
    } else if (!node.isFolder && node.isQuestion) {
      // Edge case: top-level question
      totalQuestions += 1;
      const meta = node.metadata ?? {};
      const hasBody = !!meta.body || !!meta.editorState || !!meta.questionBody || !!meta.question;
      if (hasBody) completedQuestions += 1;
    }
  }

  return {
    totalSections,
    totalQuestions,
    completedQuestions,
    incompleteQuestions: totalQuestions - completedQuestions,
    difficultyBreakdown: difficulty,
  };
}

// -----------------------------------------------------------------------------
// Sub-component: stat card
// -----------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, variant = 'default' }) => (
  <div className={`${styles.statCard} ${styles[`statCard--${variant}`]}`}>
    <span className={styles.statIcon} aria-hidden="true">
      {icon}
    </span>
    <span className={styles.statValue}>{value}</span>
    <span className={styles.statLabel}>{label}</span>
  </div>
);

// -----------------------------------------------------------------------------
// Sub-component: progress bar
// -----------------------------------------------------------------------------

interface ProgressBarProps {
  value: number; // 0–100
  label: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, label }) => {
  const clamped = Math.min(100, Math.max(0, value));
  const variant =
    clamped === 100 ? 'complete' : clamped >= 50 ? 'partial' : 'low';

  return (
    <div className={styles.progressWrapper}>
      <div className={styles.progressHeader}>
        <span className={styles.progressLabel}>{label}</span>
        <span className={styles.progressPct}>{Math.round(clamped)}%</span>
      </div>
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={`${styles.progressFill} ${styles[`progressFill--${variant}`]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Main component
// -----------------------------------------------------------------------------

const ProgressStatusModal: React.FC<ProgressStatusModalProps> = ({ onClose }) => {
  const treeData = useTreeStore((s) => s.treeData);

  const stats = useMemo<TreeStats>(() => collectStats(treeData), [treeData]);

  const completionPct =
    stats.totalQuestions > 0
      ? (stats.completedQuestions / stats.totalQuestions) * 100
      : 0;

  const hasDifficultyData =
    stats.difficultyBreakdown.easy > 0 ||
    stats.difficultyBreakdown.medium > 0 ||
    stats.difficultyBreakdown.hard > 0;

  const footer = (
    <Button variant="primary" onClick={onClose}>
      Close
    </Button>
  );

  return (
    <Modal
      title="Question Set Progress"
      isOpen
      onClose={onClose}
      footer={footer}
      size="md"
    >
      <div className={styles.root}>
        {/* Completion progress bar */}
        <ProgressBar
          value={completionPct}
          label={`Question completion (${stats.completedQuestions} of ${stats.totalQuestions})`}
        />

        {/* Stats grid */}
        <div className={styles.statsGrid}>
          <StatCard
            label="Total Sections"
            value={stats.totalSections}
            icon={<FolderOpen size={20} strokeWidth={1.75} />}
            variant="neutral"
          />
          <StatCard
            label="Total Questions"
            value={stats.totalQuestions}
            icon={<BookOpen size={20} strokeWidth={1.75} />}
            variant="default"
          />
          <StatCard
            label="Complete"
            value={stats.completedQuestions}
            icon={<CheckCircle2 size={20} strokeWidth={1.75} />}
            variant="success"
          />
          <StatCard
            label="Incomplete"
            value={stats.incompleteQuestions}
            icon={<XCircle size={20} strokeWidth={1.75} />}
            variant="warning"
          />
        </div>

        {/* Difficulty breakdown — shown only when difficulty metadata exists */}
        {hasDifficultyData && (
          <div className={styles.difficultySection}>
            <h3 className={styles.sectionTitle}>
              <HelpCircle size={14} strokeWidth={2} aria-hidden="true" />
              Difficulty Breakdown
            </h3>
            <div className={styles.difficultyGrid}>
              <DifficultyBar
                label="Easy"
                count={stats.difficultyBreakdown.easy}
                total={stats.totalQuestions}
                colorClass={styles.diffEasy}
              />
              <DifficultyBar
                label="Medium"
                count={stats.difficultyBreakdown.medium}
                total={stats.totalQuestions}
                colorClass={styles.diffMedium}
              />
              <DifficultyBar
                label="Hard"
                count={stats.difficultyBreakdown.hard}
                total={stats.totalQuestions}
                colorClass={styles.diffHard}
              />
            </div>
          </div>
        )}

        {/* Empty state */}
        {stats.totalQuestions === 0 && (
          <p className={styles.emptyText}>
            No questions have been added to this Question Set yet.
          </p>
        )}
      </div>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// DifficultyBar sub-component
// ---------------------------------------------------------------------------

interface DifficultyBarProps {
  label: string;
  count: number;
  total: number;
  colorClass: string;
}

const DifficultyBar: React.FC<DifficultyBarProps> = ({
  label,
  count,
  total,
  colorClass,
}) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className={styles.diffRow}>
      <span className={styles.diffLabel}>{label}</span>
      <div className={styles.diffTrack}>
        <div
          className={`${styles.diffFill} ${colorClass}`}
          style={{ width: `${pct}%` }}
          role="meter"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${count} questions`}
        />
      </div>
      <span className={styles.diffCount}>{count}</span>
    </div>
  );
};

export default ProgressStatusModal;
