import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import * as _ from 'lodash-es';
import { McqOptions } from '../../interfaces/McqForm';
import { ActiveLanguageService } from '../../services/language/active-language.service';
import { readI18nForEditor, writeI18n, I18nValue } from '../../utils/i18nField';
import { EditorTelemetryService } from '../../services/telemetry/telemetry.service';
import { ConfigService } from '../../services/config/config.service';
import { TreeService } from '../../services/tree/tree.service';
import { EditorService } from '../../services/editor/editor.service';

@Component({
  selector: 'lib-boolean',
  templateUrl: './boolean.component.html',
  styleUrls: ['./boolean.component.scss'],
  standalone: false,
})
export class BooleanComponent implements OnInit {
  @Input() editorState: any;
  @Input() showFormError;
  @Input() sourcingSettings;
  @Input() questionPrimaryCategory;
  @Input() mapping = [];
  @Input() isReadOnlyMode;
  @Input() maxScore;
  private _activeLang: ActiveLanguageService;
  private _langSub: any;
  @Input() set activeLang(val: ActiveLanguageService) {
    this._activeLang = val;
    if (val) {
      if (this._langSub) { this._langSub.unsubscribe(); }
      this._langSub = val.lang$.subscribe(l => { this.currentLang = l; });
    }
  }
  get activeLang(): ActiveLanguageService { return this._activeLang; }
  @Output() editorDataOutput: EventEmitter<any> = new EventEmitter<any>();

  currentLang = 'en';
  get lang(): string { return this.currentLang; }
  get globalLang(): string { return localStorage.getItem('app-language') || 'en'; }
  get globalDir(): string { return this.globalLang === 'ar' ? 'rtl' : 'ltr'; }
  langs = ActiveLanguageService.LANGS;
  onLangChange(code: string): void { this._activeLang?.set(code); }
  optionBody(option: any): string { return readI18nForEditor(option.body as I18nValue, this.lang); }
  setOptionBody(option: any, value: string): void {
    option.body = writeI18n(option.body as I18nValue, this.lang, value);
  }
  public setCharacterLimit = 160;
  public setImageLimit = 1;
  public templateType = 'mcq-boolean';
  parentMeta: any;
  selectedOptions = [];

  constructor(
    public telemetryService: EditorTelemetryService,
    public configService: ConfigService,
    public treeService: TreeService,
    private editorService: EditorService
  ) { }

  ngOnInit() {
    if (!this.editorState) {
      this.editorState = {};
    }
    if (!this.editorState.options || this.editorState.options.length !== 2) {
      this.editorState.options = [
        new McqOptions('<p>True</p>'),
        new McqOptions('<p>False</p>'),
      ];
      this.editorService.optionsLength = 2;
      this.editorState.maximumOptions = 2;
    } else {
      if (!this.optionBody(this.editorState.options[0])) {
        this.setOptionBody(this.editorState.options[0], '<p>True</p>');
      }
      if (!this.optionBody(this.editorState.options[1])) {
        this.setOptionBody(this.editorState.options[1], '<p>False</p>');
      }
    }
    this.addSelectedOptions();
    this.mapping = _.get(this.editorState, 'responseDeclaration.response1.mapping') || [];
    this.editorDataHandler();
    if (!_.isUndefined(this.editorService.editorConfig.config.renderTaxonomy)) {
      this.parentMeta = this.treeService.getFirstChild().data.metadata;
    }
  }

  addSelectedOptions() {
    if (_.isNumber(this.editorState.answer)) {
      this.selectedOptions = [this.editorState.answer];
    } else if (_.isArray(this.editorState.answer)) {
      this.selectedOptions = this.editorState.answer;
    }
    if (!_.isEmpty(this.editorState.options)) {
      _.forEach(this.editorState.options, (option, index) => {
        const resindex = Number(index);
        option['selected'] = _.includes(this.selectedOptions, resindex);
      });
    }
  }

  editorDataHandler(event?) {
    const body = this.prepareMcqBody(this.editorState);
    this.editorDataOutput.emit({ body, mediaobj: event ? event.mediaobj : undefined });
  }

  prepareMcqBody(editorState) {
    let metadata: any;
    const correctAnswer = editorState.answer;
    let resindex;
    const options = _.map(editorState.options, (opt, key) => {
      resindex = Number(key);
      const isCorrect = (correctAnswer === resindex) || (_.isArray(correctAnswer) && _.includes(correctAnswer, resindex));
      return { answer: isCorrect, value: { body: opt.body, value: resindex } };
    });

    metadata = {
      templateId: this.templateType,
      name: this.questionPrimaryCategory || 'Boolean Question',
      responseDeclaration: this.getResponseDeclaration(editorState),
      outcomeDeclaration: this.getOutcomeDeclaration(),
      interactionTypes: ['choice'],
      interactions: this.getInteractions(editorState.options),
      editorState: {
        options,
      },
      qType: 'BOOL',
      primaryCategory: this.questionPrimaryCategory || 'Boolean Question',
    };
    return metadata;
  }

  getResponseDeclaration(editorState) {
    return {
      response1: {
        cardinality: 'single',
        type: 'integer',
        correctResponse: {
          value: editorState.answer,
        },
        mapping: this.mapping,
      },
    };
  }

  getOutcomeDeclaration() {
    return {
      maxScore: {
        cardinality: 'single',
        type: 'integer',
        defaultValue: this.maxScore
      }
    };
  }

  getInteractions(options) {
    let index;
    const interactOptions = _.map(options, (opt, key) => {
      index = Number(key);
      const bodyI18n = typeof opt.body === 'object' ? opt.body : (opt.body ? { en: opt.body } : {});
      return {
        label: bodyI18n,
        value: index,
        hint: ''
      };
    });
    return {
      response1: {
        type: 'choice',
        options: interactOptions,
      },
    };
  }

  onOptionChange(event) {
    const optionIndex = _.parseInt(event.target.value);
    this.selectedOptions = [optionIndex];
    this.editorState.answer = optionIndex;
    if (!_.isEmpty(this.editorState.options)) {
      _.forEach(this.editorState.options, (option, index) => {
        option['selected'] = (Number(index) === optionIndex);
      });
    }
    this.setMapping();
    this.editorDataHandler();
  }

  setMapping() {
    if (!_.isEmpty(this.selectedOptions)) {
      this.mapping = [];
      const scoreForEachOption = _.round((this.maxScore / this.selectedOptions.length), 2);
      _.forEach(this.selectedOptions, (value) => {
        const optionMapping = {
          value: value,
          score: scoreForEachOption,
        };
        this.mapping.push(optionMapping);
      });
    } else {
      this.mapping = [];
    }
  }

  setScore(value, scoreIndex) {
    const obj = {
      response: scoreIndex,
      outcomes: {
        score: value,
      },
    };
    this.mapping[scoreIndex] = obj;
    this.editorDataHandler();
  }
}
