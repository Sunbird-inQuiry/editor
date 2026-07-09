import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import * as _ from 'lodash-es';
import { ActiveLanguageService } from '../../services/language/active-language.service';
import { readI18nForEditor, writeI18n, I18nValue } from '../../utils/i18nField';
import { EditorTelemetryService } from '../../services/telemetry/telemetry.service';
import { ConfigService } from '../../services/config/config.service';
import { SubMenu } from '../question-option-sub-menu/question-option-sub-menu.component';
import { TreeService } from '../../services/tree/tree.service';
import { EditorService } from '../../services/editor/editor.service';
import { v4 as uuidv4 } from 'uuid';
import { McqOptions } from '../../interfaces/McqForm';

@Component({
  selector: 'lib-boolean',
  templateUrl: './boolean.component.html',
  styleUrls: ['./boolean.component.scss'],
  standalone: false,
})
export class BooleanComponent implements OnInit, OnChanges {
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
    if (val) { if (this._langSub) { this._langSub.unsubscribe(); } this._langSub = val.lang$.subscribe(l => { this.currentLang = l; }); }
  }
  get activeLang(): ActiveLanguageService { return this._activeLang; }
  @Output() editorDataOutput: EventEmitter<any> = new EventEmitter<any>();

  currentLang = 'en';
  get lang(): string    { return this.currentLang; }
  get globalLang(): string { return localStorage.getItem('app-language') || 'en'; }
  get globalDir(): string  { return this.globalLang === 'ar' ? 'rtl' : 'ltr'; }
  langs = ActiveLanguageService.LANGS;
  onLangChange(code: string): void { this._activeLang?.set(code); }
  optionBody(option: any): string { return readI18nForEditor(option.body as I18nValue, this.lang); }
  setOptionBody(option: any, value: string): void {
    option.body = writeI18n(option.body as I18nValue, this.lang, value);
  }
  public setCharacterLimit = 160;
  public templateType = 'boolean';
  subMenus: SubMenu[][];
  hints:any = {};
  showSubMenu:boolean=false;
  parentMeta: any;
  selectedOptions = [];
  
  constructor(
    public telemetryService: EditorTelemetryService,
    public configService: ConfigService,
    public treeService: TreeService,
    private editorService: EditorService
  ) {}

  ngOnInit() {
    this.hints = this.editorState.hints ? this.editorState.hints : {};
    
    // Initialize exactly 2 fixed options for Boolean (True/False)
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

    if(!_.isUndefined(this.editorState.answer)) {
      this.addSelectedOptions();
    }
    
    this.mapping = _.get(this.editorState, 'responseDeclaration.response1.mapping') || [];
    this.editorDataHandler();
    if(!_.isUndefined(this.editorService.editorConfig.config.renderTaxonomy)){
      this.parentMeta = this.treeService.getFirstChild().data.metadata;
      this.showSubMenu=true;
    }
  }

  ngOnChanges(changes: SimpleChanges){
    if (!_.isUndefined(changes.maxScore?.previousValue) && !_.isNaN(changes.maxScore?.currentValue)) {
      this.setMapping();
      this.editorDataHandler();
    }
  }

  addSelectedOptions() {
    if (_.isNumber(this.editorState.answer)) {
      this.selectedOptions = [this.editorState.answer];
    } else if (_.isArray(this.editorState.answer) && this.editorState.answer.length > 0) {
      // Boolean only supports single cardinality
      this.selectedOptions = [this.editorState.answer[0]];
      this.editorState.answer = this.selectedOptions[0];
    }
    
    if (!_.isEmpty(this.editorState.options)) {
      _.forEach(this.editorState.options, (option, index) => {
        const resindex = Number(index);
        option['selected'] = _.includes(this.selectedOptions, resindex);
      })
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
    let options;
    
    options = _.map(editorState.options, (opt, key) => {
      resindex = Number(key);
      if (correctAnswer === resindex) {
        return { answer: true, value: { body: opt.body, value: resindex } };
      } else {
        return { answer: false, value: { body: opt.body, value: resindex } };
      }
    });
    
    metadata = {
      templateId: this.templateType,
      name: this.questionPrimaryCategory || 'Boolean Question',
      responseDeclaration: this.getResponseDeclaration(editorState),
      outcomeDeclaration: this.getOutcomeDeclaration(),
      interactionTypes: ['choice'],
      interactions: this.getInteractions(editorState.options),
      hints:this.hints,
      editorState: {
        options,
      },
      qType: 'BOOL',
      primaryCategory: this.questionPrimaryCategory || 'Boolean Question',
    };
    this.subMenuConfig(editorState.options);
    return metadata;
  }

  getResponseDeclaration(editorState) {
    const responseDeclaration = {
      response1: {
        cardinality: 'single', // Always single for boolean
        type: 'integer',
        correctResponse: {
          value: editorState.answer,
        },
        mapping: this.mapping,
      },
    };
    return responseDeclaration;
  }

  getOutcomeDeclaration() {
    const outcomeDeclaration = {
      maxScore: {
        cardinality: 'single',
        type: 'integer',
        defaultValue: this.maxScore
      }
    };
    return outcomeDeclaration;
  }

  setMapping() {
    if(!_.isEmpty(this.selectedOptions)) {
      this.mapping = [];
      const scoreForEachOption = _.round((this.maxScore/this.selectedOptions.length), 2);
      _.forEach(this.selectedOptions, (value) => {
        const optionMapping = {
          value: value,
          score: scoreForEachOption,
        }
        this.mapping.push(optionMapping)
      })
    } else {
      this.mapping = [];
    }
  }

  getInteractions(options) {
    let index;
    const interactOptions = _.map(options, (opt, key) => {
      index = Number(key);
      const bodyI18n = typeof opt.body === 'object' ? opt.body : (opt.body ? { en: opt.body } : {});
      return {
        label: bodyI18n,
        value: index,
        hint: this.hints[this.editorState?.interactions?.response1?.options[index]?.hint] ? Object.keys(this.hints).find(element => element == this.editorState?.interactions?.response1?.options[index]?.hint) : ''
      };
    });
    const interactions = {
      response1: {
        type: 'choice',
        options: interactOptions,
      },
    };
    return interactions;
  }

  subMenuChange({ index, value }, optionIndex) {
    if(value.length && Object.keys(this.hints).length < this.editorState.interactions.response1.options.length ) {
      const hint = {[uuidv4()] : {en:value}}
      this.hints = {...this.hints, ...hint}
      this.editorState.interactions.response1.options[optionIndex].hint = Object.keys(hint)[0]
    }
    else if (value.length) {
      this.hints[this.editorState.interactions.response1.options[optionIndex].hint].en = value;
    }
  }

  subMenuConfig(options) {
    this.subMenus = []
    options.map((opt, index) => {
      const uuid  = _.get(this.editorState, `interactions.response1.options[${index}].hint`)
      this.subMenus[index] = [
        {
          id: 'addHint',
          name: 'Add Hint',
          value: (():any => {
            if(this.hints[uuid]) {
              return this.hints[uuid].en
            }
            else {
              return this.editorState?.hints?.[uuid] ? this.editorState.hints[uuid].en : ''
            }
          })(),
          label: 'Hint',
          enabled: uuid ? true : false,
          type: 'input',
          show: _.get(this.sourcingSettings, 'showAddHints'),
        },
      ];
    });
  }

  onOptionChange(event) {
    const optionIndex = _.parseInt(event.target.value);
    if(event.target.checked === true) {
      this.selectedOptions = [optionIndex];
    } else {
      this.selectedOptions = [];
    }

    // Sync option.selected so the checkbox binding stays consistent
    // (addSelectedOptions sets it on init but onOptionChange didn't update it).
    _.forEach(this.editorState.options, (option, index) => {
      option['selected'] = _.includes(this.selectedOptions, Number(index));
    });

    if (this.selectedOptions.length === 1) {
      this.editorState.answer = this.selectedOptions[0];
    } else {
      this.editorState.answer = undefined;
    }
    this.setMapping();
    this.editorDataHandler();
  }

  setScore(value, scoreIndex) {
    // Use the same { value, score } shape as setMapping so the mapping
    // array stays consistent regardless of which path wrote it.
    this.mapping[scoreIndex] = {
      value: scoreIndex,
      score: parseFloat(value) || 0,
    };
    this.editorDataHandler();
  }
}
