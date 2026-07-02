import toast from 'react-hot-toast';

// One consistent look for every API success/failure notification —
// themed like the app's cards (sb tokens), top-right via the shared Toaster.
const baseStyle: React.CSSProperties = {
  fontFamily: 'var(--sb-font)',
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--sb-text)',
  background: 'var(--sb-card, #fff)',
  border: '1px solid var(--sb-border)',
  borderRadius: '12px',
  boxShadow: 'var(--sb-shadow-deep)',
  padding: '12px 16px',
  maxWidth: '440px',
};

export function notifySuccess(message: string): void {
  toast.success(message, {
    style: baseStyle,
    iconTheme: { primary: 'var(--accent, #16a34a)', secondary: '#fff' },
  });
}

export function notifyError(message: string): void {
  toast.error(message, {
    style: baseStyle,
    duration: 5000,
    iconTheme: { primary: 'var(--sb-red, #dc2626)', secondary: '#fff' },
  });
}

/** Prefer the server's errmsg (surfaced by the api client) over a generic fallback. */
export function apiErrorMessage(e: unknown, fallback: string): string {
  const msg = e instanceof Error ? e.message : '';
  return msg && !/^Request failed|^Network Error|timeout/i.test(msg) ? msg : fallback;
}
