import { create } from 'zustand';
import type { IEditorConfig, EditorMode, IButtonLoaders } from '../types/editor';
import type { ICategoryField, IParsedCategoryDefinition } from '../api/categoryDefinition';
import type { IComment } from '../api/comments';

interface EditorState {
  editorConfig: IEditorConfig | null;
  editorMode: EditorMode;
  buttonLoaders: IButtonLoaders;
  showPreview: boolean;
  pageId: string;
  isCurrentNodeFolder: boolean;
  isCurrentNodeRoot: boolean;
  isCurrentNodeQuestion: boolean;
  isDirty: boolean;
  lastSaved: string | null;
  rootFormConfig: ICategoryField[] | null;
  unitFormConfig: ICategoryField[] | null;
  questionFormConfig: ICategoryField[] | null;
  searchFormConfig: ICategoryField[] | null;
  relationalFormConfig: ICategoryField[] | null;
  publishChecklist: ICategoryField[] | null;
  reviewChecklist: ICategoryField[] | null;
  rfcChecklist: ICategoryField[] | null;
  reviewComments: IComment[];
  setReviewComments: (comments: IComment[]) => void;
  categoryMeta: {
    schemaDefaults: Record<string, unknown>;
    frameworkMetadata: { orgFWType?: string[]; targetFWType?: string[] };
    sourcingSettings: Record<string, unknown>;
  } | null;
  setEditorConfig: (config: IEditorConfig) => void;
  setEditorMode: (mode: EditorMode) => void;
  setButtonLoader: (key: keyof IButtonLoaders, value: boolean) => void;
  setShowPreview: (show: boolean) => void;
  setPageId: (pageId: string) => void;
  setNodeFlags: (flags: { isFolder?: boolean; isRoot?: boolean; isQuestion?: boolean }) => void;
  setLastSaved: (ts: string) => void;
  setIsDirty: (dirty: boolean) => void;
  setCategoryDefinition: (parsed: IParsedCategoryDefinition) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  editorConfig: null,
  editorMode: 'edit',
  buttonLoaders: {
    saveContent: false,
    publishContent: false,
    rejectContent: false,
    sendBackContent: false,
    sourcingApproveContent: false,
    sourcingRejectContent: false,
  },
  showPreview: false,
  pageId: 'questionset_editor',
  isCurrentNodeFolder: false,
  isCurrentNodeRoot: false,
  isCurrentNodeQuestion: false,
  isDirty: false,
  lastSaved: null,
  rootFormConfig: null,
  unitFormConfig: null,
  questionFormConfig: null,
  searchFormConfig: null,
  relationalFormConfig: null,
  publishChecklist: null,
  reviewChecklist: null,
  rfcChecklist: null,
  reviewComments: [],
  categoryMeta: null,

  setEditorConfig: (config) => set({ editorConfig: config }),
  setEditorMode: (mode) => set({ editorMode: mode }),
  setButtonLoader: (key, value) =>
    set((state) => ({ buttonLoaders: { ...state.buttonLoaders, [key]: value } })),
  setShowPreview: (show) => set({ showPreview: show }),
  setPageId: (pageId) => set({ pageId }),
  setNodeFlags: (flags) =>
    set({
      ...(flags.isFolder !== undefined && { isCurrentNodeFolder: flags.isFolder }),
      ...(flags.isRoot !== undefined && { isCurrentNodeRoot: flags.isRoot }),
      ...(flags.isQuestion !== undefined && { isCurrentNodeQuestion: flags.isQuestion }),
    }),
  setLastSaved: (ts) => set({ lastSaved: ts }),
  setIsDirty: (dirty) => set({ isDirty: dirty }),
  setReviewComments: (comments) => set({ reviewComments: comments }),
  setCategoryDefinition: (parsed) =>
    set({
      rootFormConfig: parsed.rootForm,
      unitFormConfig: parsed.unitForm,
      questionFormConfig: parsed.childForm,
      searchFormConfig: parsed.searchForm,
      relationalFormConfig: parsed.relationalForm,
      publishChecklist: parsed.publishChecklist,
      reviewChecklist: parsed.reviewChecklist,
      rfcChecklist: parsed.rfcChecklist,
      categoryMeta: {
        schemaDefaults: parsed.schemaDefaults,
        frameworkMetadata: parsed.frameworkMetadata,
        sourcingSettings: parsed.sourcingSettings,
      },
    }),
}));
