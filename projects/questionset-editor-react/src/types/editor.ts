export type EditorMode = 'edit' | 'review' | 'read' | 'sourcingreview';

export type ToolbarAction =
  | 'back'
  | 'preview'
  | 'sendForReview'
  | 'onFormValueChange'
  | 'onFormStatusChange'
  | 'saveContent'
  | 'publish'
  | 'reject'
  | 'sendBackForCorrections'
  | 'sourcingApprove'
  | 'sourcingReject'
  | 'addQuestion'
  | 'addSection'
  | 'deleteNode';

export interface IUser {
  id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  orgIds?: string[];
}

/**
 * Editor context. Accepts BOTH the old Angular editor contract
 * (identifier, user.id, host, endpoint — what the sunbird portal host
 * sends) and the flat fields used by standalone hosts (contentId, userId).
 * Use utils/context.ts (getUserId/getContentId) to read the normalized value.
 */
export interface IContext {
  authToken?: string;
  userId?: string;
  user?: IUser;
  sid: string;
  did: string;
  uid?: string;
  channel: string;
  pdata: { id: string; ver: string; pid?: string };
  env?: string;
  contentId?: string;
  identifier?: string;
  framework?: string;
  targetFWIds?: string[];
  rollup?: Record<string, string>;
  contextRollup?: Record<string, string>;
  objectRollup?: Record<string, string>;
  cdata?: Array<Record<string, unknown>>;
  tags?: string[];
  /** Telemetry host/endpoint, as in the old contract. */
  host?: string;
  endpoint?: string;
  timeDiff?: number;
  defaultLicense?: string;
  cloudStorage?: {
    provider?: string;
    presigned_headers?: Record<string, string>;
  };
  cloudStorageUrls?: string[];
}

export interface IConfig {
  mode: EditorMode;
  objectType: string;
  /** Path prefix for all API calls (old editor contract). Default '/api'; the portal passes '/portal'. */
  apiSlug?: string;
  questionSet?: { maxQuestionsLimit?: number };
  showAddCollaborator?: boolean;
  primaryCategory?: string;
  framework?: string[];
  targetFWIds?: string[];
  toolbarConfig?: Record<string, unknown>;
  hierarchy?: Record<string, unknown>;
  children?: unknown[];
  defaultFields?: Record<string, unknown>;
  maxDepth?: number;
  questionTypes?: string[];
  maxQuestions?: number;
  showSolutions?: boolean;
  showHints?: boolean;
  showTimer?: boolean;
  /** API version for object/category/definition endpoint. Defaults to 'v1'. */
  categoryDefinitionApiVersion?: 'v1' | 'v4';
}

export interface IEditorConfig {
  context: IContext;
  config: IConfig;
  metadata?: Record<string, unknown>;
  data?: unknown;
  /** Base URL for all API calls (e.g. "https://your-domain.com"). */
  apiBaseUrl?: string;
}

export interface IEditorEvents {
  onToolbarEvent?: (event: { action: ToolbarAction; data?: unknown }) => void;
  onQuestionSaved?: (question: unknown) => void;
  onHierarchySaved?: (hierarchy: unknown) => void;
  onError?: (error: Error) => void;
}

export interface INode {
  id: string;
  identifier: string;
  name: string;
  title?: string;
  description?: string;
  primaryCategory?: string;
  mimeType?: string;
  objectType?: string;
  contentType?: string;
  visibility?: string;
  status?: string;
  appIcon?: string;
  isFolder?: boolean;
  isQuestion?: boolean;
  questionType?: string;
  children?: INode[];
  metadata?: Record<string, unknown>;
  parent?: string;
  index?: number;
}

export interface IButtonLoaders {
  saveContent: boolean;
  publishContent: boolean;
  rejectContent: boolean;
  sendBackContent: boolean;
  sourcingApproveContent: boolean;
  sourcingRejectContent: boolean;
}
