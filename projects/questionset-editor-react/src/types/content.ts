export interface IContent {
  identifier: string;
  name: string;
  description?: string;
  mimeType?: string;
  contentType?: string;
  primaryCategory?: string;
  appIcon?: string;
  channel?: string;
  organisation?: string[];
  framework?: string;
  status?: string;
  visibility?: string;
  pkgVersion?: number;
}

export interface ILibraryItem extends IContent {
  isSelected?: boolean;
  isDragging?: boolean;
}

export const QUESTION_FILTERS: ReadonlyArray<{ label: string; value: string }> = [
  { label: 'All', value: 'all' },
  { label: 'Multiple Choice', value: 'Multiple Choice Question' },
  { label: 'Multi-Select', value: 'Multi Select Question' },
  { label: 'Subjective', value: 'Subjective Question' },
  { label: 'Fill in Blank', value: 'Fill in the Blanks' },
  { label: 'Match Following', value: 'Match The Following' },
];
