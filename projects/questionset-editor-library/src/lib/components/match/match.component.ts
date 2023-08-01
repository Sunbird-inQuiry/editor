import { Component, Input, OnInit, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';
import * as _ from 'lodash-es';
import { EditorTelemetryService } from '../../services/telemetry/telemetry.service';
import { ConfigService } from '../../services/config/config.service';
import { SubMenu } from '../question-option-sub-menu/question-option-sub-menu.component';
import { TreeService } from '../../services/tree/tree.service';
import { EditorService } from '../../services/editor/editor.service';

@Component({
  selector: 'lib-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit, OnChanges {
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
  public templateType = 'default';
  subMenus: SubMenu[][];
  hints = [];
  showSubMenu: boolean = false;
  parentMeta: any;
  selectedOptions = [];
  constructor(
    public telemetryService: EditorTelemetryService,
    public configService: ConfigService,
    public treeService: TreeService,
    private editorService: EditorService
  ) {}

  ngOnInit() {
    if (!_.isUndefined(this.editorState.answer)) {
      this.addSelectedOptions();
    }
    if (!_.isUndefined(this.editorState.templateId)) {
      this.templateType = this.editorState.templateId;
    }
    this.mapping = _.get(this.editorState, 'responseDeclaration.response1.mapping') || [];
    this.editorDataHandler();
    if (!_.isUndefined(this.editorService.editorConfig.config.renderTaxonomy)) {
      this.parentMeta = this.treeService.getFirstChild().data.metadata;
      this.showSubMenu = true;
    }
  }
  ngOnChanges(changes: SimpleChanges){
    if (!_.isUndefined(changes.maxScore.previousValue) && !_.isNaN(changes.maxScore.currentValue)) {
      this.setMapping();
      this.editorDataHandler();
    }
  }
  addSelectedOptions() {
    this.selectedOptions = this.editorState.answer;
  }

  editorDataHandler(event?) {
    const body = this.prepareMtfBody(this.editorState);
    this.editorDataOutput.emit({
      body,
      mediaobj: event ? event.mediaobj : undefined,
    });
  }
  prepareMtfBody(editorState) {
    let metadata: any;
    const correctAnswer = editorState.answer;
    let options: any;
    if (!_.isEmpty(correctAnswer)) {
      options = {
        leftOptions: editorState.options.map((option, index) => {
          return {
            value: {
              body: option.leftOption,
              value: index,
            }
          }
        }),
        rightOptions: editorState.options.map((option, index) => {
          return {
            value: {
              body: option.rightOption,
              value: index,
            }
          }
        })
      }
    }
    metadata = {
      templateId: this.templateType,
      name: this.questionPrimaryCategory || "Match The Following Question",
      responseDeclaration: this.getResponseDeclaration(editorState),
      outcomeDeclaration: this.getOutcomeDeclaration(),
      interactionTypes: ["match"],
      interactions: this.getInteractions(editorState.options),
      editorState: {
        options,
      },
      qType: "MTF",
      primaryCategory:
        this.questionPrimaryCategory || "Match The Following Question",
    };
    return metadata;
  }
  getResponseDeclaration(editorState) {
    const responseDeclaration = {
      response1: {
        cardinality: 'multiple',
        type: 'map',
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
        cardinality: 'multiple',
        type: 'integer',
        defaultValue: this.maxScore
      }
    };
    return outcomeDeclaration;
  }
  
  setMapping() {
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
      } else {
        this.mapping = [];
      }
  }

  getInteractions(options) {
      const optionSet = {
        leftOptions: options.map((option,index) => ({
          label: option.leftOption,
          value: index,
        })),
        rightOptions: options.map((option,index) => ({
          label: option.rightOption,
          value: index,
        })),
      }
      const interactions = {
        response1: {
          type: 'match',
          options: optionSet,
        }
      };
      return interactions;
    }

  onOptionChange(event,index) {
      if(event.body!=='' && !_.includes(this.selectedOptions, index)) {
        this.selectedOptions.push(index);
      } else if(event.body === '') {
        _.remove(this.selectedOptions, (n) => {
          return n === index;
        });
      }
      if(this.selectedOptions === undefined){
        this.editorState.answer = undefined;
      }
      else {
        this.editorState.answer = this.selectedOptions.map((value) => ({ [value]: value }));
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
