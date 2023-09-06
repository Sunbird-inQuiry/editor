import { Component, Input, OnInit, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';
import * as _ from 'lodash-es';
import { EditorTelemetryService } from '../../services/telemetry/telemetry.service';
import { ConfigService } from '../../services/config/config.service';

@Component({
  selector: 'lib-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit, OnChanges {
  @Input() editorState: any;
  @Input() showFormError;
  @Input() questionPrimaryCategory;
  @Input() mapping = [];
  @Input() isReadOnlyMode;
  @Input() maxScore;
  @Output() editorDataOutput: EventEmitter<any> = new EventEmitter<any>();
  public setCharacterLimit = 160;
  public templateType = 'mtf-horizontal';
  
  constructor(
    public telemetryService: EditorTelemetryService,
    public configService: ConfigService,
  ) {}

  ngOnInit() {
    if (!_.isUndefined(this.editorState.templateId)) {
      this.templateType = this.editorState.templateId;
    }
    this.mapping = _.get(this.editorState, 'responseDeclaration.response1.mapping') || [];
    this.editorDataHandler();
  }
  ngOnChanges(changes: SimpleChanges){
    if (!_.isUndefined(changes.maxScore.previousValue) && !_.isNaN(changes.maxScore.currentValue)) {
      this.setMapping();
      this.editorDataHandler();
    }
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
    if (!_.isEmpty(editorState.options)) {
      editorState.correctMatchPair = editorState.options.map((option, index) => {
        const correctMatchPair = {};
        correctMatchPair[index.toString()] = index;
        return correctMatchPair;
      });
    }
    this.setMapping();
    let options: any;
    if (!_.isEmpty(editorState.correctMatchPair)) {
      options = {
        left: editorState.options.map((option, index) => {
          return {
            value: {
              body: option.left,
              value: index,
            }
          }
        }),
        right: editorState.options.map((option, index) => {
          return {
            value: {
              body: option.right,
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
          value: editorState.correctMatchPair,
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
      if (!_.isEmpty(this.editorState.correctMatchPair)) {
        this.mapping = [];
        const scoreForEachMatch = _.round(
          this.maxScore / this.editorState.correctMatchPair.length,
          2
        );
        _.forEach(this.editorState.correctMatchPair, (value) => {
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
        left: options.map((option,index) => ({
          label: option.left,
          value: index,
        })),
        right: options.map((option,index) => ({
          label: option.right,
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

  setTemplate(template) {
    this.templateType = template;
    this.editorDataHandler();
  }
}
