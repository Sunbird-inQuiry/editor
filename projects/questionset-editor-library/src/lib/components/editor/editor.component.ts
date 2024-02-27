import {
  Component, HostListener, Input, OnDestroy, OnInit, ChangeDetectorRef,
  EventEmitter, Output, ViewEncapsulation, AfterViewInit, ViewChild
} from '@angular/core';
import { EditorService } from '../../services/editor/editor.service';
import { TreeService } from '../../services/tree/tree.service';
import { FrameworkService } from '../../services/framework/framework.service';
import { EditorTelemetryService } from '../../services/telemetry/telemetry.service';
import { ToasterService } from '../../services/toaster/toaster.service';
import { HelperService } from '../../services/helper/helper.service';
import { IEditorConfig } from '../../interfaces/editor';
import { ICreationContext } from '../../interfaces/CreationContext';
import { Router } from '@angular/router';
import { filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { Observable, throwError, forkJoin, Subscription, Subject, merge, of } from 'rxjs';
import * as _ from 'lodash-es';
import { ConfigService } from '../../services/config/config.service';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

let evidenceMimeType;
let ecm;

@Component({
  selector: 'lib-questionset-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EditorComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() editorConfig: IEditorConfig | undefined;
  @Output() editorEmitter = new EventEmitter<any>();
  @ViewChild('modal') private modal;
  public questionComponentInput: any = {};
  public creationContext: ICreationContext;
  public collectionTreeNodes: any;
  public selectedNodeData: any = {};
  public templateList: any;
  public showConfirmPopup = false;
  public terms = false;
  public pageId: string;
  public pageStartTime;
  public rootFormConfig: any;
  public unitFormConfig: any;
  public searchFormConfig: any;
  public leafFormConfig: any;
  public relationFormConfig: any;
  public questionlibraryInput: any = {};
  public editorMode;
  public collectionId;
  public isCurrentNodeFolder: boolean;
  public isCurrentNodeRoot: boolean;
  public isQumlPlayer: boolean;
  public showQuestionTemplatePopup = false;
  public deleteConfirmMessage;
  public showDeleteConfirmationPopUp = false;
  public showPreview = false;
  public actionType: string;
  private formStatusMapper: { [key: string]: boolean } = {};
  public targetFramework;
  public organisationFramework;
  public primaryCategoryDef: any;
  public collectionPrimaryCategoryDef: any;
  toolbarConfig: any;
  public buttonLoaders = {
    saveAsDraftButtonLoader: false,
    addFromLibraryButtonLoader: false,
    addQuestionFromLibraryButtonLoader: false,
    previewButtonLoader: false,
    showReviewComment: false
  };
  public contentComment: string;
  public showReviewModal: boolean;
  public objectType: string;
  public isStatusReviewMode = false;
  public ishierarchyConfigSet =  false;
  public publishchecklist: any;
  public unSubscribeshowQuestionLibraryPageEmitter: Subscription;
  public sourcingSettings: any;
  public setChildQuestion: any;
  draftComment:string = '';
  public unsubscribe$ = new Subject<void>();
  public onComponentDestroy$ = new Subject<any>();
  constructor(private editorService: EditorService, public treeService: TreeService, private frameworkService: FrameworkService,
              private helperService: HelperService, public telemetryService: EditorTelemetryService, private router: Router,
              private toasterService: ToasterService,
              public configService: ConfigService, private changeDetectionRef: ChangeDetectorRef) {
  }

  @HostListener('window:unload', ['$event'])
  unloadHandler(event) {
    this.generateTelemetryEndEvent();
  }

  setEditorConfig() {
    if (this.editorConfig) {
      if (typeof this.editorConfig === 'string') {
        try {
          this.editorConfig = JSON.parse(this.editorConfig);
        } catch (error) {
          console.error('Invalid editor config: ', error);
        }
      }
    }
  }

  ngOnInit() {
    this.setEditorConfig();
    this.editorService.initialize(this.editorConfig);
    this.editorMode = this.editorService.editorMode;
    this.treeService.initialize(this.editorConfig);
    this.objectType = this.configService.categoryConfig[this.editorConfig.config.objectType];
    this.collectionId = _.get(this.editorConfig, 'context.identifier');
    this.toolbarConfig = this.editorService.getToolbarConfig();
    this.isStatusReviewMode = this.isReviewMode();

    if (this.objectType === 'question') {
      this.handleQuestionObjectType();
    } else {
      this.pageId = 'questionset_editor';
      this.mergeCollectionExternalProperties().subscribe(
        (response) => {
          const hierarchyResponse = _.first(response);
          const collection = _.get(hierarchyResponse, `result.${this.objectType}`);
          this.toolbarConfig.title = collection.name;
          this.initializeFrameworkAndChannel(collection);
        });
    }

    this.editorService.getCategoryDefinition(this.editorConfig.config.primaryCategory,
      this.editorConfig.context.channel, this.editorConfig.config.objectType)
      .subscribe(
        (response) => {
          this.sourcingSettings = _.get(response, 'result.objectCategoryDefinition.objectMetadata.config.sourcingSettings', {});
          this.helperService.channelData$.subscribe(
            (channelResponse) => {
              this.primaryCategoryDef = response;
              if (this.objectType !== 'question') { this.sethierarchyConfig(response); }
            }
          );
        },
        (error) => {
          console.log(error);
        }
      );
    this.pageStartTime = Date.now();
    this.telemetryService.initializeTelemetry(this.editorConfig);
    this.telemetryService.telemetryPageId = this.pageId;
    this.telemetryService.start({ type: 'editor', pageid: this.telemetryService.telemetryPageId });
    this.unSubscribeshowQuestionLibraryPageEmitter = this.editorService.getshowQuestionLibraryPageEmitter()
    .subscribe(item => this.showQuestionLibraryComponentPage());
    this.treeService.treeStatus$.pipe(takeUntil(this.unsubscribe$)).subscribe((status) => {
      if (status === 'loaded') {
        this.getFrameworkDetails(this.primaryCategoryDef);
      }
    });
    this.editorService.readComment(this.collectionId).subscribe((res) => {
      this.draftComment = res.result.comments[0].comment;
    })
  }

  handleQuestionObjectType() {
    this.collectionId = _.get(this.editorConfig, 'context.collectionIdentifier');
    this.initializeFrameworkAndChannel();
    this.editorService.getCategoryDefinition(_.get(this.editorConfig, 'context.collectionPrimaryCategory'),
    this.editorConfig.context.channel, _.get(this.editorConfig, 'context.collectionObjectType'))
    .subscribe(
      (response) => {
        this.collectionPrimaryCategoryDef = response;
        this.getFrameworkDetails(this.collectionPrimaryCategoryDef);
        this.editorService.selectedChildren = {
          primaryCategory: _.get(this.editorConfig, 'config.primaryCategory'),
          mimeType: _.get(this.editorConfig, 'config.mimeType'),
          interactionType: _.get(this.editorConfig, 'config.interactionType')
        };
        const objectMetadata = _.get(response, 'result.objectCategoryDefinition.objectMetadata');
        if (objectMetadata.childrenConfig) {
          this.questionComponentInput.config = objectMetadata.childrenConfig[_.get(this.editorConfig, 'config.interactionType')] || {};
        }
        this.redirectToQuestionTab(_.get(this.editorConfig, 'config.mode'));
      }
    );
  }

  initializeFrameworkAndChannel(collection?: any) {
    this.organisationFramework = _.get(collection, 'framework') || _.get(this.editorConfig, 'context.framework');
    this.targetFramework = _.get(collection, 'targetFWIds') || _.get(this.editorConfig, 'context.targetFWIds');
    if (this.organisationFramework) {
      this.frameworkService.initialize(this.organisationFramework);
    }
    if (!_.isEmpty(this.targetFramework)) {
      this.frameworkService.getTargetFrameworkCategories(this.targetFramework);
    }
    const channel = _.get(collection, 'channel') || _.get(this.editorConfig, 'context.channel');
    this.helperService.initialize(channel);
  }

  getFrameworkDetails(categoryDefinitionData) {
    this.setPublishCheckList(categoryDefinitionData);
    if (_.isEmpty(this.targetFramework || _.get(this.editorConfig, 'context.targetFWIds'))) {
      this.setTargetFrameworkData(categoryDefinitionData);
    }
    this.setOrgFrameworkData(categoryDefinitionData)

  }

  setOrgFrameworkData(categoryDefinitionData) {
    let orgFWIdentifiers: any;
    let orgFWType: any;
    orgFWIdentifiers = _.get(categoryDefinitionData, 'result.objectCategoryDefinition.objectMetadata.schema.properties.framework.enum') ||
    _.get(categoryDefinitionData, 'result.objectCategoryDefinition.objectMetadata.schema.properties.framework.default');

    if (_.isEmpty(orgFWIdentifiers)) {
      let orgFrameworkList = [];
      orgFWType = _.get(categoryDefinitionData, 'result.objectCategoryDefinition.objectMetadata.config.frameworkMetadata.orgFWType');
      const channelFrameworksType = _.map(_.get(this.helperService.channelInfo, 'frameworks'), 'type');
      const difference = _.difference(orgFWType, _.uniq(channelFrameworksType));
      if (channelFrameworksType) {
        orgFrameworkList = _.map(_.get(this.helperService.channelInfo, 'frameworks'), (framework) => {
          return { label: framework.name, identifier: framework.identifier };
        });
      }

      if (orgFWType && channelFrameworksType && _.isEmpty(difference)) {
        this.frameworkService.frameworkValues = orgFrameworkList;
        this.setEditorForms(categoryDefinitionData);
      } else if (orgFWType && channelFrameworksType && !_.isEmpty(difference) || _.isEmpty(channelFrameworksType)) {
        this.frameworkService.getFrameworkData(undefined, difference, undefined, 'Yes').subscribe(
          (response) => {
            this.frameworkService.frameworkValues = _.concat(_.map(_.get(response, 'result.Framework'), framework => {
              return { label: framework.name, identifier: framework.identifier };
            }), orgFrameworkList);
            this.setEditorForms(categoryDefinitionData);
          }, error => {
            console.log('error', error);
          }
        );
      } else if (this.organisationFramework) {
        this.setEditorForms(categoryDefinitionData);
      }
    } else {
      this.frameworkService.getFrameworkData(undefined, undefined, orgFWIdentifiers).subscribe(
        (response) => {
          this.frameworkService.frameworkValues = _.concat(_.map(_.get(response, 'result.Framework'), framework => {
            return { label: framework.name, identifier: framework.identifier };
          }));
          this.setEditorForms(categoryDefinitionData);
        }, error => {
          console.log('error', error);
        }
      );
    }
  }

  setTargetFrameworkData(categoryDefinitionData) {
    let targetFWIdentifiers;
    let targetFWType;
    targetFWIdentifiers = _.get(categoryDefinitionData, 'result.objectCategoryDefinition.objectMetadata.schema.properties.targetFWIds.default');
    if (_.isEmpty(targetFWIdentifiers)) {
      targetFWType = _.get(categoryDefinitionData, 'result.objectCategoryDefinition.objectMetadata.config.frameworkMetadata.targetFWType');
      const channelFrameworks = _.get(this.helperService.channelInfo, 'frameworks');
      const channelFrameworksType = _.map(channelFrameworks, 'type');
      const difference = _.difference(targetFWType, _.uniq(channelFrameworksType));

      if (targetFWType && channelFrameworksType && _.isEmpty(difference)) {
        this.targetFramework = _.get(_.first(_.filter(channelFrameworks, framework => {
          return framework.type === _.first(targetFWType);
        })), 'identifier');
        this.treeService.updateMetaDataProperty('targetFWIds', _.castArray(this.targetFramework));
        this.frameworkService.getTargetFrameworkCategories(_.castArray(this.targetFramework));
      } else if ((targetFWType && channelFrameworksType && !_.isEmpty(difference)) || _.isEmpty(channelFrameworksType)) {
        this.frameworkService.getFrameworkData(undefined, difference, undefined, 'Yes').subscribe(
          (targetResponse) => {
            this.targetFramework = _.get(_.first(_.get(targetResponse, 'result.Framework')), 'identifier');
            if (!_.isEmpty(this.targetFramework)) {
              this.treeService.updateMetaDataProperty('targetFWIds', _.castArray(this.targetFramework));
              this.frameworkService.getTargetFrameworkCategories(_.castArray(this.targetFramework));
            }
          }
        );
      }
    } else {
      this.frameworkService.getFrameworkData(undefined, undefined, targetFWIdentifiers).subscribe(
        (targetResponse) => {
          this.targetFramework = _.get(_.first(_.get(targetResponse, 'result.Framework')), 'identifier');
          if (!_.isEmpty(this.targetFramework)) {
            this.treeService.updateMetaDataProperty('targetFWIds', _.castArray(this.targetFramework));
            this.frameworkService.getTargetFrameworkCategories(_.castArray(this.targetFramework));
          }
        }
      );
    }
  }

  setPublishCheckList(categoryDefinitionData) {
    this.publishchecklist = _.get(categoryDefinitionData, 'result.objectCategoryDefinition.forms.publishchecklist.properties') || _.get(categoryDefinitionData, 'result.objectCategoryDefinition.forms.review.properties') || [];
  }

  setEditorForms(categoryDefinitionData) {
    const formsConfigObj = _.get(categoryDefinitionData, 'result.objectCategoryDefinition.forms');
    this.unitFormConfig = _.get(formsConfigObj, 'unitMetadata.properties');
    this.rootFormConfig = _.get(formsConfigObj, 'create.properties');
    let formData;
    if (this.rootFormConfig?.length) {
      formData = this.rootFormConfig[0].fields || [];
    }
    formData.forEach((field) => {
      if (field.code === 'evidenceMimeType') {
        evidenceMimeType = field.range;
        field.options = this.setEvidence;
        field.range = null;
      } else if (field.code === 'allowECM') {
        field.options = this.setAllowEcm;
      } else if (field.code === 'ecm') {
        ecm = field.options;
        field.options = this.setEcm;
      }
    });
    if ( this.objectType === 'questionset' && _.has(formsConfigObj, 'searchConfig')) {
        this.questionlibraryInput.searchFormConfig = _.get(formsConfigObj, 'searchConfig.properties');
        this.questionlibraryInput.metadataFormConfig = _.get(formsConfigObj, 'childMetadata')
    } else {
      this.questionlibraryInput.searchFormConfig = _.get(formsConfigObj, 'search.properties');
      this.questionlibraryInput.metadataFormConfig = _.get(formsConfigObj, 'childMetadata')
    }
    this.leafFormConfig = _.get(formsConfigObj, 'childMetadata.properties');
    this.relationFormConfig = _.get(formsConfigObj, 'relationalMetadata.properties');
  }

  ngAfterViewInit() {
    this.telemetryService.impression({
      type: 'edit', pageid: this.telemetryService.telemetryPageId, uri: this.router.url,
      duration: (Date.now() - this.pageStartTime) / 1000
    });
  }

  mergeCollectionExternalProperties(): Observable<any> {
    const requests = [];
    this.collectionTreeNodes = null;
    requests.push(this.editorService.fetchCollectionHierarchy(this.collectionId));
    if (this.objectType === 'questionset') {
      requests.push(this.editorService.readQuestionSet(this.collectionId));
    }
    return forkJoin(requests).pipe(tap(responseList => {
      const hierarchyResponse = _.first(responseList);
      this.collectionTreeNodes = {
        data: _.get(hierarchyResponse, `result.${this.objectType}`)
      };
      this.buttonLoaders.showReviewComment = this.showCommentAddedAgainstContent();
      if (_.isEmpty(this.collectionTreeNodes.data.children)) {
        this.toolbarConfig.hasChildren = false;
      } else {
        this.toolbarConfig.hasChildren = true;
      }

      if (this.objectType === 'questionset') {
        const questionSetResponse = _.last(responseList);
        const data = _.get(questionSetResponse, _.toLower(`result.${this.objectType}`));
        this.collectionTreeNodes.data.instructions = data.instructions ? data.instructions : '';
        this.collectionTreeNodes.data.outcomeDeclaration = data?.outcomeDeclaration;
      }
    }
    ));
  }
  sethierarchyConfig(primaryCatConfig) {
    let hierarchyConfig;
    if (_.get(primaryCatConfig, 'result.objectCategoryDefinition.objectMetadata.config')) {
      hierarchyConfig = _.get(primaryCatConfig, 'result.objectCategoryDefinition.objectMetadata.config.sourcingSettings.collection');
      if (!_.isEmpty(hierarchyConfig.children)) {
        hierarchyConfig.children = this.getHierarchyChildrenConfig(hierarchyConfig.children);
      }
      if (!_.isEmpty(hierarchyConfig.hierarchy)) {
        _.forEach(hierarchyConfig.hierarchy, (hierarchyValue) => {
          if (_.get(hierarchyValue, 'children')) {
            hierarchyValue.children = this.getHierarchyChildrenConfig(_.get(hierarchyValue, 'children'));
          }
        });
      }
    }
    this.editorConfig.config = _.assign(this.editorConfig.config, hierarchyConfig);
    if (_.get(this.editorConfig, 'config.renderTaxonomy') === true && _.isEmpty(_.get(this.collectionTreeNodes, 'data.children'))) {
      this.fetchFrameWorkDetails();
    } else {
      this.ishierarchyConfigSet = true;
    }
  }

  fetchFrameWorkDetails() {
    this.frameworkService.frameworkData$.pipe(
      takeUntil(this.onComponentDestroy$),
      filter(data => _.get(data, `frameworkdata.${this.frameworkService.organisationFramework}`)),
      take(1)
    ).subscribe((frameworkDetails: any) => {
      if (frameworkDetails && !frameworkDetails.err) {
        const orgFrameworkData = _.get(frameworkDetails, `frameworkdata.${this.frameworkService.organisationFramework}.categories`);
        const categoryInstanceData = _.find(orgFrameworkData, {code: _.get(this.editorConfig, 'config.categoryInstance')});
        this.collectionTreeNodes.data.children = _.get(categoryInstanceData, 'terms');
        this.ishierarchyConfigSet = true;
      }
    });
  }

  getHierarchyChildrenConfig(childrenData) {
    _.forEach(childrenData, (value, key) => {
      if (_.isEmpty(value)) {
        switch (key) {
          case 'Question':
            childrenData[key] = _.map(this.helperService.questionPrimaryCategories, 'name') || this.editorConfig.config.questionPrimaryCategories;
            break;
          case 'Content':
            childrenData[key] = _.map(this.helperService.contentPrimaryCategories, 'name') || [];
            break;
          case 'Collection':
            childrenData[key] = _.map(this.helperService.collectionPrimaryCategories, 'name') || [];
            break;
          case 'QuestionSet':
            childrenData[key] = _.map(this.helperService.questionsetPrimaryCategories, 'name') || [];
            break;
        }
      }
    });
    return childrenData;
  }

  toolbarEventListener(event) {
    this.actionType = event.button;
    switch (event.button) {
      case 'saveContent':
        this.buttonLoaders.saveAsDraftButtonLoader = true;
        this.saveContent().then((message: string) => {
          this.buttonLoaders.saveAsDraftButtonLoader = false;
          this.toasterService.success(message);
          if (_.get(this.editorConfig, 'config.enableQuestionCreation') === false) {
            this.mergeCollectionExternalProperties().subscribe(response => {
              this.redirectToChapterListTab({
                collection: _.get(this.collectionTreeNodes, 'data')
              });
            });

          }
        }).catch(((error: string) => {
          this.buttonLoaders.saveAsDraftButtonLoader = false;
          this.toasterService.error(error);
        }));
        break;
      case 'previewContent':
        this.previewContent();
        break;
      case 'showQuestionLibraryPage':
        this.showQuestionLibraryComponentPage();
        break;
      case 'submitContent':
        this.submitHandler();
        break;
      case 'removeContent':
        this.deleteConfirmMessage = this.configService.labelConfig?.lbl?.confirmDeleteNode;
        this.showDeleteConfirmationPopUp = true;
        break;
      case 'editContent':
        this.redirectToQuestionTab('edit');
        break;
      case 'rejectContent':
        this.rejectContent(event.comment);
        break;
      case 'publishContent':
        this.publishContent(event);
        break;
      case 'onFormStatusChange':
        this.onFormStatusChange(event.event);
        break;
      case 'onFormValueChange':
        this.updateToolbarTitle(event);
        break;
      case 'backContent':
        this.redirectToChapterListTab();
        break;
      case 'sendForCorrections':
        this.redirectToChapterListTab({ comment: event.comment });
        break;
      case 'sourcingApprove':
        this.sourcingApproveContent(event);
        break;
      case 'sourcingReject':
        this.sourcingRejectContent({ comment: event.comment });
        break;
      case 'showReviewcomments':
        this.showReviewModal = !this.showReviewModal;
        break;
      case 'reviewContent':
        this.redirectToQuestionTab('review');
        break;
      case 'pagination':
        this.pageId = 'pagination';
        break;
      case 'progressStatus':
        this.pageId = 'progressStatus';
        break;
      // case 'showCorrectioncomments':
        // this.contentComment = _.get(this.editorConfig, 'context.correctionComments')
        // this.showReviewModal = !this.showReviewModal;
        // break;
      default:
        break;
    }
  }

  redirectToChapterListTab(data?: any) {
    this.editorEmitter.emit({
      close: true, library: 'questionset_editor', action: this.actionType, identifier: this.collectionId,
      ...data
    });
  }

  updateToolbarTitle(data: any) {
    const selectedNode = this.treeService.getActiveNode();
    if (!_.isEmpty(data?.data?.name) && selectedNode?.data?.root) {
      this.toolbarConfig.title = data.data.name;
    } else if (_.isEmpty(data?.data?.name) && selectedNode?.data?.root) {
      this.toolbarConfig.title = 'Untitled';
    }
  }

  showQuestionLibraryComponentPage() {
    if (_.isUndefined(this.questionlibraryInput.searchFormConfig) || _.isEmpty(this.questionlibraryInput.searchFormConfig)) {
      this.toasterService.error(_.get(this.configService, 'labelConfig.err.searchConfigNotFound'));
      return;
    }
    if (_.isUndefined(this.questionlibraryInput.metadataFormConfig) || _.isEmpty(this.questionlibraryInput.metadataFormConfig)) {
      this.toasterService.error(_.get(this.configService, 'labelConfig.err.metadataFormConfigNotFound'));
      return;
    }
    if (this.editorService.checkIfContentsCanbeAdded('add')) {
      const questionCategory = [];
      this.buttonLoaders.addQuestionFromLibraryButtonLoader = true;
      if (!_.isUndefined(this.editorService.templateList) &&
        _.isArray(this.editorService.templateList)) {
          _.forEach(this.editorService.templateList, (template) => {
            questionCategory.push({name: template, targetObjectType: 'Question'});
          });
        }
      this.saveContent().then((message: string) => {
        const activeNode = this.treeService.getActiveNode();
        this.buttonLoaders.addQuestionFromLibraryButtonLoader = false;
        this.questionlibraryInput = {
          libraryLabels: {
            itemType: _.get(this.configService, 'labelConfig.lbl.questionsetAddFromLibraryItemLabel'),
            collectionType: _.get(this.configService, 'labelConfig.lbl.questionsetAddFromLibraryCollectionLabel'),
            createdByField: _.get(this.editorConfig, 'config.createdByField')
          },
          targetPrimaryCategories: questionCategory,
          collectionId: this.collectionId,
          existingcontentCounts: this.editorService.getContentChildrens().length,
          collection: activeNode?.data?.metadata,
          framework: this.organisationFramework,
          editorConfig: this.editorConfig,
          searchFormConfig:  this.questionlibraryInput.searchFormConfig,
          metadataFormConfig: this.questionlibraryInput.metadataFormConfig
        };
        this.pageId = 'question_library';
        console.log(this.questionlibraryInput);
      }).catch(((error: string) => {
        this.toasterService.error(error);
        this.buttonLoaders.addQuestionFromLibraryButtonLoader = false;
      }));
    }
  }

  libraryEventListener(event: any) {
    this.mergeCollectionExternalProperties().subscribe((res: any) => {
      this.pageId = 'questionset_editor';
      this.telemetryService.telemetryPageId = this.pageId;
    });
  }

  onQuestionLibraryChange(event: any) {
    switch (event.action) {
      case 'addBulk':
        this.addResourceToQuestionset(event.collectionIds, event.resourceType);
        break;
      case 'back':
        this.libraryEventListener({});
        break;
    }
  }

  public addResourceToQuestionset(contentId, resourceType) {
    const activeNode = this.treeService.getActiveNode();
    const children: any[] = _.isArray(contentId) ? contentId : [contentId];
    if (resourceType === 'Question') {
      if (activeNode?.data?.id) {
        this.editorService.addResourceToQuestionset(this.collectionId, activeNode.data.id,
          children).subscribe(res => {
          if (_.get(res, 'responseCode') === 'OK') {
            this.libraryEventListener({});
          }
        }, err => {
          const errInfo = {
            errorMsg: _.get(this.configService, 'labelConfig.messages.error.041')
          };
          return throwError(this.editorService.apiErrorHandling(err, errInfo));
        });
      }
    }
  }

  saveContent() {
    return new Promise(async (resolve, reject) => { //NOSONAR
      if (!this.validateFormStatus()) {
        return reject(_.get(this.configService, 'labelConfig.messages.error.029'));
      }
      if (this.objectType.toLowerCase() === 'questionset') {
        const maxScore = await this.editorService.getMaxScore();
        this.treeService.updateMetaDataProperty('outcomeDeclaration', { maxScore: { cardinality: 'single', type: 'integer', defaultValue: maxScore } });
      }
      this.editorService.updateHierarchy()
        .pipe(map(data => _.get(data, 'result'))).subscribe(response => {
          if (!_.isEmpty(response.identifiers)) {
            this.treeService.replaceNodeId(response.identifiers);
          }

          this.treeService.clearTreeCache();
          this.treeService.nextTreeStatus('saved');
          resolve(_.get(this.configService, 'labelConfig.messages.success.001'));
        }, err => {
          reject(_.get(this.configService, 'labelConfig.messages.error.001'));
        });
    });
  }

  submitHandler() {
    if (!this.validateFormStatus()) {
      this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.005'));
    } else {
      this.showConfirmPopup = true;
    }
  }

  validateFormStatus() {
    const isValid = _.every(this.formStatusMapper, Boolean);
    if (isValid) { return true; }
    _.forIn(this.formStatusMapper, (value, key) => {
      if (value) {
        this.treeService.highlightNode(key, 'remove');
      } else {
        this.treeService.highlightNode(key, 'add');
      }
    });
    return false;
  }

  previewContent() {
    this.buttonLoaders.previewButtonLoader = true;
    if (!this.isStatusReviewMode) {
      this.saveContent().then(res => {
        this.setUpdatedTreeNodeData();
      }).catch(err => {
        this.toasterService.error(err);
        this.buttonLoaders.previewButtonLoader = false;
      });
    } else {
      this.setUpdatedTreeNodeData();
    }
  }
  sendForReview() {
    this.saveContent().then(messg => {
      this.editorService.reviewContent(this.collectionId).subscribe(data => {
        this.toasterService.success(_.get(this.configService, 'labelConfig.messages.success.002'));
        this.redirectToChapterListTab();
      }, err => {
        this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.002'));
      });
    }).catch(err => this.toasterService.error(err));
  }
  rejectContent(comment) {
    const editableFields = _.get(this.editorConfig.config, 'editableFields');
    if (this.editorMode === 'orgreview' && editableFields && !_.isEmpty(editableFields[this.editorMode])) {
      if (!this.validateFormStatus()) {
        this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.029'));
        return false;
      }
      this.editorService.updateCollection(this.collectionId).subscribe(res => {
        this.editorService.submitRequestChanges(this.collectionId, comment).subscribe(res => {
          this.toasterService.success(_.get(this.configService, 'labelConfig.messages.success.003'));
          this.redirectToChapterListTab();
        }, err => {
          this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.003'));
        });
      }, err => {
        this.toasterService.error(err);
      });
    } else {
      this.editorService.submitRequestChanges(this.collectionId, comment).subscribe(res => {
        this.toasterService.success(_.get(this.configService, 'labelConfig.messages.success.003'));
        this.redirectToChapterListTab();
      }, err => {
        this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.003'));
      });
    }
  }

  publishContent(event) {
    const editableFields = _.get(this.editorConfig, 'config.editableFields');
    if (this.editorMode === 'orgreview' && editableFields && !_.isEmpty(editableFields[this.editorMode])) {
      if (!this.validateFormStatus()) {
        this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.029'));
        return false;
      }
      this.editorService.updateCollection(this.collectionId).subscribe(res => {
        this.editorService.publishContent(this.collectionId, event).subscribe(response => {
          this.toasterService.success(_.get(this.configService, 'labelConfig.messages.success.004'));
          this.redirectToChapterListTab();
        }, err => {
          this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.004'));
        });
      }, err => {
        this.toasterService.error(err);
      });
    } else {
      this.editorService.publishContent(this.collectionId, event).subscribe(res => {
        this.toasterService.success(_.get(this.configService, 'labelConfig.messages.success.004'));
        this.redirectToChapterListTab();
      }, err => {
        this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.004'));
      });
    }
  }
  sourcingApproveContent(event) {
    const editableFields = _.get(this.editorConfig.config, 'editableFields');
    // tslint:disable-next-line:max-line-length
    if (this.editorMode === 'sourcingreview' && ((editableFields && !_.isEmpty(editableFields[this.editorMode])) || !_.isEmpty(this.publishchecklist))) {
      if (!this.validateFormStatus()) {
        this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.029'));
        return false;
      }
      this.editorService.updateCollection(this.collectionId, event).subscribe(res => {
          this.redirectToChapterListTab();
      }, err => {
        this.toasterService.error(err);
      });
    } else {
        this.redirectToChapterListTab();
    }
  }
  sourcingRejectContent(obj) {
    const editableFields = _.get(this.editorConfig.config, 'editableFields');
    if (this.editorMode === 'sourcingreview' && editableFields && !_.isEmpty(editableFields[this.editorMode])) {
      if (!this.validateFormStatus()) {
        this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.029'));
        return false;
      }
      this.editorService.updateCollection(this.collectionId).subscribe(res => {
          this.redirectToChapterListTab(obj);
      }, err => {
        this.toasterService.error(err);
      });
    } else {
        this.redirectToChapterListTab(obj);
    }
  }
  setUpdatedTreeNodeData() {
    this.editorService.fetchCollectionHierarchy(this.collectionId).subscribe((res) => {
      this.collectionTreeNodes = {
        data: _.get(res, `result.${this.objectType}`)
      };
      this.updateTreeNodeData();
      this.buttonLoaders.previewButtonLoader = false;
      this.showPreview = true;
      setTimeout(() => {
        const element: any = document.querySelector('#previewPlayerContainer');
        if (element) {
          element.focus();
        }
      }, 500);
    }, error => {
      this.buttonLoaders.previewButtonLoader = false;
      this.toasterService.error(_.get(error, 'error.params.errmsg'));
    });
  }
  updateTreeNodeData() {
    const treeNodeData = _.get(this.treeService.getFirstChild(), 'data.metadata');
    if (!treeNodeData.timeLimits) {
      treeNodeData.timeLimits = {};
    }
    if (treeNodeData?.maxTime) {
      _.set(treeNodeData.timeLimits, 'questionSet.max', _.parseInt(this.helperService.hmsToSeconds(treeNodeData.maxTime)));
    }
    this.collectionTreeNodes.data = _.merge(this.collectionTreeNodes.data, _.omit(treeNodeData, ['childNodes']));
  }
  treeEventListener(event: any) {
    this.actionType = event.type;
    this.updateTreeNodeData();
    switch (event.type) {
      case 'nodeSelect':
        this.updateSubmitBtnVisibility();
        this.selectedNodeData = _.cloneDeep(event.data);
        this.isCurrentNodeFolder = _.get(this.selectedNodeData, 'folder');
        this.isCurrentNodeRoot = _.get(this.selectedNodeData, 'data.root');
        this.isQumlPlayer = _.get(this.selectedNodeData, 'data.metadata.mimeType') === 'application/vnd.sunbird.question';
        this.setTemplateList();
        this.changeDetectionRef.detectChanges();
        break;
      case 'deleteNode':
        this.deleteConfirmMessage = this.configService.labelConfig?.lbl?.confirmDeleteNode;
        if (!event.isContent && _.has(this.editorConfig.config, 'hierarchy.level1')) {
          // tslint:disable-next-line:max-line-length
          this.deleteConfirmMessage = _.replace(this.deleteConfirmMessage, 'Node', _.get(this.editorConfig.config, 'hierarchy.level1.name'));
        }
        this.showDeleteConfirmationPopUp = true;
        break;
      case 'createNewContent':
        this.setChildQuestion = event.isChildQuestion;
        if (this.editorService.checkIfContentsCanbeAdded('create')) {
          this.buttonLoaders.addFromLibraryButtonLoader = true;
          this.templateList = this.editorService.templateList;
          this.saveContent().then((message: string) => {
            this.buttonLoaders.addFromLibraryButtonLoader = false;
            this.showQuestionTemplatePopup = true;
          }).catch(((error: string) => {
            this.toasterService.error(error);
            this.buttonLoaders.addFromLibraryButtonLoader = false;
          }));
        }
        break;
      default:
        break;
    }
  }

  setTemplateList() {
    if (this.isCurrentNodeRoot) {
      this.templateList = _.flatMap(_.get(this.editorConfig, 'config.children'));
    } else {
      this.templateList = _.flatMap(
        _.get(this.editorService.editorConfig.config, `hierarchy.level${this.selectedNodeData.getLevel() - 1}.children`)
      );
    }
    this.editorService.templateList = this.templateList;
  }

  deleteNode() {
    const activeNode = this.treeService.getActiveNode();
    delete this.formStatusMapper[activeNode.data.id];
    const children = this.treeService.getChildren();
    _.forEach(children, (node) => {
      if (_.has(this.formStatusMapper, node.data.id)) {
        delete this.formStatusMapper[node.data.id];
      }
    });
    this.treeService.removeNode();
    this.updateSubmitBtnVisibility();
    this.showDeleteConfirmationPopUp = false;
    this.collectionTreeNodes.data.childNodes = _.filter(this.collectionTreeNodes.data.childNodes, (key) => {
      return key !== activeNode.data.id;
    });
  }

  updateSubmitBtnVisibility() {
    const rootFirstChildNode = this.treeService.getFirstChild();
    if (rootFirstChildNode && !rootFirstChildNode.children) {
      this.toolbarConfig.hasChildren = false;
    } else {
      this.toolbarConfig.hasChildren = true;
    }
  }

  generateTelemetryEndEvent() {
    const telemetryEnd = {
      type: 'editor',
      pageid: this.telemetryService.telemetryPageId,
      mode: this.editorMode,
      duration: _.toString((Date.now() - this.pageStartTime) / 1000)
    };
    this.telemetryService.end(telemetryEnd);
  }

  handleTemplateSelection($event) {
    const selectedQuestionType = $event;
    this.showQuestionTemplatePopup = false;
    if (selectedQuestionType && selectedQuestionType.type === 'close') {
      return false;
    }
    // this will activate the save and cancel button
    this.editorConfig.config.showSourcingStatus = false;
    // tslint:disable-next-line:max-line-length
    this.editorService.getCategoryDefinition(selectedQuestionType, this.editorConfig.context.channel, 'Question')
    .subscribe((res) => {
      const selectedtemplateDetails = res.result.objectCategoryDefinition;
      this.editorService.selectedChildren['label']=selectedtemplateDetails.label;
      const selectedTemplateFormFields = _.get(selectedtemplateDetails, 'forms.create.properties');
      if (!_.isEmpty(selectedTemplateFormFields)) {
        this.setLeafFormConfig(selectedTemplateFormFields);
      }

      const catMetaData = _.get(selectedtemplateDetails, 'objectMetadata');
      if (_.get(this.editorConfig, 'config.renderTaxonomy') === true) {
        this.questionComponentInput.config = {maximumOptions:_.get(catMetaData, 'config.maximumOptions')};
      } else {
        this.questionComponentInput.config = {};
      }
      this.setEnforceCorrectAnswer(catMetaData);
      if (_.isEmpty(_.get(catMetaData, 'schema.properties.interactionTypes.items.enum'))) {
        this.editorService.selectedChildren = {
          primaryCategory: selectedQuestionType,
          mimeType: catMetaData.schema.properties.mimeType.enum[0],
          interactionType: null
        };
        this.redirectToQuestionTab(undefined, 'default');
      } else {
        const interactionTypes = catMetaData.schema.properties.interactionTypes.items.enum;
        this.editorService.selectedChildren = {
          primaryCategory: selectedQuestionType,
          mimeType: catMetaData.schema.properties.mimeType.enum[0],
          interactionType: interactionTypes[0]
        };
        this.redirectToQuestionTab(undefined, interactionTypes[0]);
      }
    },(error) => {
      const errInfo = {
        errorMsg: _.get(this.configService, 'labelConfig.messages.error.006'),
      };
      return throwError(this.editorService.apiErrorHandling(error, errInfo))
    });
  }

  setEnforceCorrectAnswer(catMetaData) {
    this.sourcingSettings = _.get(catMetaData, 'config.sourcingSettings') || {};
    if (!_.has(this.sourcingSettings, 'enforceCorrectAnswer')) {
      this.sourcingSettings.enforceCorrectAnswer = true;
    }
  }

  setLeafFormConfig(selectedTemplateFormFields) {
    const questionCategoryConfig = selectedTemplateFormFields;
    questionCategoryConfig.forEach(field => {
      if (field.code === 'evidenceMimeType') {
        evidenceMimeType = field.range;
        field.options = this.setEvidence;
        field.range = null;
      }
    });
    this.leafFormConfig = questionCategoryConfig;
  }

  redirectToQuestionTab(mode, interactionType?) {
    let questionId = !_.isUndefined(mode) ? this.selectedNodeData?.data?.metadata?.identifier : undefined;
    let questionCategory = '';
    if (this.objectType === 'question') {
      questionId = _.get(this.editorConfig, 'context.identifier');
      interactionType = _.get(this.editorConfig, 'config.interactionType');
      questionCategory = _.get(this.editorConfig, 'config.questionCategory');
      this.creationContext =  {
        mode: mode,
        objectType: this.objectType,
        collectionObjectType: _.get(this.editorConfig, 'context.collectionObjectType'),
        isReadOnlyMode: _.get(this.editorConfig, 'config.isReadOnlyMode'),
        unitIdentifier: _.get(this.editorConfig, 'context.unitIdentifier'),
        correctionComments: _.get(this.editorConfig, 'context.correctionComments'),
        editableFields: _.get(this.editorConfig, 'config.editableFields')
      };
    }

    this.questionComponentInput = {
      ...this.questionComponentInput,
      questionSetId: this.collectionId,
      questionId: questionId,
      type: interactionType,
      setChildQueston:mode === 'edit' ? false : this.setChildQuestion,
      category: questionCategory,
      creationContext: this.creationContext, // Pass the creation context to the question-component
      creationMode: mode
    };
    this.pageId = 'question';

    if(!_.isUndefined(mode) && _.get(this.editorConfig, 'config.renderTaxonomy') === true){
      this.setQuestionInputOnRenderTaxonomy(mode);
    }
  }

  setQuestionInputOnRenderTaxonomy(mode) {
    this.editorService.selectedChildren = {
      primaryCategory: _.get(this.selectedNodeData, 'data.metadata.primaryCategory'),
      interactionType: _.get(this.selectedNodeData, 'data.metadata.interactionTypes[0]')
    };
    this.questionComponentInput = {
      ...this.questionComponentInput,
      creationContext:{
        isReadOnlyMode: mode !== 'edit' ? true : false,
        correctionComments:this.contentComment
      }
    }
    this.editorService.getCategoryDefinition(this.selectedNodeData.data.metadata.primaryCategory, null, 'Question')
    .subscribe((res) => {
      const selectedtemplateDetails = res.result.objectCategoryDefinition;
      this.editorService.selectedChildren['label']=selectedtemplateDetails.label;
      const selectedTemplateFormFields = _.get(selectedtemplateDetails, 'forms.create.properties');
      this.questionComponentInput.config ={maximumOptions:_.get(selectedtemplateDetails, 'objectMetadata.config.maximumOptions')}
      if (!_.isEmpty(selectedTemplateFormFields)) {
        const questionCategoryConfig = selectedTemplateFormFields;
        questionCategoryConfig.forEach(field => {
          if (field.code === 'evidenceMimeType') {
            evidenceMimeType = field.range;
            field.options = this.setEvidence;
            field.range = null;
          }
        });
        this.leafFormConfig = questionCategoryConfig;
      }
      const catMetaData = selectedtemplateDetails.objectMetadata;
      this.setEnforceCorrectAnswer(catMetaData);
    },(error) => {
      const errInfo = {
        errorMsg: _.get(this.configService, 'labelConfig.messages.error.006'),
      };
      return throwError(this.editorService.apiErrorHandling(error, errInfo))
    });
  }

  questionEventListener(event: any) {
    if (event.type === 'createNewContent') {
      this.treeEventListener(event)
    }
    this.selectedNodeData = undefined;
    if (this.objectType === 'question') {
      this.editorEmitter.emit({
        close: true, library: 'questionset_editor', action: event.actionType, identifier: event.identifier
      });
    } else {
      this.mergeCollectionExternalProperties().subscribe((res: any) => {
        this.pageId = 'questionset_editor';
        this.telemetryService.telemetryPageId = this.pageId;
      });
    }
  }

  get contentPolicyUrl() {
    return this.editorService.contentPolicyUrl;
  }

  get commonFrameworkLicenseUrl() {
    return this.editorService.commonFrameworkLicenseUrl;
  }

  showCommentAddedAgainstContent() {
    // tslint:disable-next-line:max-line-length
    if (this.collectionTreeNodes.data.status === 'Draft' && this.collectionTreeNodes.data.prevStatus  === 'Review' && _.has(this.collectionTreeNodes.data, 'rejectComment')) {
      this.contentComment = _.get(this.collectionTreeNodes.data, 'rejectComment');
      return true;
    } else if (_.get(this.editorService, 'editorConfig.config.showCorrectionComments')) {
      this.contentComment = _.get(this.editorConfig, 'context.correctionComments');
      return true;
    }
    return false;
  }

  isReviewMode() {
    return  _.includes([ 'review', 'read', 'sourcingreview', 'orgreview' ], this.editorService.editorMode);
   }

  onFormStatusChange(form) {
    const selectedNode = this.treeService.getActiveNode();
    if (selectedNode?.data?.id) {
      this.formStatusMapper[selectedNode.data.id] = form.isValid;
    }
  }

  assignPageEmitterListener(event: any) {
    this.pageId = 'questionset_editor';
  }

  ngOnDestroy() {
    if (this.telemetryService) {
      this.generateTelemetryEndEvent();
    }
    if (this.treeService) {
      this.treeService.clearTreeCache();
    }
    if (this?.modal && this?.modal?.deny) {
      this.modal.deny();
    }

    if (this.unSubscribeshowQuestionLibraryPageEmitter) {
      this.unSubscribeshowQuestionLibraryPageEmitter.unsubscribe();
    }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


  setEvidence(control, depends: UntypedFormControl[], formGroup: UntypedFormGroup, loading, loaded) {
    control.isVisible = 'no';
    control.range = evidenceMimeType;
    return merge(..._.map(depends, depend => depend.valueChanges)).pipe(
        switchMap((value: any) => {
            if (!_.isEmpty(value) && _.toLower(value) === 'yes') {
                control.isVisible = 'yes';
                return of({range: evidenceMimeType});
            } else {
                control.isVisible = 'no';
                return of(null);
            }
        })
    );
  }

  setEcm(control, depends: UntypedFormControl[], formGroup: UntypedFormGroup, loading, loaded) {
    control.isVisible = 'no';
    control.options = ecm;
    return merge(..._.map(depends, depend => depend.valueChanges)).pipe(
        switchMap((value: any) => {
            if (!_.isEmpty(value) && _.toLower(value) === 'yes') {
                control.isVisible = 'yes';
                return of({options: ecm});
            } else {
                control.isVisible = 'no';
                return of(null);
            }
        })
    );
  }

  setAllowEcm(control, depends: UntypedFormControl[]) {
    control.isVisible = 'no';
    const response = merge(..._.map(depends, depend => depend.valueChanges)).pipe(
        switchMap((value: any) => {
             if (!_.isEmpty(value) && _.toLower(value) === 'self' ) {
                control.isVisible = 'no';
                return of(null);
             } else {
                control.isVisible = 'yes';
                return of(null);
             }
        })
    );
    return response;
  }

  saveDraftComments(comment) {
    this.editorService.updateComment(this.collectionId,comment);
  }



}
