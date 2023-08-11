import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
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
  @Input() questionInteractionType;
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
    let body: any;
    if (this.questionInteractionType === 'choice') {
      body = this.prepareMcqBody(this.editorState);
    } else if (this.questionInteractionType === 'match') {
      body = this.prepareMtfBody(this.editorState);
    }
    this.editorDataOutput.emit({
      body,
      mediaobj: event ? event.mediaobj : undefined,
    });
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
      editorState: {
        options,
      },
      qType: 'MCQ',
      primaryCategory: this.questionPrimaryCategory || 'Multiple Choice Question',
    };
    return metadata;
  }

  prepareMtfBody(editorState) {
    let metadata: any;
    const correctAnswer = editorState.answer;
    let options: any;
    if (!_.isEmpty(correctAnswer)) {
      options = _.reduce(this.editorState.options,function (acc, obj) {
          acc.leftOption.push(obj.leftOption);
          acc.rightOption.push(obj.rightOption);
          return acc;
        },{ leftOption: [], rightOption: [] }
      );
    }
    console.log(options);
    console.log(editorState.answer);
    metadata = {
      templateId: this.templateType,
      name: this.questionPrimaryCategory || 'Match The Following Question',
      responseDeclaration: this.getResponseDeclaration(editorState),
      outcomeDeclaration: this.getOutcomeDeclaration(),
      interactionTypes: ['match'],
      interactions: this.getInteractions(editorState.options),
      editorState: {
        options,
      },
      qType: 'MTF',
      primaryCategory: this.questionPrimaryCategory || "Match The Following Question",
    };
    return metadata;
  }
  getResponseDeclaration(editorState) {
    const responseDeclaration = {
      response1: {
        cardinality: this.getCardinality(),
        type: this.questionInteractionType === 'choice' ? 'integer' : 'map',
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
    if (this.questionInteractionType === 'choice') {
      if (!_.isEmpty(this.selectedOptions)) {
        this.mapping = [];
        const scoreForEachOption = _.round((this.maxScore/this.selectedOptions.length), 2);
        _.forEach(this.selectedOptions, (value) => {
          const optionMapping = {
            value: value,
            score: scoreForEachOption,
          };
          this.mapping.push(optionMapping);
        });
      }      
    } else if(this.questionInteractionType === 'match') {
      if (!_.isEmpty(this.editorState.answer)) {
        this.mapping = [];
        const scoreForEachMatch = _.round(
          this.maxScore / this.editorState.answer.length,
          2
        );
        _.forEach(this.editorState.answer, (value) => {
          const optionMapping = {
            value: value,
            score: scoreForEachMatch,
          };
          this.mapping.push(optionMapping);
        })
      }
    } else {
      this.mapping = [];
    }
  }

  getInteractions(options) {
    if (this.questionInteractionType === 'choice') {
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
    else if (this.questionInteractionType === 'match') {
      const optionSet = {
        left: options.map((option) => ({
          label: option.leftOption,
          value: option.leftOption.replace(/<\/?[^>]+(>|$)/g, ""),
        })),
        right: options.map((option) => ({
          label: option.rightOption,
          value: option.rightOption.replace(/<\/?[^>]+(>|$)/g, ""),
        })),
      }
      const interactions = {
        response1: {
          type: 'match',
          optionSet: optionSet,
        }
      };
      return interactions;
    }
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
        this.editorState.answer = this.selectedOptions[0];
      } else if(this.selectedOptions.length > 1) {
        this.editorState.answer = this.selectedOptions;
      } else {
        this.editorState.answer = undefined;
      }
      this.setMapping();
      this.editorDataHandler();
  }
  
  onMatchCheck(event) {
    if (event.target.checked) {
      this.editorState.answer = this.editorState.options.map((option) => {
        const obj = {};
        let leftOption = option.leftOption.replace(/<\/?[^>]+(>|$)/g, "");
        let rightOption = option.rightOption.replace(/<\/?[^>]+(>|$)/g, "");
        obj[leftOption] = rightOption;
        return obj;
      });
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
