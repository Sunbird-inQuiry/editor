import { useEditorStore } from '../store/editor.store';
import { labelFrom } from '../utils/labels';

/** Store-driven label lookup: L('section.key', 'Fallback'). */
export function useLabels() {
  const labels = useEditorStore((s) => s.labels);
  return (path: string, fallback: string) => labelFrom(labels, path, fallback);
}

/** UI direction follows the UI language (ar = rtl). */
export function useUiDir(): 'ltr' | 'rtl' {
  const uiLanguage = useEditorStore((s) => s.uiLanguage);
  return uiLanguage === 'ar' ? 'rtl' : 'ltr';
}
