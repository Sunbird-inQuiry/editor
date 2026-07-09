/**
 * Central API endpoint map — mirrors the old Angular editor's
 * `url.config.json` (questionset-editor-library).
 *
 * All paths are RELATIVE: `apiClient` prefixes every request with
 * `${apiBaseUrl}${apiSlug}` (see client.ts), the same way the old editor's
 * DataService prefixed every relative URL with `apiSlug` (default `/api`,
 * the sunbird portal host passes `/portal`).
 */
export const URLS = {
  questionSet: {
    read: 'questionset/v2/read',
    hierarchyRead: 'questionset/v2/hierarchy',
    hierarchyUpdate: 'questionset/v2/hierarchy/update',
    update: 'questionset/v2/update',
    add: 'questionset/v2/add',
    removeNode: 'questionset/v2/remove',
    review: 'questionset/v2/review',
    reject: 'questionset/v2/reject',
    publish: 'questionset/v2/publish',
    systemUpdate: 'questionset/v5/system/update',
    commentRead: 'questionset/v2/comment/read',
    commentUpdate: 'questionset/v2/comment/update',
    /** Extra read fields absent from the hierarchy response. */
    defaultFields: 'instructions,outcomeDeclaration,showTimer,timeLimits',
  },
  question: {
    read: 'question/v2/read',
    create: 'question/v2/create',
    update: 'question/v2/update',
    list: 'question/v2/list',
    review: 'question/v2/review',
    reject: 'question/v2/reject',
    publish: 'question/v2/publish',
    retire: 'question/v2/retire',
    systemUpdate: 'question/v5/system/update',
  },
  composite: {
    search: 'composite/v3/search',
  },
  framework: {
    read: 'framework/v1/read',
    termRead: 'framework/v1/term/read',
  },
  channel: {
    read: 'channel/v1/read',
  },
  content: {
    read: 'content/v3/read',
    create: 'content/v3/create',
    upload: 'content/v3/upload',
    uploadUrl: 'content/v3/upload/url',
  },
  asset: {
    read: 'asset/v1/read',
    create: 'asset/v1/create',
    upload: 'asset/v1/upload',
  },
  /** + `/{version}/read?fields=...` (v1 by default, v4 on newer backends). */
  categoryDefinition: 'object/category/definition',
  /** Absolute paths (not prefixed with apiSlug), as in the old url.config.json. */
  telemetry: '/data/v3/telemetry',
  assetProxy: '/assets/public/',
} as const;
