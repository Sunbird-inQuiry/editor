import { Component, OnInit, Input, EventEmitter, Output, ViewEncapsulation, OnChanges, SimpleChanges } from '@angular/core';
import * as _ from 'lodash-es';
import { EditorTelemetryService } from '../../services/telemetry/telemetry.service';
import { ConfigService } from '../../services/config/config.service';
import { SubMenu } from '../question-option-sub-menu/question-option-sub-menu.component';
import { TreeService } from '../../services/tree/tree.service';
import { EditorService } from '../../services/editor/editor.service';
import { v4 as uuidv4 } from 'uuid';
@Component({
  selector: 'lib-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
})
export class OptionsComponent implements OnInit, OnChanges {
  @Input() editorState: any;
  @Input() showFormError;
  @Input() sourcingSettings;
  @Input() questionPrimaryCategory;
  @Input() mapping = [];
  @Input() isReadOnlyMode;
  @Input() maxScore;
  @Output() editorDataOutput: EventEmitter<any> = new EventEmitter<any>();
  public setCharacterLimit = 160;
  public setImageLimit = 1;
  public templateType = 'mcq-vertical';
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
    this.sourcingSettings.enforceCorrectAnswer = true;
    this.hints = this.editorState.hints ? this.editorState.hints : {};
    if(!_.isUndefined(this.editorState.answer)) {
      this.addSelectedOptions();
    }
    if (!_.isUndefined(this.editorState.templateId)) {
      this.templateType = this.editorState.templateId;
    }
    this.mapping = _.get(this.editorState, 'responseDeclaration.response1.mapping') || [];
    this.editorDataHandler();
    if(!_.isUndefined(this.editorService.editorConfig.config.renderTaxonomy)){
      this.parentMeta = this.treeService.getFirstChild().data.metadata;
      this.showSubMenu=true;
    }
  }

  ngOnChanges(changes: SimpleChanges){
    if (!_.isUndefined(changes.maxScore.previousValue) && !_.isNaN(changes.maxScore.currentValue)) {
      this.setMapping();
      this.editorDataHandler();
    }
  }

  addSelectedOptions() {
    if (_.isNumber(this.editorState.answer)) {
      this.selectedOptions.push(this.editorState.answer);
    } else if (_.isArray(this.editorState.answer)) {
      this.selectedOptions = this.editorState.answer;
    }
    if (!_.isEmpty(this.editorState.options)) {
      _.forEach(this.editorState.options, (option, index) => {
        const resindex = Number(index);
        if (_.includes(this.selectedOptions, resindex)) {
          option['selected'] = true;
        } else {
          option['selected'] = false;
        }
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
    if (_.isNumber(correctAnswer)) {
      options = _.map(editorState.options, (opt, key) => {
        resindex = Number(key);
        if (correctAnswer === resindex) {
          return { answer: true, value: { body: opt.body, value: resindex } };
        } else {
          return { answer: false, value: { body: opt.body, value: resindex } };
        }
      });
    } else if (_.isArray(correctAnswer) && !_.isEmpty(correctAnswer)) {
      options = _.map(editorState.options, (opt, key) => {
        resindex = Number(key);
        if (_.includes(correctAnswer, resindex)) {
          return { answer: true, value: { body: opt.body, value: resindex } };
        } else {
          return { answer: false, value: { body: opt.body, value: resindex } };
        }
      });
    }
    metadata = {
      templateId: this.templateType,
      name: this.questionPrimaryCategory || 'Multiple Choice Question',
      responseDeclaration: this.getResponseDeclaration(editorState),
      outcomeDeclaration: this.getOutcomeDeclaration(),
      interactionTypes: ['choice'],
      interactions: this.getInteractions(editorState.options),
      hints:this.hints,
      editorState: {
        options,
      },
      qType: 'MCQ',
      primaryCategory: this.questionPrimaryCategory || 'Multiple Choice Question',
    };
    this.subMenuConfig(editorState.options);
    return metadata;
  }

  getResponseDeclaration(editorState) {
    const responseDeclaration = {
      response1: {
        cardinality: this.getCardinality(),
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
        cardinality: this.getCardinality(),
        type: 'integer',
        defaultValue: this.maxScore
      }
    };
    return outcomeDeclaration;
  }

  getCardinality() {
    let questionCardinality = 'single';
    if (this.mapping.length > 1) {
      questionCardinality = 'multiple';
    }
    return questionCardinality;
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
    // if(Object.keys(this.hints).length < this.editorState.interactions?.response1?.options.length) {
    //   this.hints = this.editorState.interactions.response1.options.map((element) => element.hint)
    // }
    const interactOptions = _.map(options, (opt, key) => {
      index = Number(key);
      return { label: opt.body, value: index,  hint: this.hints[this.editorState?.interactions?.response1?.options[index]?.hint] ? Object.keys(this.hints).find(element => element == this.editorState?.interactions?.response1?.options[index]?.hint) : '' };
    });
    const interactions = {
      response1: {
        type: 'choice',
        options: interactOptions,
      },
    };
    return interactions;
  }

  setTemplete(template) {
    this.templateType = template;
    this.editorDataHandler();
  }

  subMenuChange({ index, value }, optionIndex) {
    // _.set(this.editorState, `interactions.response1.options[${optionIndex}].hints.en`, value)
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
          value: this.hints[uuid] ? this.hints[uuid].en : (this.editorState?.hints?.[uuid] ? this.editorState.hints[uuid].en : ''),
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
      if(event.target.checked === true && !_.includes(this.selectedOptions, optionIndex)) {
        this.selectedOptions.push(optionIndex);
      } else if(event.target.checked === false) {
        _.remove(this.selectedOptions, (n) => {
          return n === optionIndex;
        });
      }
      if (this.selectedOptions.length === 1) {
        this.editorState.answer = this.selectedOptions[0];
      } else if(this.selectedOptions.length > 1) {
        this.editorState.answer = this.selectedOptions;
      } else {
        this.editorState.answer = undefined;
      }
      this.setMapping();
      this.editorDataHandler();
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
