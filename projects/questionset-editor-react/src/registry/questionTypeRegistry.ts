/**
 * Question type registry — React port of the old editor's
 * EditorQuestionTypeRegistryService + EDITOR_QUESTION_TYPE_REGISTRY token.
 *
 * Each question type registers once with everything the editor needs to
 * render, label and serialize it. Hosts can add types via the exported
 * registerQuestionType (public API) without modifying the library.
 */
import type { ComponentType } from 'react';
import type { QuestionType } from '../types/question';

export interface QuestionTypeEditorProps {
  readOnly?: boolean;
  /** Plain question stem — used by editors that derive answers from it (FTB). */
  stemText?: string;
}

export interface QuestionTypeDefinition {
  /** Internal key, e.g. 'mcq'. Used as questionType throughout the editor. */
  key: QuestionType;
  /** Payload qType, e.g. 'MCQ'. */
  qType: string;
  /** Additional qType values resolved to this type on read (e.g. VSA → sa). */
  qTypeAliases?: string[];
  /** Registered object-category name (obj-cat:<slug>_question_all must exist). */
  primaryCategory: string;
  /** Older category names still found on persisted questions. */
  categoryAliases?: string[];
  /** Interaction type ('choice'|'text'|'match'|'order'); undefined = non-interactive. */
  interactionType?: string;
  /** English display label + ui.* label config keys for translation. */
  label: string;
  labelKey: string;
  desc: string;
  descKey: string;
  /** Icon name (shared Icon component) for the type picker card. */
  icon: string;
  /** Per-type answer editor rendered inside QuestionEditor. */
  Editor: ComponentType<QuestionTypeEditorProps>;
}

const byKey = new Map<string, QuestionTypeDefinition>();
const byQType = new Map<string, QuestionTypeDefinition>();
const byCategory = new Map<string, QuestionTypeDefinition>();
const byInteractionType = new Map<string, QuestionTypeDefinition>();

export function registerQuestionType(def: QuestionTypeDefinition): void {
  byKey.set(def.key, def);
  byQType.set(def.qType.toUpperCase(), def);
  (def.qTypeAliases ?? []).forEach((q) => byQType.set(q.toUpperCase(), def));
  byCategory.set(def.primaryCategory.toLowerCase(), def);
  (def.categoryAliases ?? []).forEach((c) => byCategory.set(c.toLowerCase(), def));
  // First registration wins per interaction type (seq registers 'order' before reo).
  if (def.interactionType && !byInteractionType.has(def.interactionType)) {
    byInteractionType.set(def.interactionType, def);
  }
}

export function resolveQuestionType(key: string | null | undefined): QuestionTypeDefinition | null {
  return (key && byKey.get(key)) || null;
}

export function resolveByQType(qType: string | null | undefined): QuestionTypeDefinition | null {
  return (qType && byQType.get(qType.toUpperCase())) || null;
}

export function resolveByCategory(category: string | null | undefined): QuestionTypeDefinition | null {
  return (category && byCategory.get(category.toLowerCase())) || null;
}

export function resolveByInteractionType(type: string | null | undefined): QuestionTypeDefinition | null {
  return (type && byInteractionType.get(type)) || null;
}

/** Registration order — drives the type picker grid. */
export function allQuestionTypes(): QuestionTypeDefinition[] {
  return [...byKey.values()];
}
