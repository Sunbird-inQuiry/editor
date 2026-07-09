import React from 'react';
import styles from './Spinner.module.scss';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  /** Visual size of the spinner ring. Defaults to 'md'. */
  size?: SpinnerSize;
  /** Accessible label announced to screen readers. Defaults to 'Loading…'. */
  label?: string;
  /** Additional CSS class applied to the wrapper. */
  className?: string;
  /** Inline styles applied to the wrapper. */
  style?: React.CSSProperties;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  label = 'Loading…',
  className,
  style,
}) => {
  const wrapperClass = [
    styles.spinner,
    styles[`spinner--${size}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={wrapperClass}
      style={style}
      role="status"
      aria-label={label}
    >
      <span className={styles.spinner__ring} aria-hidden="true" />
    </span>
  );
};

export default Spinner;
