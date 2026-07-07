export type QuestionType = 'mcq' | 'sa' | 'ftb' | 'mtf' | 'seq' | 'reo' | 'boolean';

export interface IOption {
  id: string;
  body: string;
  isCorrect?: boolean;
  value?: number;
  hint?: string;
  score?: number;
}


export interface IMatchPair {
  id: string;
  left: string;
  right: string;
}

export interface IHint {
  id: string;
  body: string;
}

export interface IMediaEntry {
  id: string;
  type: string;
  src: string;
  baseUrl?: string;
  assetId?: string;
  name?: string;
  thumbnail?: string;
}

export interface IQuestionBody {
  text?: string;
  media?: IMediaEntry[];
}

export interface IBranchingRule {
  target: string;
  preCondition?: Record<string, unknown>;
}

export interface IQuestion {
  identifier: string;
  name: string;
  objectType: 'Question';
  primaryCategory: string;
  questionType?: QuestionType;
  mimeType: 'application/vnd.sunbird.question';
  visibility?: 'Default' | 'Parent';
  status?: 'Draft' | 'Review' | 'Live' | 'Retired';
  channel?: string;
  framework?: string;
  body?: string;
  editorState?: {
    question?: string;
    options?: IOption[];
    answer?: string;
    matchPairs?: IMatchPair[];
    sequence?: string[];
    /** REO: the correct sentence (old editor round-trips it verbatim). */
    sentence?: string;
  };
  answer?: string;
  options?: IOption[];
  hints?: IHint[];
  solutions?: Array<{ id: string; type: string; value: string }>;
  media?: IQuestionBody['media'];
  interactions?: Record<string, unknown>;
  responseDeclaration?: Record<string, unknown>;
  outcomeDeclaration?: Record<string, unknown>;
  timeLimits?: { maxTime?: number; warningTime?: number };
  maxScore?: number;
  bloomsLevel?: string;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  purpose?: string;
  expectedDuration?: number;
  shuffle?: boolean;
  showSolutions?: boolean;
  showHints?: boolean;
  branchingLogic?: Record<string, IBranchingRule>;
  /** Multilingual text sources decoded from the read response (lang → text).
   *  Arrays are positional (same order as options/pairs/sequence). */
  i18nSource?: {
    question?: Record<string, string>;
    answer?: Record<string, string>;
    sentence?: Record<string, string>;
    solution?: Record<string, string>;
    hint?: Record<string, string>;
    options?: Array<Record<string, string>>;
    pairsLeft?: Array<Record<string, string>>;
    pairsRight?: Array<Record<string, string>>;
    sequence?: Array<Record<string, string>>;
  };
  // Fields round-tripped from question/v2/read (old editor's readQuestionFields)
  qType?: string;
  templateId?: string;
  interactionTypes?: string[];
  isPartialScore?: boolean;
  evalUnordered?: boolean;
  remarks?: unknown;
  evidence?: unknown;
  instructions?: Record<string, unknown>;
  isReviewModificationAllowed?: boolean;
  createdBy?: string;
  lastUpdatedBy?: string;
  createdOn?: string;
  lastUpdatedOn?: string;
  board?: string[];
  medium?: string[];
  gradeLevel?: string[];
  subject?: string[];
  topic?: string[];
  keywords?: string[];
  language?: string[];
  license?: string;
  copyright?: string;
  attributions?: string[];
}

// Labels, icons, category and qType mappings live in the question type
// registry (src/registry) — the single registration point per type.
