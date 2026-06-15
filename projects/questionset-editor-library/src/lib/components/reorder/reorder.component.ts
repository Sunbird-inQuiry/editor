import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActiveLanguageService } from '../../services/language/active-language.service';
import { ConfigService } from '../../services/config/config.service';
import { readI18n, readI18nForEditor, writeI18n, I18nValue } from '../../utils/i18nField';

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
  private _activeLang: ActiveLanguageService;
  @Input() set activeLang(val: ActiveLanguageService) {
    this._activeLang = val;
    if (val) { val.lang$.subscribe(l => { this.currentLang = l; }); }
  }
  get activeLang(): ActiveLanguageService { return this._activeLang; }
  @Output() editorDataOutput: EventEmitter<any> = new EventEmitter<any>();

  readonly MAX_CHARS = 120;

  currentLang = 'en';
  get lang(): string       { return this.currentLang; }
  get globalLang(): string { return localStorage.getItem('app-language') || 'en'; }
  get globalDir(): string  { return this.globalLang === 'ar' ? 'rtl' : 'ltr'; }

  get sentence(): string {
    return readI18nForEditor(this.editorState?.sentence as I18nValue, this.lang);
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

  private buildI18nTokens(): Record<string, { options: ReorderToken[]; correctResponse: string[] }> {
    const sentenceMap = this.editorState?.sentence;
    const result: Record<string, { options: ReorderToken[]; correctResponse: string[] }> = {};
    if (!sentenceMap) return result;
    const langs = typeof sentenceMap === 'string'
      ? ['en']
      : Object.keys(sentenceMap as Record<string, string>);
    langs.forEach(lang => {
      const text = readI18n(sentenceMap as I18nValue, lang);
      if (text?.trim()) {
        const toks = this.tokenize(text);
        result[lang] = { options: toks, correctResponse: toks.map(t => t.value) };
      }
    });
    return result;
  }

  private emitBody() {
    const i18nToks = this.buildI18nTokens();
    const primaryLang = i18nToks['en'] ? 'en' : Object.keys(i18nToks)[0];
    const primaryToks = primaryLang ? i18nToks[primaryLang].options : [];
    const primaryCorrect = primaryLang ? i18nToks[primaryLang].correctResponse : [];

    this.editorDataOutput.emit({
      body: {
        interactionTypes: ['order'],
        qType: 'REO',
        primaryCategory: this.questionPrimaryCategory || 'Reorder Question',
        interactions: {
          response1: {
            type: 'order',
            options: primaryToks,
            i18n: i18nToks,
          },
        },
        responseDeclaration: {
          response1: {
            cardinality: 'ordered',
            type: 'string',
            correctResponse: { value: primaryCorrect },
            i18n: Object.fromEntries(
              Object.entries(i18nToks).map(([lang, d]) => [
                lang, { correctResponse: { value: d.correctResponse } }
              ])
            ),
          },
        },
        scoringMode: 'responseProcessing',
        responseProcessing: { template: 'MATCH_CORRECT' },
        outcomeDeclaration: {
          maxScore: { cardinality: 'single', type: 'integer', defaultValue: 1 },
        },
        editorState: {
          sentence: this.editorState.sentence,
          i18n: i18nToks,
        },
      }
    });
  }
}
