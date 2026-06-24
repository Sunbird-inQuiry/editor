import React, { Component } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import type { IEditorConfig, IEditorEvents } from '../../types/editor';
import { useEditorInit } from '../../hooks/useEditorInit';
import SplitEditorShell from '../SplitEditorShell/SplitEditorShell';
import styles from './QuestionsetEditor.module.scss';
import '../../styles/global.scss';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QuestionsetEditorProps = IEditorConfig & IEditorEvents;

// ---------------------------------------------------------------------------
// QueryClient (singleton per component tree)
// ---------------------------------------------------------------------------

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// ---------------------------------------------------------------------------
// Error Boundary
// ---------------------------------------------------------------------------

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class EditorErrorBoundary extends Component<
  React.PropsWithChildren<{ onError?: (e: Error) => void }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{ onError?: (e: Error) => void }>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[QuestionsetEditor] Unhandled error:', error, info);
    this.props.onError?.(error);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorState} role="alert">
          <p className={styles.errorTitle}>Something went wrong</p>
          <p className={styles.errorMessage}>{this.state.error?.message ?? 'An unexpected error occurred.'}</p>
          <button className={styles.retryButton} onClick={this.handleRetry}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Inner editor — calls init hook and renders shell when ready
// ---------------------------------------------------------------------------

interface InnerEditorProps {
  config: IEditorConfig;
  events: IEditorEvents;
}

function InnerEditor({ config, events }: InnerEditorProps) {
  const { isLoading, error, isReady } = useEditorInit({
    config,
    onError: events.onError,
  });

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <span className={styles.loadingSpinner} aria-hidden="true" />
        <span>Loading editor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState} role="alert">
        <p className={styles.errorTitle}>Failed to load editor</p>
        <p className={styles.errorMessage}>{error.message}</p>
      </div>
    );
  }

  if (!isReady) return null;

  return <SplitEditorShell events={events} />;
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export function QuestionsetEditor(props: QuestionsetEditorProps) {
  const { onToolbarEvent, onQuestionSaved, onHierarchySaved, onError, ...editorConfig } = props;

  const config: IEditorConfig = editorConfig as IEditorConfig;
  const events: IEditorEvents = { onToolbarEvent, onQuestionSaved, onHierarchySaved, onError };

  return (
    <EditorErrorBoundary onError={onError}>
      <QueryClientProvider client={queryClient}>
        <div className={styles.root}>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                fontSize: '14px',
                borderRadius: '6px',
              },
            }}
          />
          <InnerEditor config={config} events={events} />
        </div>
      </QueryClientProvider>
    </EditorErrorBoundary>
  );
}

export default QuestionsetEditor;
