import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash-es';
import { ConfigService } from '../../services/config/config.service';
import { ActiveLanguageService } from '../../services/language/active-language.service';
import { readI18nForEditor, writeI18n, normalizeI18n, asI18nMap, I18nValue } from '../../utils/i18nField';

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
  private _langSub: any;
  @Input() set activeLang(val: ActiveLanguageService) {
    this._activeLang = val;
    if (val) { if (this._langSub) { this._langSub.unsubscribe(); } this._langSub = val.lang$.subscribe(l => { this.currentLang = l; }); }
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
  langs = ActiveLanguageService.LANGS;
  onLangChange(code: string): void { this._activeLang?.set(code); }
  isPartialScore = false;

  constructor(public configService: ConfigService) {}

  ngOnInit() {
    if (!this.editorState) { this.editorState = {}; }
    if (!_.isArray(this.editorState.pairs) || this.editorState.pairs.length === 0) {
      this.editorState.pairs = [
        { left: { en: '' }, right: { en: '' } },
        { left: { en: '' }, right: { en: '' } },
        { left: { en: '' }, right: { en: '' } },
      ];
    }
    this.isPartialScore = !!this.editorState.isPartialScore;
    this.editorDataHandler();
  }

  addPair() {
    if (this.editorState.pairs.length < this.MAX_PAIRS) {
      this.editorState.pairs = [...this.editorState.pairs, { left: { en: '' }, right: { en: '' } }];
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
    // Always store as i18n map so single-language content has same structure as multilingual
    const current = asI18nMap(this.editorState.pairs[pairIndex][side] as I18nValue);
    current[this.lang] = event.body;
    this.editorState.pairs[pairIndex][side] = current;
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
      label: asI18nMap(p.left),
    }));
    const rightOptions = pairs.map((p, i) => ({
      value: String.fromCharCode(97 + i),
      label: asI18nMap(p.right),
    }));
    const correctValue = _.reduce(pairs, (acc, _, i) => {
      acc[String(i)] = String.fromCharCode(97 + i);
      return acc;
    }, {} as Record<string, string>);

    const pairMapping = this.isPartialScore
      ? pairs.map((_, i) => ({ key: String(i), value: String.fromCharCode(97 + i), score: 1 }))
      : undefined;

    const rd: any = {
      cardinality: 'single',
      type: 'map',
      correctResponse: { value: correctValue },
    };
    if (pairMapping) { rd.mapping = pairMapping; }

    return {
      interactionTypes: ['match'],
      qType: 'MTF',
      primaryCategory: this.questionPrimaryCategory || 'Match The Following Question',
      isPartialScore: this.isPartialScore,
      interactions: {
        response1: {
          type: 'match',
          options: { left: leftOptions, right: rightOptions },
        },
      },
      responseDeclaration: { response1: rd },
      scoringMode: 'responseProcessing',
      responseProcessing: { template: 'MAP_RESPONSE' },
      outcomeDeclaration: {
        maxScore: { cardinality: 'single', type: 'integer', defaultValue: this.isPartialScore ? pairs.length : 1 },
      },
      editorState: { pairs: this.editorState.pairs, isPartialScore: this.isPartialScore },
    };
  }

  get pairs(): MtfPair[] {
    return this.editorState?.pairs || [];
  }
}
