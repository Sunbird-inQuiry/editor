import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash-es';
import { ConfigService } from '../../services/config/config.service';
import { ActiveLanguageService } from '../../services/language/active-language.service';
import { readI18nForEditor, writeI18n, normalizeI18n, I18nValue } from '../../utils/i18nField';

interface MtfPair {
  left: I18nValue;
  right: I18nValue;
}

@Component({
  standalone: false,
  selector: 'lib-mtf',
  templateUrl: './mtf.component.html',
  styleUrls: ['./mtf.component.scss'],
})
export class MtfComponent implements OnInit {
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

  readonly MIN_PAIRS = 2;
  readonly MAX_PAIRS = 5;

  currentLang = 'en';
  get lang(): string    { return this.currentLang; }
  get globalLang(): string { return localStorage.getItem('app-language') || 'en'; }
  get globalDir(): string  { return this.globalLang === 'ar' ? 'rtl' : 'ltr'; }
  cellValue(field: I18nValue): string { return readI18nForEditor(field, this.lang); }

  constructor(public configService: ConfigService) {}

  ngOnInit() {
    if (!this.editorState) { this.editorState = {}; }
    if (!_.isArray(this.editorState.pairs) || this.editorState.pairs.length === 0) {
      this.editorState.pairs = [
        { left: '', right: '' },
        { left: '', right: '' },
        { left: '', right: '' },
      ];
    }
    this.editorDataHandler();
  }

  addPair() {
    if (this.editorState.pairs.length < this.MAX_PAIRS) {
      this.editorState.pairs = [...this.editorState.pairs, { left: '', right: '' }];
      this.editorDataHandler();
    }
  }

  deletePair(index: number) {
    if (this.editorState.pairs.length > this.MIN_PAIRS) {
      this.editorState.pairs = this.editorState.pairs.filter((_, i) => i !== index);
      this.editorDataHandler();
    }
  }

  onCellChange(event: any, pairIndex: number, side: 'left' | 'right') {
    this.editorState.pairs[pairIndex][side] = writeI18n(
      this.editorState.pairs[pairIndex][side] as I18nValue, this.lang, event.body);
    this.editorDataHandler(event);
  }

  editorDataHandler(event?: any) {
    const body = this.prepareMtfBody();
    this.editorDataOutput.emit({ body, mediaobj: event?.mediaobj });
  }

  private prepareMtfBody() {
    const pairs: MtfPair[] = this.editorState.pairs || [];
    const leftOptions  = pairs.map((p, i) => ({
      value: String(i),
      label: normalizeI18n(typeof p.left === 'object' ? p.left as any : (p.left ? { en: p.left } : {})),
    }));
    const rightOptions = pairs.map((p, i) => ({
      value: String.fromCharCode(97 + i),
      label: normalizeI18n(typeof p.right === 'object' ? p.right as any : (p.right ? { en: p.right } : {})),
    }));
    const correctValue = _.reduce(pairs, (acc, _, i) => {
      acc[String(i)] = String.fromCharCode(97 + i);
      return acc;
    }, {} as Record<string, string>);

    return {
      interactionTypes: ['match'],
      qType: 'MTF',
      primaryCategory: this.questionPrimaryCategory || 'Match The Following Question',
      interactions: {
        response1: {
          type: 'match',
          options: { left: leftOptions, right: rightOptions },
        },
      },
      responseDeclaration: {
        response1: {
          cardinality: 'single',
          type: 'map',
          correctResponse: { value: correctValue },
        },
      },
      scoringMode: 'responseProcessing',
      responseProcessing: { template: 'MAP_RESPONSE' },
      outcomeDeclaration: {
        maxScore: { cardinality: 'single', type: 'integer', defaultValue: pairs.length },
      },
      editorState: { pairs: this.editorState.pairs },
    };
  }

  get pairs(): MtfPair[] {
    return this.editorState?.pairs || [];
  }
}
