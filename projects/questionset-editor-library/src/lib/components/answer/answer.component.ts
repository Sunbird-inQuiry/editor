import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ConfigService } from '../../services/config/config.service';
import { ActiveLanguageService } from '../../services/language/active-language.service';
import { readI18nForEditor, writeI18n, normalizeI18n, I18nValue } from '../../utils/i18nField';

@Component({
  selector: 'lib-answer',
  templateUrl: './answer.component.html',
  standalone: false,
})
export class AnswerComponent implements OnInit {
  @Input() editorState;
  @Input() questionPrimaryCategory;
  @Input() showFormError;
  @Input() isReadOnlyMode;
  private _activeLang: ActiveLanguageService;
  private _langSub: any;
  @Input() set activeLang(val: ActiveLanguageService) {
    this._activeLang = val;
    if (val) { if (this._langSub) { this._langSub.unsubscribe(); } this._langSub = val.lang$.subscribe(l => { this.currentLang = l; }); }
  }
  get activeLang(): ActiveLanguageService { return this._activeLang; }
  @Output() editorDataOutput: EventEmitter<any> = new EventEmitter<any>();

  currentLang = 'en';
  get lang(): string       { return this.currentLang; }
  get globalLang(): string { return localStorage.getItem('app-language') || 'en'; }
  langs = ActiveLanguageService.LANGS;
  onLangChange(code: string): void { this._activeLang?.set(code); }
  get answerBody(): string { return readI18nForEditor(this.editorState.answer as I18nValue, this.lang); }

  constructor(public configService: ConfigService) {}

  ngOnInit() {
    this.editorDataHandler({ body: this.answerBody });
  }

  onAnswerChange(event: any) {
    this.editorState.answer = writeI18n(this.editorState.answer as I18nValue, this.lang, event.body);
    this.editorDataHandler(event);
  }

  editorDataHandler(event: any) {
    const body = this.prepareAnwserData(event);
    this.editorDataOutput.emit({ body, mediaobj: event.mediaobj });
  }

  prepareAnwserData(event: any) {
    const answerValue = normalizeI18n(
      typeof this.editorState.answer === 'object'
        ? this.editorState.answer
        : (this.editorState.answer ? { en: this.editorState.answer } : {})
    );
    return {
      answer: answerValue,
      editorState: { answer: this.editorState.answer },
      name: 'Subjective Question',
      qType: 'SA',
      primaryCategory: this.questionPrimaryCategory || 'Subjective Question',
    };
  }
}
