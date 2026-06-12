import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConfigService } from '../../services/config/config.service';
import { ActiveLanguageService } from '../../services/language/active-language.service';
import { readI18nForEditor, I18nValue } from '../../utils/i18nField';

interface FtbBlank { key: string; answer: string; }

@Component({
  standalone: false,
  selector: 'lib-ftb',
  templateUrl: './ftb.component.html',
  styleUrls: ['./ftb.component.scss'],
})
export class FtbComponent implements OnInit {
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

  currentLang = 'en';
  get lang(): string { return this.currentLang; }

  get questionBody(): string {
    return readI18nForEditor(this.editorState?.question as I18nValue, this.lang);
  }

  get parsedBlanks(): FtbBlank[] {
    const blanks: FtbBlank[] = [];
    let i = 0;
    (this.questionBody || '').replace(/\[\[(.*?)\]\]/g, (_: string, ans: string) => {
      blanks.push({ key: `response${++i}`, answer: ans.trim() });
      return _;
    });
    return blanks;
  }

  constructor(public configService: ConfigService) {}

  ngOnInit() {
    if (!this.editorState) { this.editorState = {}; }
    // Emit static metadata so editorState carries qType/interactionTypes.
    // responseDeclaration is built at save time in setQuestionProperties().
    this.editorDataOutput.emit({
      body: {
        interactionTypes: ['text'],
        qType: 'FTB',
        primaryCategory: this.questionPrimaryCategory || 'FTB Question',
        scoringMode: 'responseProcessing',
        responseProcessing: { template: 'MAP_RESPONSE' },
      }
    });
  }
}
