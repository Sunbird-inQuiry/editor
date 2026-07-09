import { EventEmitter, InjectionToken, Type } from '@angular/core';

export interface IQuestionEditor {
  editorState: any;
  questionPrimaryCategory: any;
  showFormError: any;
  isReadOnlyMode: any;
  editorDataOutput: EventEmitter<any>;
  activeLang?: any;
}

export interface EditorQuestionTypeDefinition {
  primaryCategory: string;
  interactionType: string;
  qType: string;
  component: Type<any>;
}

export const EDITOR_QUESTION_TYPE_REGISTRY =
  new InjectionToken<EditorQuestionTypeDefinition[]>('EDITOR_QUESTION_TYPE_REGISTRY');
