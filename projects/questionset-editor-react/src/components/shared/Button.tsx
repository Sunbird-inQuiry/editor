import React from 'react';
import styles from './Button.module.scss';
import Spinner from './Spinner';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button. Defaults to 'primary'. */
  variant?: ButtonVariant;
  /** Size of the button. Defaults to 'md'. */
  size?: ButtonSize;
  /** When true, shows a spinner and disables interaction. */
  isLoading?: boolean;
  /** Screen-reader label shown while loading. Defaults to 'Loading…'. */
  loadingLabel?: string;
  /** Icon rendered before the button label. */
  leftIcon?: React.ReactNode;
  /** Icon rendered after the button label. */
  rightIcon?: React.ReactNode;
  /** Renders an anchor element instead of a button (pass href). */
  as?: 'button' | 'a';
  /** Target URL when `as="a"`. */
  href?: string;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingLabel = 'Loading…',
      leftIcon,
      rightIcon,
      children,
      disabled,
      className,
      onClick,
      type = 'button',
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    const rootClass = [
      styles.button,
      styles[`button--${variant}`],
      styles[`button--${size}`],
      isLoading ? styles['button--loading'] : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return;
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type={type}
        className={rootClass}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        onClick={handleClick}
        {...rest}
      >
        {/* Visible content — dimmed while loading */}
        <span className={styles.buttonContent} aria-hidden={isLoading}>
          {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
          {children}
          {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
        </span>

        {/* Spinner overlay — shown only while loading */}
        {isLoading && (
          <span className={styles.spinnerWrapper}>
            <Spinner size={size === 'sm' ? 'sm' : 'md'} label={loadingLabel} />
          </span>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
export default Button;
