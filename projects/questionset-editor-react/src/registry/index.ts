/**
 * Question type registry — the built-in types are registered lazily on first
 * access rather than as a module side effect: package.json declares
 * `"sideEffects": ["*.css"]`, so a top-level registration call would be
 * tree-shaken out of the library build (leaving an empty registry).
 *
 * Hosts extend via registerQuestionType (exported from the library entry)
 * before mounting the editor.
 */
import { registerDefaultQuestionTypes } from './defaultQuestionTypes';
import * as registry from './questionTypeRegistry';
import type { QuestionTypeDefinition } from './questionTypeRegistry';

let initialized = false;
function ensureDefaults(): void {
  if (initialized) return;
  initialized = true;
  registerDefaultQuestionTypes();
}

export function registerQuestionType(def: QuestionTypeDefinition): void {
  ensureDefaults();
  registry.registerQuestionType(def);
}

export function resolveQuestionType(key: string | null | undefined): QuestionTypeDefinition | null {
  ensureDefaults();
  return registry.resolveQuestionType(key);
}

export function resolveByQType(qType: string | null | undefined): QuestionTypeDefinition | null {
  ensureDefaults();
  return registry.resolveByQType(qType);
}

export function resolveByCategory(category: string | null | undefined): QuestionTypeDefinition | null {
  ensureDefaults();
  return registry.resolveByCategory(category);
}

export function resolveByInteractionType(type: string | null | undefined): QuestionTypeDefinition | null {
  ensureDefaults();
  return registry.resolveByInteractionType(type);
}

export function allQuestionTypes(): QuestionTypeDefinition[] {
  ensureDefaults();
  return registry.allQuestionTypes();
}

export type { QuestionTypeDefinition, QuestionTypeEditorProps } from './questionTypeRegistry';
