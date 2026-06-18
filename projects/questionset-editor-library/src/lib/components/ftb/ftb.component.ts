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
  private _langSub: any;
  @Input() set activeLang(val: ActiveLanguageService) {
    this._activeLang = val;
    if (val) { if (this._langSub) { this._langSub.unsubscribe(); } this._langSub = val.lang$.subscribe(l => { this.currentLang = l; }); }
  }
  get activeLang(): ActiveLanguageService { return this._activeLang; }
  @Output() editorDataOutput: EventEmitter<any> = new EventEmitter<any>();

  currentLang = 'en';
  get lang(): string { return this.currentLang; }

  isPartialScore = false;
  evalUnordered  = false;

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
    this.isPartialScore = !!this.editorState.isPartialScore;
    this.evalUnordered  = !!this.editorState.evalUnordered;
    this.emitMetadata();
  }

  onToggle() {
    this.emitMetadata();
  }

  private emitMetadata() {
    this.editorDataOutput.emit({
      body: {
        interactionTypes: ['text'],
        qType: 'FTB',
        primaryCategory: this.questionPrimaryCategory || 'FTB Question',
        isPartialScore: this.isPartialScore,
        evalUnordered: this.evalUnordered,
        scoringMode: 'responseProcessing',
        responseProcessing: { template: 'MAP_RESPONSE' },
      }
    });
  }
}
