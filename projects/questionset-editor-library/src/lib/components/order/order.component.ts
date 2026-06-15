import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash-es';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ConfigService } from '../../services/config/config.service';
import { ActiveLanguageService } from '../../services/language/active-language.service';
import { readI18nForEditor, writeI18n, normalizeI18n, I18nValue } from '../../utils/i18nField';

interface OrderOption {
  value: string;
  label: I18nValue;
}

@Component({
  standalone: false,
  selector: 'lib-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
})
export class OrderComponent implements OnInit {
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

  readonly MIN_OPTIONS = 2;
  readonly MAX_OPTIONS = 5;
  readonly LAYOUTS = [
    { id: 'seq-vertical',   label: 'Vertical' },
    { id: 'seq-vertical-split', label: 'Grid' },
    { id: 'seq-horizontal', label: 'Horizontal' },
  ];

  currentLang = 'en';
  get lang(): string    { return this.currentLang; }
  get globalLang(): string { return localStorage.getItem('app-language') || 'en'; }
  get globalDir(): string  { return this.globalLang === 'ar' ? 'rtl' : 'ltr'; }
  optionLabel(opt: OrderOption): string { return readI18nForEditor(opt.label, this.lang); }

  setLayout(layoutId: string) {
    this.editorState.templateId = layoutId;
    this.editorDataHandler();
  }

  /** For REO: a separate draggable list representing the correct order */
  correctOrderOptions: OrderOption[] = [];

  get isReorder(): boolean {
    return (this.questionPrimaryCategory || '').toLowerCase() === 'reorder question';
  }

  constructor(public configService: ConfigService) {}

  ngOnInit() {
    if (!this.editorState) { this.editorState = {}; }
    if (!_.isArray(this.editorState.options) || this.editorState.options.length === 0) {
      this.editorState.options = [
        { value: 'A', label: '' },
        { value: 'B', label: '' },
      ];
    }
    if (!_.isArray(this.editorState.correctOrder) || this.editorState.correctOrder.length === 0) {
      this.editorState.correctOrder = this.editorState.options.map((o: OrderOption) => o.value);
    }
    if (!this.editorState.templateId) {
      this.editorState.templateId = 'seq-vertical';
    }
    if (this.isReorder) {
      this.syncCorrectOrderOptions();
    }
    this.editorDataHandler();
  }

  private syncCorrectOrderOptions() {
    this.correctOrderOptions = (this.editorState.correctOrder || []).map((v: string) => {
      const opt = (this.editorState.options || []).find((o: OrderOption) => o.value === v);
      return opt ? { ...opt } : { value: v, label: v };
    });
  }

  addOption() {
    if (this.editorState.options.length < this.MAX_OPTIONS) {
      const val = String.fromCharCode(65 + this.editorState.options.length);
      this.editorState.options = [...this.editorState.options, { value: val, label: '' }];
      this.editorState.correctOrder = [...this.editorState.correctOrder, val];
      if (this.isReorder) { this.syncCorrectOrderOptions(); }
      this.editorDataHandler();
    }
  }

  deleteOption(index: number) {
    if (this.editorState.options.length > this.MIN_OPTIONS) {
      const removed = this.editorState.options[index].value;
      this.editorState.options = this.editorState.options.filter((_, i) => i !== index);
      this.editorState.correctOrder = this.editorState.correctOrder.filter((v: string) => v !== removed);
      if (this.isReorder) { this.syncCorrectOrderOptions(); }
      this.editorDataHandler();
    }
  }

  onLabelChange(event: any, index: number) {
    this.editorState.options[index].label = writeI18n(
      this.editorState.options[index].label as I18nValue, this.lang, event.body);
    if (this.isReorder) { this.syncCorrectOrderOptions(); }
    this.editorDataHandler(event);
  }

  onLabelInput(value: string, index: number) {
    this.editorState.options[index].label = writeI18n(
      this.editorState.options[index].label as I18nValue, this.lang, value);
    if (this.isReorder) { this.syncCorrectOrderOptions(); }
    this.editorDataHandler();
  }

  /** SEQ: drag reorders the displayed list, which IS the correct order */
  dropOption(event: CdkDragDrop<OrderOption[]>) {
    moveItemInArray(this.editorState.options, event.previousIndex, event.currentIndex);
    this.editorState.correctOrder = this.editorState.options.map((o: OrderOption) => o.value);
    this.editorDataHandler();
  }

  /** REO: drag on the correct-order panel only */
  dropCorrectOrder(event: CdkDragDrop<OrderOption[]>) {
    moveItemInArray(this.correctOrderOptions, event.previousIndex, event.currentIndex);
    this.editorState.correctOrder = this.correctOrderOptions.map(o => o.value);
    this.editorDataHandler();
  }

  editorDataHandler(event?: any) {
    const body = this.prepareOrderBody();
    this.editorDataOutput.emit({ body, mediaobj: event?.mediaobj });
  }

  private prepareOrderBody() {
    const options: OrderOption[] = this.editorState.options || [];
    const correctOrder: string[] = this.editorState.correctOrder || options.map(o => o.value);
    const qType = this.isReorder ? 'REO' : 'SEQ';

    return {
      interactionTypes: ['order'],
      qType,
      templateId: this.editorState.templateId || 'seq-vertical',
      primaryCategory: this.questionPrimaryCategory,
      interactions: {
        response1: {
          type: 'order',
          options: options.map(o => ({
            value: o.value,
            label: normalizeI18n(typeof o.label === 'object' ? o.label as any : (o.label ? { en: o.label } : {})),
          })),
        },
      },
      responseDeclaration: {
        response1: {
          cardinality: 'ordered',
          type: 'string',
          correctResponse: { value: correctOrder },
        },
      },
      scoringMode: 'responseProcessing',
      responseProcessing: { template: 'MATCH_CORRECT' },
      outcomeDeclaration: {
        maxScore: { cardinality: 'single', type: 'integer', defaultValue: 1 },
      },
      editorState: { options, correctOrder },
    };
  }

  get options(): OrderOption[] {
    return this.editorState?.options || [];
  }
}
