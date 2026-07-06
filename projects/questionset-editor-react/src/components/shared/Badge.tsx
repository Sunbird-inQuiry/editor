import React from 'react';
import {
  CircleDot,
  AlignLeft,
  Underline,
  Shuffle,
  List,
  ArrowUpDown,
  type LucideIcon,
} from 'lucide-react';
import type { QuestionType } from '../../types/question';
import { resolveQuestionType } from '../../registry';
import styles from './Badge.module.scss';

// -----------------------------------------------------------------------------
// Icon map — keyed by QuestionType
// -----------------------------------------------------------------------------

const ICON_MAP: Record<QuestionType, LucideIcon> = {
  mcq: CircleDot,
  sa:  AlignLeft,
  ftb: Underline,
  mtf: Shuffle,
  seq: List,
  reo: ArrowUpDown,
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  /** The question type that determines color and icon. */
  type: QuestionType;
  /** Visual size of the badge. Defaults to 'md'. */
  size?: BadgeSize;
  /** Override the displayed label. Falls back to the registry's type label. */
  label?: string;
  /** When true, only renders the icon (no label text). */
  iconOnly?: boolean;
  /** Additional CSS class applied to the root element. */
  className?: string;
  /** Inline styles applied to the root element. */
  style?: React.CSSProperties;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const Badge: React.FC<BadgeProps> = ({
  type,
  size = 'md',
  label,
  iconOnly = false,
  className,
  style,
}) => {
  const Icon = ICON_MAP[type];
  const displayLabel = label ?? resolveQuestionType(type)?.label ?? type.toUpperCase();
  const iconSize = size === 'sm' ? 12 : 14;

  const rootClass = [
    styles.badge,
    styles[`badge--${type}`],
    styles[`badge--${size}`],
    iconOnly ? styles['badge--icon-only'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={rootClass}
      style={style}
      title={displayLabel}
      aria-label={displayLabel}
    >
      {Icon && (
        <Icon
          size={iconSize}
          aria-hidden="true"
          strokeWidth={2.25}
          className={styles.badgeIcon}
        />
      )}
      {!iconOnly && (
        <span className={styles.badgeLabel}>{displayLabel}</span>
      )}
    </span>
  );
};

export default Badge;
