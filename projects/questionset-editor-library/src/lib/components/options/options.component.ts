import { Component, OnInit, Input, EventEmitter, Output, ViewEncapsulation, OnChanges, SimpleChanges } from '@angular/core';
import * as _ from 'lodash-es';
import { EditorTelemetryService } from '../../services/telemetry/telemetry.service';
import { ConfigService } from '../../services/config/config.service';
import { SubMenu } from '../question-option-sub-menu/question-option-sub-menu.component';
import { TreeService } from '../../services/tree/tree.service';
import { EditorService } from '../../services/editor/editor.service';
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
  hints = [];
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
    if(!_.isEmpty(this.editorState.answer)) {
      this.addSelectedOptions();
    }
    if (!_.isUndefined(this.editorState.templateId)) {
      this.templateType = this.editorState.templateId;
    }
    this.editorDataHandler();
    this.mapping = _.get(this.editorState, 'responseDeclaration.response1.mapping') || [];
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
    if (_.isString(this.editorState.answer)) {
      this.selectedOptions.push(_.parseInt(this.editorState.answer));
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
    if (_.isString(correctAnswer)) {
      options = _.map(editorState.options, (opt, key) => {
        resindex = Number(key);
        if (_.parseInt(correctAnswer) === resindex) {
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
      editorState: {
        options,
      },
      qType: 'MCQ',
      primaryCategory: this.questionPrimaryCategory || 'Multiple Choice Question',
    };
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
    const interactOptions = _.map(options, (opt, key) => {
      index = Number(key);
      const hints  = _.get(this.editorState, `interactions.response1.options[${index}].hints`)
      return { label: opt.body, value: index, hints };
    });
    this.subMenuConfig(options);
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
    _.set(this.editorState, `interactions.response1.options[${optionIndex}].hints.en`, value)
  }

  subMenuConfig(options) {
    this.subMenus = []
    options.map((opt, index) => {
      const value  = _.get(this.editorState, `interactions.response1.options[${index}].hints.en`)
      this.subMenus[index] = [
        {
          id: 'addHint',
          name: 'Add Hint',
          value,
          label: 'Hint',
          enabled: value ? true : false,
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
        this.editorState.answer = _.toString(this.selectedOptions[0]);
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
