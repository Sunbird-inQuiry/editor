import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ConfigService } from '../../services/config/config.service';
import { ActiveLanguageService } from '../../services/language/active-language.service';
import { readI18n, writeI18n, normalizeI18n, I18nValue } from '../../utils/i18nField';

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
  @Input() activeLang: ActiveLanguageService;
  @Output() editorDataOutput: EventEmitter<any> = new EventEmitter<any>();

  get lang(): string { return this.activeLang?.current ?? 'en'; }
  get answerBody(): string { return readI18n(this.editorState.answer as I18nValue, this.lang); }

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
