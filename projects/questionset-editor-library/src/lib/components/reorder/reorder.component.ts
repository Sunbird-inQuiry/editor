import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActiveLanguageService } from '../../services/language/active-language.service';
import { ConfigService } from '../../services/config/config.service';
import { readI18n, writeI18n, I18nValue } from '../../utils/i18nField';

interface ReorderToken { value: string; label: string; }

@Component({
  standalone: false,
  selector: 'lib-reorder',
  templateUrl: './reorder.component.html',
  styleUrls: ['./reorder.component.scss'],
})
export class ReorderComponent implements OnInit {
  @Input() editorState: any;
  @Input() questionPrimaryCategory: any;
  @Input() showFormError: any;
  @Input() isReadOnlyMode: any;
  @Input() activeLang: ActiveLanguageService;
  @Output() editorDataOutput: EventEmitter<any> = new EventEmitter<any>();

  readonly MAX_CHARS = 120;

  get lang(): string { return this.activeLang?.current ?? 'en'; }

  get sentence(): string {
    return readI18n(this.editorState?.sentence as I18nValue, this.lang);
  }

  get tokens(): ReorderToken[] {
    return this.tokenize(this.sentence);
  }

  get charCount(): number { return this.sentence.length; }

  private tokenize(text: string): ReorderToken[] {
    if (!text?.trim()) return [];
    return text.trim().split(/\s+/).map((word, i) => ({
      value: String.fromCharCode(65 + i),
      label: word,
    }));
  }

  constructor(public configService: ConfigService) {}

  ngOnInit() {
    if (!this.editorState) { this.editorState = {}; }
    if (!this.editorState.sentence) { this.editorState.sentence = ''; }
    this.emitBody();
  }

  onSentenceChange(value: string) {
    this.editorState.sentence = writeI18n(
      this.editorState.sentence as I18nValue, this.lang, value);
    this.emitBody();
  }

  private emitBody() {
    const toks = this.tokens;
    this.editorDataOutput.emit({
      body: {
        interactionTypes: ['order'],
        qType: 'REO',
        primaryCategory: this.questionPrimaryCategory || 'Reorder Question',
        interactions: {
          response1: { type: 'order', options: toks },
        },
        responseDeclaration: {
          response1: {
            cardinality: 'ordered',
            type: 'string',
            correctResponse: { value: toks.map(t => t.value) },
          },
        },
        scoringMode: 'responseProcessing',
        responseProcessing: { template: 'MATCH_CORRECT' },
        outcomeDeclaration: {
          maxScore: { cardinality: 'single', type: 'integer', defaultValue: 1 },
        },
        editorState: {
          sentence: this.editorState.sentence,
          options: toks,
          correctOrder: toks.map(t => t.value),
        },
      }
    });
  }
}
