import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, ViewEncapsulation } from '@angular/core';
import { merge, of, Subject, Subscription } from 'rxjs';
import * as _ from 'lodash-es';
import { takeUntil, filter, switchMap, map } from 'rxjs/operators';
import { TreeService } from '../../services/tree/tree.service';
import { EditorService } from '../../services/editor/editor.service';
import { FrameworkService } from '../../services/framework/framework.service';
import { HelperService } from '../../services/helper/helper.service';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ConfigService } from '../../services/config/config.service';
import { ToasterService } from '../../services/toaster/toaster.service';
import * as moment from 'moment';
let framworkServiceTemp;

@Component({
  selector: 'lib-meta-form',
  templateUrl: './meta-form.component.html',
  styleUrls: ['./meta-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MetaFormComponent implements OnChanges, OnDestroy {
  @Input() rootFormConfig: any;
  @Input() unitFormConfig: any;
  @Input() nodeMetadata: any;
  @Output() toolbarEmitter = new EventEmitter<any>();
  private onComponentDestroy$ = new Subject<any>();
  public frameworkDetails: any = {};
  public formFieldProperties: any;
  public showAppIcon = false;
  public appIconConfig: any;
  public appIcon: any;
  public previousShuffleValue: boolean;
  public subscription: Subscription;
  constructor(private editorService: EditorService, public treeService: TreeService,
              public frameworkService: FrameworkService, private helperService: HelperService,
              private configService: ConfigService, private toasterService: ToasterService) {
                framworkServiceTemp = frameworkService;
               }

  ngOnChanges() {
    this.fetchFrameWorkDetails();
    this.setAppIconData();
    if (_.has(this.nodeMetadata, 'data.metadata.shuffle')) {
      this.setShuffleValue(this.nodeMetadata.data.metadata.shuffle);
    }
  }

  setAppIconData() {
    const isRootNode = _.get(this.nodeMetadata, 'data.root');
    this.appIconConfig = _.find(_.flatten(_.map(this.rootFormConfig, 'fields')), {code: 'appIcon'});
    if(_.isUndefined(this.appIconConfig)) {
      this.appIconConfig = _.find(this.rootFormConfig, {code: 'appIcon'});
    }
    if (!_.isUndefined(this.appIconConfig) && isRootNode === true) {
      this.showAppIcon = true;
    } else {
      this.showAppIcon = false;
    }
    this.appIcon = _.get(this.nodeMetadata, 'data.metadata.appIcon');
    if (this.isReviewMode()) {
      this.appIconConfig = {...this.appIconConfig , ... {isAppIconEditable: false}};
    } else {
      this.appIconConfig = {...this.appIconConfig , ... {isAppIconEditable: true}};
    }
    const ifEditable = this.ifFieldIsEditable('appIcon');
  }

  setShuffleValue(value) {
    if (_.isBoolean(value)) {
      this.helperService.setShuffleValue(value);
    }
  }

  showShuffleMessage(event) {
    this.subscription = this.helperService.shuffleValue.subscribe(shuffle => this.previousShuffleValue = shuffle);
    if (_.isBoolean(event.shuffle) && event.shuffle === true && _.isBoolean(this.previousShuffleValue) &&  this.previousShuffleValue === false) {
      this.toasterService.simpleInfo(_.get(this.configService, 'labelConfig.lbl.shuffleOnMessage'));
    }
    this.setShuffleValue(event.shuffle);
  }

  fetchFrameWorkDetails() {
    if (this.frameworkService.organisationFramework) {
      this.frameworkService.frameworkData$.pipe(
        takeUntil(this.onComponentDestroy$),
        filter(data => _.get(data, `frameworkdata.${this.frameworkService.organisationFramework}`))
      ).subscribe((frameworkDetails: any) => {
        if (frameworkDetails && !frameworkDetails.err) {
          const frameworkData = frameworkDetails.frameworkdata[this.frameworkService.organisationFramework].categories;
          this.frameworkDetails.frameworkData = frameworkData;
          this.frameworkDetails.topicList = _.get(_.find(frameworkData, {
            code: 'topic'
          }), 'terms');
          this.frameworkDetails.targetFrameworks = _.filter(frameworkDetails.frameworkdata, (value, key) => {
            return _.includes(this.frameworkService.targetFrameworkIds, key);
          });
          this.attachDefaultValues();
        }
      });
    } else {
      if (this.frameworkService.targetFrameworkIds) {
        this.frameworkService.frameworkData$.pipe(
          takeUntil(this.onComponentDestroy$),
          filter(data => _.get(data, `frameworkdata.${_.first(this.frameworkService.targetFrameworkIds)}`))
        ).subscribe((frameworkDetails: any) => {
          if (frameworkDetails && !frameworkDetails.err) {
            this.frameworkDetails.targetFrameworks = _.filter(frameworkDetails.frameworkdata, (value, key) => {
              return _.includes(this.frameworkService.targetFrameworkIds, key);
            });
            this.attachDefaultValues();
          }
        });
      }
    }
  }

  attachDefaultValues() {
    const metaDataFields = _.get(this.nodeMetadata, 'data.metadata');
    const isRootNode = _.get(this.nodeMetadata, 'data.root');
    const categoryMasterList = this.frameworkDetails.frameworkData ||
    !isRootNode && this.frameworkService.selectedOrganisationFramework &&
     _.get(this.frameworkService.selectedOrganisationFramework, 'framework.categories');
    // tslint:disable-next-line:max-line-length
    let formConfig: any = (_.get(metaDataFields, 'visibility') === 'Default') || isRootNode ? _.cloneDeep(this.rootFormConfig) : _.cloneDeep(this.unitFormConfig);
    formConfig = formConfig && _.has(_.first(formConfig), 'fields') ? formConfig : [{name: '', fields: formConfig}];
    if (!_.isEmpty(this.frameworkDetails.targetFrameworks)) {
      _.forEach(this.frameworkDetails.targetFrameworks, (framework) => {
        _.forEach(formConfig, (section) => {
          _.forEach(section.fields, field => {
            const frameworkCategory = _.find(framework.categories, category => {
              return category.code === field.sourceCategory && _.includes(field.code, 'target');
            });
            if (!_.isEmpty(frameworkCategory)) { // field.code
              field.terms = frameworkCategory.terms;
            }
          });
        });
      });
    }

    _.forEach(formConfig, (section) => {
      _.forEach(section.fields, field => {

        if (metaDataFields) {
          if (_.has(metaDataFields, field.code)) {
            field.default = _.get(metaDataFields, field.code);
          } else if (_.includes(['maxTime'], field.code)) {
            const value = _.get(metaDataFields, 'timeLimits.questionSet.max') ? _.toString(_.get(metaDataFields, 'timeLimits.questionSet.max')) : '';
            field.default = !_.isEmpty(value) ?
            _.toString(moment.utc(moment.duration(value, 'seconds').asMilliseconds()).format(this.helperService.getTimerFormat(field))) : null;
          }
        }
        if (field.code === 'framework') {
          field.range = this.frameworkService.frameworkValues;
          field.options = this.getFramework;
        }

        if (!_.includes(field.depends, 'framework') && !_.includes(field.code, 'target')) {
          const frameworkCategory = _.find(categoryMasterList, category => {
              return (category.code === field.sourceCategory || category.code === field.code);
          });
          if (!_.isEmpty(frameworkCategory)) {
              field.terms = frameworkCategory.terms;
          }
        }

        if (field.code === 'license') {
          const defaultLicense = _.get(metaDataFields, field.code);
          field.default = !_.isEmpty(defaultLicense) ? defaultLicense : this.editorService.editorConfig.context.defaultLicense;
          const licenses = this.helperService.getAvailableLicenses();
          field.range = licenses ? _.map(licenses, 'name') : [];
        }

        if (field.code === 'additionalCategories') {
          const channelInfo = this.helperService.channelInfo;
          const additionalCategories = _.uniq(_.get(channelInfo,
            `${this.configService.categoryConfig.additionalCategories[this.editorService.editorConfig.config.objectType]}`) ||
           _.get(this.editorService.editorConfig, 'context.additionalCategories'));
          if (!_.isEmpty(additionalCategories)) {
            field.range = _.uniq(additionalCategories);
          }
        }

        if (field.code  === 'copyright') {
          const channelData = this.helperService.channelInfo;
          field.default = _.get(metaDataFields, field.code);
          if (_.isEmpty(field.default) && this.editorService.editorConfig.config.setDefaultCopyRight) {
            field.default = channelData?.name;
          }
        }

        if (field.code === 'maxQuestions') {
          const activeNode = this.treeService.getActiveNode();
          const rootFirstChildNode = this.editorService.getContentChildrens(activeNode);
          if (rootFirstChildNode && rootFirstChildNode.length > 0) {
            field.range = _.times(_.size(rootFirstChildNode), index => index + 1);
          }
        }

        if (field.code === 'author') {
          const defaultAuthor = _.get(metaDataFields, field.code);
          field.default = !_.isEmpty(defaultAuthor) ? defaultAuthor :  _.get(this.editorService.editorConfig, 'context.user.fullName');
        }

        if (field.code === 'showTimer') {
          field.options = this.showTimer;
        }
        if (field.code === 'instructions') {
          field.default = _.get(metaDataFields, 'instructions') || '' ;
        }
        if (field.code === 'setPeriod') {
          field.default = !_.isEmpty(metaDataFields, 'endDate') ? 'Yes' : 'No' ;
        }
        if (field.code === 'allowECM') {
          field.default = _.get(metaDataFields, 'recordedBy') !== 'Self' ? 'Yes' : 'No' ;
        }

        if (field.code === 'instances') {
          field.default =  !_.isEmpty(metaDataFields, 'instances') ? _.get(metaDataFields, 'instances.label') : '' ;
        }

        if ((_.isEmpty(field.range) || _.isEmpty(field.terms)) &&
          !field.editable && !_.isEmpty(field.default)) {
          if (_.has(field, 'terms')) {
            field.terms = [];
            if (_.isArray(field.default)) {
              field.terms = field.default || [];
            } else {
              field.terms.push(field.default);
            }
          } else {
            field.range = [];
            if (_.isArray(field.default)) {
              field.range = field.default;
            } else {
              field.range.push(field.default);
            }
          }
        }

        if (field.inputType === 'nestedselect') {
          _.map(field.range, val => {
            return {
              value: val.value || val,
              label: val.value || val
            };
          });
        }

        const ifEditable = this.ifFieldIsEditable(field.code, field.editable);
        _.set(field, 'editable', ifEditable);

      });
    });

    this.formFieldProperties = _.cloneDeep(formConfig);
  }
  isReviewMode() {
    return  _.includes([ 'review', 'read', 'sourcingreview', 'orgreview' ], this.editorService.editorMode);
  }
  ifFieldIsEditable(fieldCode, primaryCategoryEditableConfig?) {
    const ediorMode = this.editorService.editorMode;
    if (!this.isReviewMode()) {
      if(primaryCategoryEditableConfig === false) return false;
      return true;
    }
    const editableFields = _.get(this.editorService.editorConfig.config, 'editableFields');
    if (editableFields && !_.isEmpty(editableFields[ediorMode]) && _.includes(editableFields[ediorMode], fieldCode)) {
      return true;
    }
    return false;
  }

  onStatusChanges(event) {
    this.toolbarEmitter.emit({ button: 'onFormStatusChange', event });
  }

  appIconDataHandler(event) {
    this.appIcon = event.url;
    this.treeService.updateAppIcon(event.url);
  }

  showTimer(control, depends: UntypedFormControl[], formGroup: UntypedFormGroup, loading, loaded) {
    const oldValue = {};
    const response = merge(..._.map(depends, depend => depend.valueChanges)).pipe(
      switchMap((value: any) => {
        const isDependsInvalid = _.includes(_.map(depends, depend => depend.invalid), true);
        const dependsKeyValue = _.map(depends, (depend, key) => {
          return { [key]: depend.value };
        });
        if (!isDependsInvalid) {
          const maxTimeValue = _.find(dependsKeyValue, 'maxTime');
          if ( maxTimeValue && maxTimeValue.maxTime === '00:00:00') {
            return of(false);
          }
          return of(true);
        } else {
          return of(false);
        }
      })
    );
    return response;
  }

  getFramework(control, depends: UntypedFormControl[], formGroup: UntypedFormGroup, loading, loaded) {
    const response =  control.valueChanges.pipe(
      switchMap((value: any) => {
        if (!_.isEmpty(value)) {
          return framworkServiceTemp.getFrameworkCategories(value).pipe(map(res => {
            const frameworkResponse = _.get(res, 'result');
            framworkServiceTemp.selectedOrganisationFramework = frameworkResponse;
            return frameworkResponse;
          }));
        } else {
          return of(null);
        }
      })
    );
    return response;
  }

  valueChanges(event: any) {
    if (_.has(event, 'shuffle')) {
      this.showShuffleMessage(event);
    }
    const data = _.omit(event, ['allowECM', 'levels', 'setPeriod']);
    if (!_.isEmpty(event?.levels)) {
      data.outcomeDeclaration = {
        levels: this.createLeavels(event.levels)
      };
    }
    if (event?.instance) {
      data.instances = { label : event?.instances }
    }
    if (!_.isEmpty(this.appIcon) && this.showAppIcon) {
      data.appIcon = this.appIcon;
    }
    this.toolbarEmitter.emit({ button: 'onFormValueChange', data });
    this.treeService.updateNode(data);
  }

  createLeavels(levels) {
    const obj = {};
    _.forEach(levels, (el, index) => {
      obj[`L${index + 1}`] = {
         label : el
       };
    });
    return obj;
  }


  ngOnDestroy() {
    this.onComponentDestroy$.next();
    this.onComponentDestroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
