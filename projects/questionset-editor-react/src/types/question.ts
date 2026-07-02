export type QuestionType = 'mcq' | 'sa' | 'ftb' | 'mtf' | 'seq' | 'reo';

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

export interface IQuestionBody {
  text?: string;
  media?: Array<{ id: string; type: string; src: string; baseUrl?: string }>;
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

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq: 'Multiple Choice',
  sa:  'Subjective Answer',
  ftb: 'Fill in the Blank',
  mtf: 'Match the Following',
  seq: 'Sequence',
  reo: 'Reorder',
};

export const QUESTION_TYPE_ICONS: Record<QuestionType, string> = {
  mcq: 'CircleDot',
  sa:  'AlignLeft',
  ftb: 'Underline',
  mtf: 'Shuffle',
  seq: 'List',
  reo: 'ArrowUpDown',
};

export const PRIMARY_CATEGORY_MAP: Record<QuestionType, string> = {
  mcq: 'Multiple Choice Question',
  sa:  'Subjective Question',
  ftb: 'Fill in the Blanks',
  mtf: 'Match The Following',
  seq: 'Sequence Question',
  reo: 'Reorder Question',
};
