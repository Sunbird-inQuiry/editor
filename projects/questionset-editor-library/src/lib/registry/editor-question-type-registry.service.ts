import { Inject, Injectable, Optional } from '@angular/core';
import { EditorQuestionTypeDefinition, EDITOR_QUESTION_TYPE_REGISTRY } from './editor-question-type.interface';

@Injectable()
export class EditorQuestionTypeRegistryService {
  private byInteractionType = new Map<string, EditorQuestionTypeDefinition>();
  private byPrimaryCategory = new Map<string, EditorQuestionTypeDefinition>();

  constructor(
    @Optional() @Inject(EDITOR_QUESTION_TYPE_REGISTRY)
    defs: EditorQuestionTypeDefinition[] | null
  ) {
    (defs ?? []).forEach(def => {
      this.byInteractionType.set(def.interactionType, def);
      this.byPrimaryCategory.set(def.primaryCategory.toLowerCase(), def);
    });
  }

  resolveByInteractionType(type: string): EditorQuestionTypeDefinition | null {
    return this.byInteractionType.get(type) ?? null;
  }

  resolveByCategory(primaryCategory: string): EditorQuestionTypeDefinition | null {
    return this.byPrimaryCategory.get(primaryCategory.toLowerCase()) ?? null;
  }
}
