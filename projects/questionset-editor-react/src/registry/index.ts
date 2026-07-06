/**
 * Question type registry — importing this module registers the built-in
 * types once. Hosts extend via registerQuestionType (exported from the
 * library entry) before mounting the editor.
 */
import { registerDefaultQuestionTypes } from './defaultQuestionTypes';

registerDefaultQuestionTypes();

export {
  registerQuestionType,
  resolveQuestionType,
  resolveByQType,
  resolveByCategory,
  resolveByInteractionType,
  allQuestionTypes,
} from './questionTypeRegistry';
export type { QuestionTypeDefinition, QuestionTypeEditorProps } from './questionTypeRegistry';
