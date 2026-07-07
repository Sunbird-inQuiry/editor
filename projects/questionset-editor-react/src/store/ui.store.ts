import { create } from 'zustand';

export type ModalType =
  | 'publishChecklist'
  | 'qualityParams'
  | 'termAndCondition'
  | 'confirmDelete'
  | 'progressStatus'
  | 'questionTypeSelector'
  | null;

interface UiState {
  activeModal: ModalType;
  modalData: Record<string, unknown>;
  openModal: (modal: ModalType, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  /** When set, ContextualEditor auto-opens the inline editor for this node. */
  pendingEditorOpen: string | null;
  setPendingEditorOpen: (nodeId: string | null) => void;
  /** True while the inline question editor is open — hierarchy + topbar are
   *  locked until the question is saved or cancelled. */
  questionEditorOpen: boolean;
  setQuestionEditorOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeModal: null,
  modalData: {},
  openModal: (modal, data = {}) => set({ activeModal: modal, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: {} }),
  pendingEditorOpen: null,
  setPendingEditorOpen: (nodeId) => set({ pendingEditorOpen: nodeId }),
  questionEditorOpen: false,
  setQuestionEditorOpen: (open) => set({ questionEditorOpen: open }),
}));
