import { ChangeDetectorRef, Component, ComponentRef, EventEmitter, Input, NgModuleRef, OnInit, Output, AfterViewInit, ViewChild, ViewContainerRef, ViewEncapsulation, OnDestroy } from '@angular/core';
import { EditorQuestionTypeRegistryService } from '../../registry';
import { ActiveLanguageService } from '../../services/language/active-language.service';
import { readI18n, writeI18n, normalizeI18n, I18nValue, I18nMap } from '../../utils/i18nField';
import * as _ from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';
import { McqForm } from '../../interfaces/McqForm';
import { ServerResponse } from '../../interfaces/serverResponse';
import { QuestionService } from '../../services/question/question.service';
import { PlayerService } from '../../services/player/player.service';
import { EditorTelemetryService } from '../../services/telemetry/telemetry.service';
import { EditorService } from '../../services/editor/editor.service';
import { ToasterService } from '../../services/toaster/toaster.service';
import { throwError, Subject} from 'rxjs';
import { Router } from '@angular/router';
import { ConfigService } from '../../services/config/config.service';
import { FrameworkService } from '../../services/framework/framework.service';
import { TreeService } from '../../services/tree/tree.service';
import { EditorCursor } from '../../questionset-editor-cursor.service';
import { filter, finalize, take, takeUntil } from 'rxjs/operators';
import { SubMenu } from '../question-option-sub-menu/question-option-sub-menu.component';
import { ICreationContext } from '../../interfaces/CreationContext';

const evidenceSizeLimit='20480';
const DEFAULT_SCORE = 1;

@Component({
  standalone: false,
  selector: 'lib-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class QuestionComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() questionInput: any;
  @Input() leafFormConfig: any;
  @Input() sourcingSettings: any;
  public initialLeafFormConfig: any;
  public childFormData: any;
  @Output() questionEmitter = new EventEmitter<any>();
  private onComponentDestroy$ = new Subject<void>();
  toolbarConfig: any = {};
  public showAssetPicker = false;
  public terms = false;
  public editorState: any = {};
  public showPreview = false;
  public mediaArr: any = [];
  public assetShow = false;
  public showFormError = false;
  public actionType: string;
  assetType: string;
  assetSolutionData: any;
  solutionUUID: string;
  solutionTypes: any = [{
    type: 'html',
    value: 'Text+Image'
  },
  {
    type: 'video',
    value: 'video'
  },
  {
    type: 'audio',
    value: 'audio'
  }];
  questionMetaData: any;
  questionInteractionType;
  questionCategory;
  questionId;
  creationContext: ICreationContext;
  creationMode;
  tempQuestionId;
  questionSetId;
  unitId;
  public setCharacterLimit = 160;
  public showLoader = true;
  public isReadOnlyMode = false;
  public contentComment : string;
  public showReviewModal: boolean = false;
  questionSetHierarchy: any;
  showConfirmPopup = false;
  showSubmitConfirmPopup = false;
  questionPrimaryCategory: string;
  pageId = 'question';
  pageStartTime: any;
  public framework;
  public frameworkDetails: any = {};
  public questionMetadataFormStatus = true;
  public categoryCodes: string[] = [];
  public buttonLoaders = {
    saveButtonLoader: false,
    'review': false
  };
  public showTranslation = false;
  subMenus: SubMenu[];
  showAddSecondaryQuestionCat: boolean;
  sliderDatas: any = {};
  sessionContext = this.configService.sessionContext;
  sliderOptions: any = {};
  hints: any;
  categoryLabel: any = {};
  scoreMapping: any;
  @ViewChild('editorOutlet', { read: ViewContainerRef }) editorOutlet: ViewContainerRef;
  private activeEditorRef: ComponentRef<any> | null = null;
  condition = 'default';
  targetOption: any;
  responseVariable = 'response1';
  newQuestionID: any;
  showOptions: boolean;
  selectedOptions: any;
  options = [];
  isChildQuestion = false;
  branchingLogic: any;
  selectedSectionId: any;
  sectionPrimaryCategory: any;
  maxScore = DEFAULT_SCORE;
  public questionFormConfig: any;
  treeNodeData:any;
  showQualityParameterPopup: boolean =false;
  public qualityFormConfig: any;
  requestChangesPopupAction: string;
  hintsUUID:string = ''
  constructor(
    private questionService: QuestionService, public editorService: EditorService, public telemetryService: EditorTelemetryService,
    public playerService: PlayerService, private toasterService: ToasterService, private treeService: TreeService,
    private frameworkService: FrameworkService, private router: Router, public configService: ConfigService,
    private editorCursor: EditorCursor, private editorRegistry: EditorQuestionTypeRegistryService,
    private ngModuleRef: NgModuleRef<any>, public activeLang: ActiveLanguageService,
    private changeDetectionRef: ChangeDetectorRef) {
    const { primaryCategory, label } = this.editorService.selectedChildren;
    this.questionPrimaryCategory = primaryCategory;
    this.pageStartTime = Date.now();
    this.categoryLabel = [];
    this.getOptions();
    if (!_.isUndefined(label)) {
      this.categoryLabel[primaryCategory] = label;
    }
  }

  currentLang = 'en';
  langs = ActiveLanguageService.LANGS;

  get globalLang(): string { return localStorage.getItem('app-language') || 'en'; }
  get globalDir(): string  { return this.globalLang === 'ar' ? 'rtl' : 'ltr'; }

  onLangChange(code: string): void { this.activeLang.set(code); }

  get questionBody(): string {
    const q = this.editorState.question as I18nValue;
    if (!q) return '';
    if (typeof q === 'string') {
      return this.currentLang === 'en' ? q : '';
    }
    return (q as I18nMap)[this.currentLang] ?? '';
  }

  private get _currentLangSolution(): { type: string; value: string } | null {
    const sols = this.editorState?.solutions;
    if (!sols || typeof sols !== 'object' || Array.isArray(sols)) return null;
    return (sols as any)[this.currentLang] || null;
  }

  get selectedSolutionType(): string {
    return this._currentLangSolution?.type || '';
  }

  get showSolutionDropDown(): boolean {
    return !this._currentLangSolution;
  }

  get showSolution(): boolean {
    const t = this._currentLangSolution?.type;
    return t === 'video' || t === 'audio';
  }

  get assetSolutionName(): string {
    const sol = this._currentLangSolution;
    if (!sol || sol.type === 'html') return '';
    return this.mediaArr.find((m: any) => m.id === sol.value)?.name || '';
  }

  get assetThumbnail(): string {
    const sol = this._currentLangSolution;
    if (!sol || sol.type === 'html') return '';
    return this.mediaArr.find((m: any) => m.id === sol.value)?.thumbnail || '';
  }

  get solutionBody(): string {
    const sol = this._currentLangSolution;
    if (!sol || sol.type !== 'html') return '';
    return sol.value || '';
  }

  ngOnInit() {
    this.activeLang.lang$.pipe(takeUntil(this.onComponentDestroy$)).subscribe(lang => {
      this.currentLang = lang;
    });
    const { questionSetId, questionId, type, category, creationContext, creationMode } = this.questionInput;
    this.questionInteractionType = type;
    this.questionCategory = category;
    this.questionId = questionId;
    this.questionSetId = questionSetId;
    this.creationContext = creationContext;
    this.creationMode = creationMode;
    this.unitId = this.creationContext?.unitIdentifier;
    this.isReadOnlyMode = this.creationContext?.isReadOnlyMode;
    this.toolbarConfig = this.editorService.getToolbarConfig();
    this.toolbarConfig.showPreview = this.editorService.editorMode !== 'edit';
    this.toolbarConfig.add_translation = true;
    this.treeNodeData = this.treeService.getFirstChild();
    if (_.get(this.creationContext, 'objectType') === 'question') { this.toolbarConfig.questionContribution = true; }
    this.solutionUUID = uuidv4();
    this.telemetryService.telemetryPageId = this.pageId;
    this.initialLeafFormConfig = _.cloneDeep(this.leafFormConfig);
    this.initialize();
    this.framework = _.get(this.editorService.editorConfig, 'context.framework');
    this.initializeFrameworkCategories();
    this.qualityFormConfig = this.editorService.qualityFormConfig;
  }

  fetchFrameWorkDetails() {
    this.frameworkService.frameworkData$.pipe(takeUntil(this.onComponentDestroy$),
      filter(data => _.get(data, `frameworkdata.${this.framework}`)), take(1)).subscribe((frameworkDetails: any) => {
      if (frameworkDetails && !frameworkDetails.err) {
        const frameworkData = frameworkDetails.frameworkdata[this.framework].categories;
        this.frameworkDetails.frameworkData = frameworkData;
        this.frameworkDetails.topicList = _.get(_.find(frameworkData, { code: 'topic' }), 'terms');
        this.populateFrameworkData();
      }
    });
  }

  initializeFrameworkCategories() {
    const frameworkId = this.framework || this.frameworkService.organisationFramework;
    if (frameworkId) {
      this.frameworkService.getTargetFrameworkCategories([frameworkId]);
      this.frameworkService.frameworkData$.pipe(
        takeUntil(this.onComponentDestroy$)
      ).subscribe(frameworkData => {
        if (frameworkData?.frameworkdata?.[frameworkId]) {
          const categories = frameworkData.frameworkdata[frameworkId].categories || [];
          if (categories.length) {
            this.categoryCodes = categories?.map(category => category.code)
            this.sessionContext = [...this.sessionContext, ...this.categoryCodes];
          }
        }
      }, err => {
        this.categoryCodes = [];
        console.error('Failed to get framework data:', err);
      });
    }
  }

  populateFrameworkData() {
    const categoryMasterList = this.frameworkDetails.frameworkData;
    _.forEach(categoryMasterList, (category) => {
      _.forEach(this.leafFormConfig, (formFieldCategory) => {
        if (category.code === formFieldCategory.code) {
          formFieldCategory.terms = category.terms;
        }
      });
    });
    this.questionFormConfig = _.cloneDeep(this.leafFormConfig);
  }

  ngAfterViewInit() {
    // Covers the synchronous new-question path where renderEditorComponent()
    // was called in ngOnInit before the ViewChild was resolved.
    this.renderEditorComponent();
    this.telemetryService.impression({
      type: 'edit', pageid: this.telemetryService.telemetryPageId, uri: this.router.url,
      duration: (Date.now() - this.pageStartTime) / 1000
    });
  }

  initialize() {
    this.editorService.fetchCollectionHierarchy(this.questionSetId).subscribe((response) => {
      this.questionSetHierarchy = _.get(response, 'result.questionset');
      const parentId = this.editorService.parentIdentifier ? this.editorService.parentIdentifier : this.questionId;
      //only for observation,survey,observation with rubrics
      if (!_.isUndefined(parentId) && !_.isUndefined(this.editorService.editorConfig.config.renderTaxonomy)) {
        this.getParentQuestionOptions(parentId);
        const sectionData = this.treeService.getNodeById(parentId);
        const children = _.get(response, 'result.questionset.children');
        this.sectionPrimaryCategory = _.get(response, 'result.questionset.primaryCategory');
        this.selectedSectionId = _.get(sectionData, 'data.metadata.parent');
        this.getBranchingLogic(children);
      }
      this.questionFormConfig = _.cloneDeep(this.leafFormConfig);
      let leafFormConfigFields = _.join(_.map(this.leafFormConfig, value => (value.code)), ',');
      leafFormConfigFields += ',isReviewModificationAllowed';
      if (!_.isUndefined(this.questionId)) {
        this.questionService.readQuestion(this.questionId, leafFormConfigFields)
          .subscribe((res) => {
            if (_.get(res, 'result')) {
              this.questionMetaData = _.get(res, 'result.question');
              this.questionPrimaryCategory = _.get(this.questionMetaData,'primaryCategory');
              // tslint:disable-next-line:max-line-length
              this.questionInteractionType = _.get(this.questionMetaData,'interactionTypes') ? _.get(this.questionMetaData,'interactionTypes[0]') : 'default';
              this.editorService.setIsReviewModificationAllowed(_.get(this.questionMetaData, 'isReviewModificationAllowed', false));
              this.populateFormData();
              if (_.includes(['default', 'text', 'date', 'slider', 'match', 'order'], this.questionInteractionType)) {
                if (this.questionMetaData.editorState) {
                  this.editorState = this.questionMetaData.editorState;
                }
                if (this.questionInteractionType === 'order' && this.questionMetaData.templateId) {
                  this.editorState.templateId = this.questionMetaData.templateId;
                }
                // isPartialScore and evalUnordered are stored as top-level metadata fields;
                // copy into editorState so sub-components can hydrate their toggles
                if (this.questionMetaData.isPartialScore !== undefined) {
                  this.editorState.isPartialScore = this.questionMetaData.isPartialScore;
                }
                if (this.questionMetaData.evalUnordered !== undefined) {
                  this.editorState.evalUnordered = this.questionMetaData.evalUnordered;
                }
              }

              if (this.questionInteractionType === 'slider') {
                if (this.questionMetaData?.interactions) {
                  this.sliderOptions = this.questionMetaData.interactions?.response1;
                  this.sliderDatas = this.questionMetaData.interactions?.response1;
                  this.hints = this.questionMetaData?.hints;
                }
              }

              if (this.questionInteractionType === 'choice') {
                const responseDeclaration = this.questionMetaData.responseDeclaration;
                this.scoreMapping = _.get(responseDeclaration, 'response1.mapping');
                const templateId = this.questionMetaData.templateId;
                const numberOfOptions = this.questionMetaData?.editorState?.options?.length || 0;
                const maximumOptions = _.get(this.questionInput, 'config.maximumOptions');
                this.editorService.optionsLength = numberOfOptions;
                const options = _.map(this.questionMetaData?.editorState?.options, option => ({ body: option.value.body }));
                const question = this.questionMetaData?.editorState?.question;
                const interactions = this.questionMetaData?.interactions;
                this.editorState = new McqForm({
                  question, options, answer: _.get(responseDeclaration, 'response1.correctResponse.value')
                }, { templateId, numberOfOptions,maximumOptions });
                this.editorState.solutions = this.questionMetaData?.editorState?.solutions;
                this.editorState.interactions = interactions;
                if(this.questionMetaData?.hints) {
                  this.editorState.hints = this.questionMetaData.hints;
                }
                else {
                  this.editorState.hints = {};
                }
                if (_.has(this.questionMetaData, 'responseDeclaration')) {
                  this.editorState.responseDeclaration = _.get(this.questionMetaData, 'responseDeclaration');
                }
              }
              if (_.has(this.questionMetaData, 'primaryCategory')) {
                this.editorState.primaryCategory = _.get(this.questionMetaData, 'primaryCategory');
              }
              if(this.questionMetaData?.outcomeDeclaration?.hint) {
                this.hintsUUID = this.questionMetaData?.outcomeDeclaration?.hint?.defaultValue
              }
              else {
                this.hintsUUID = uuidv4()
              }
              this.setQuestionTitle(this.questionId);
              if (!_.isEmpty(this.editorState.solutions)) {
                const savedSolutions: any[] = this.editorState.solutions;
                this.solutionUUID = savedSolutions[0]?.id || uuidv4();
                const saved = savedSolutions[0];
                let solutionsMap: Record<string, { type: string; value: string }> = {};

                if (saved?.value && typeof saved.value === 'object' && !Array.isArray(saved.value)) {
                  // New format: [{ id, value: { lang: { type, value } } }]
                  solutionsMap = saved.value as Record<string, { type: string; value: string }>;
                } else if (saved?.type) {
                  // Legacy format: [{ id, type, value }] — single lang (en)
                  solutionsMap = { en: { type: saved.type, value: saved.value } };
                }
                this.editorState.solutions = solutionsMap;
              }
              if (this.questionMetaData.media) {
                this.mediaArr = this.questionMetaData.media;
              }
              /** for observation and survey to show hint,tip,dependent question option. */
              if(!_.isUndefined(this.editorService?.editorConfig?.config?.renderTaxonomy)){
                this.subMenuConfig();
              }
              this.contentComment = _.get(this.creationContext, 'correctionComments');
              if (this.showPreview) {
                this.previewContent();
              }
              this.showLoader = false;
              this.changeDetectionRef.detectChanges();
              this.renderEditorComponent();
            }
          }, (err: ServerResponse) => {
            const errInfo = {
              errorMsg: 'Fetching question details failed. Please try again...',
            };
            return throwError(this.editorService.apiErrorHandling(err, errInfo));
          });
      }
      if (_.isUndefined(this.questionId)) {
        this.tempQuestionId = uuidv4();
        this.hintsUUID = uuidv4();
        this.populateFormData();
        this.setQuestionTitle();
        let editorState = {}
        this.editorState.hints = {};
        if (this.questionInteractionType === 'default') {
          if (this.questionCategory) {
            editorState = _.get(this.configService, `editorConfig.defaultStates.nonInteractiveQuestions.${this.questionCategory}`);
          } else {
            this.editorState = { question: '', answer: '', solutions: '' };
          }
          this.editorState = { ...editorState };
        }
        else if (this.questionInteractionType === 'choice') {
          this.editorState = new McqForm({ question: '', options: [] }, { numberOfOptions: _.get(this.questionInput, 'config.numberOfOptions'), maximumOptions: _.get(this.questionInput, 'config.maximumOptions') });
        }
        else if (this.questionInteractionType === 'text') {
          this.editorState = { question: '', solutions: '' };
        }
        else if (this.questionInteractionType === 'match') {
          this.editorState = {
            question: '', solutions: '',
            pairs: [{ left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }],
          };
        }
        else if (this.questionInteractionType === 'order') {
          if ((this.questionPrimaryCategory || '').toLowerCase() === 'reorder question') {
            this.editorState = { question: '', solutions: '', sentence: '' };
          } else {
            this.editorState = {
              question: '', solutions: '',
              options: [{ value: 'A', label: '' }, { value: 'B', label: '' }],
              correctOrder: ['A', 'B'],
            };
          }
        }
        this.showLoader = false;
        this.changeDetectionRef.detectChanges();
        this.renderEditorComponent();
        if(!_.isUndefined(this.editorService?.editorConfig?.config?.renderTaxonomy)){
          this.subMenuConfig();
        }
      }
    }, (err: ServerResponse) => {
      const errInfo = {
        errorMsg: 'Fetching question set details failed. Please try again...',
      };
      this.editorService.apiErrorHandling(err, errInfo);
    });
  }

  toolbarEventListener(event) {
    this.actionType = event.button;
    switch (event.button) {
      case 'saveContent':
        this.showAddSecondaryQuestionCat = false;
        this.saveContent();
        break;
      case 'showTranslation':
        this.showTranslation = true;
        break;
      case 'submitQuestion':
        this.submitHandler();
        break;
      case 'cancelContent':
        this.handleRedirectToQuestionset();
        break;
      case 'rejectQuestion':
        this.rejectQuestion(event.comment);
        break;
      case 'publishQuestion':
        this.publishQuestion(event);
        break;
      case 'sourcingApproveQuestion':
        this.sourcingUpdate(event);
        break;
      case 'sourcingRejectQuestion':
        this.sourcingUpdate(event);
        break;
      case 'sendForCorrectionsQuestion':
        this.sendBackQuestion(event);
        break;
      case 'backContent':
        this.handleRedirectToQuestionset();
        break;
      case 'previewContent':
        this.previewContent();
        break;
      case 'editContent':
        this.isReadOnlyMode = false;
        this.showPreview = false;
        this.toolbarConfig.showPreview = false;
        this.previewFormData(!this.toolbarConfig.showPreview);
        this.changeDetectionRef.detectChanges();
        this.renderEditorComponent();
        break;
      case 'showReviewcomments':
        this.showReviewModal = !this.showReviewModal;
        break;
      case 'saveQualityParameters' :
        this.showQualityParameterPopup = true;
        break;
      default:
        break;
    }
  }

  handleRedirectToQuestionset() {
    if (_.isUndefined(this.questionId) || this.creationMode === 'edit') {
      this.showConfirmPopup = true;
    } else {
      this.redirectToQuestionset();
    }
  }


  submitHandler() {
    this.validateQuestionData();
    this.validateFormFields();
    if (this.showFormError === false) {
      this.showSubmitConfirmPopup = true;
    }
  }

  saveContent() {
    this.validateQuestionData();
    if (this.showFormError === false && this.questionMetadataFormStatus === true) {
      this.saveQuestion();
    } else {
      this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.042'));
    }
  }

  onConsentSubmit(event) {
    this.showSubmitConfirmPopup = false;
    if (event) {
      this.questionMetaData = _.assign(this.questionMetaData, {isReviewModificationAllowed: event.editingConsent});
      this.sendForReview();
    }
  }

  sendForReview() {
    if (!_.get(this.editorService.editorConfig, 'config.skipTwoLevelReview')) {
      let callback = function () {
        this.editorService.reviewContent(this.questionId).subscribe(data => {
          this.toasterService.success(_.get(this.configService, 'labelConfig.messages.success.002'));
          this.redirectToChapterList();
        }, err => {
          this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.002'));
        });
      };
      if (!this.questionId) {
        callback = function () {
          this.editorService.reviewContent(this.questionId).subscribe(data => {
            this.toasterService.success(_.get(this.configService, 'labelConfig.messages.success.002'));
            this.addResourceToQuestionset();
          }, err => {
            this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.002'));
          });
        };
      }
      callback = callback.bind(this);
      this.upsertQuestion(callback);
    } else {
      const publishCallback = this.sendQuestionForPublish.bind(this);
      const callback = this.addResourceToQuestionset.bind(this, publishCallback);
      this.upsertQuestion(callback);
    }
  }

  requestForChanges(comment) {
      this.editorService.submitRequestChanges(this.questionId, comment).subscribe(res => {
        this.toasterService.success(_.get(this.configService, 'labelConfig.messages.success.003'));
        this.redirectToChapterList();
      }, err => {
        this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.003'));
      });
  }

  sendQuestionForPublish(event) {
    this.editorService.publishContent(this.questionId, event).subscribe(res => {
      if (!(this.creationMode === 'sourcingReview' && this.editorService.isReviewModificationAllowed)) {
        this.toasterService.success(_.get(this.configService, 'labelConfig.messages.success.037'));
      }
      this.redirectToChapterList();
    }, err => {
      this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.038'));
    });
  }

  rejectQuestion(comment) {
    const editableFields = _.get(this.creationContext, 'editableFields');
    if (this.creationMode === 'orgreview' && editableFields && !_.isEmpty(editableFields[this.creationMode])) {
      this.validateFormFields();
      if(this.showFormError === true) {
        this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.029'));
        return false;
      }
      let callback = this.requestForChanges.bind(this, [comment]);
      this.upsertQuestion(callback);
    } else {
      this.requestForChanges(comment);
    }
  }

  publishQuestion(event) {
    const editableFields = _.get(this.creationContext, 'editableFields');
    if (this.creationMode === 'orgreview' && editableFields && !_.isEmpty(editableFields[this.creationMode])) {
      this.validateFormFields();
      if(this.showFormError === true) {
        this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.029'));
        return false;
      }
      let callback = this.sendQuestionForPublish.bind(this, [event]);
      this.upsertQuestion(callback);
    } else {
      this.sendQuestionForPublish(event);
    }
  }

  sourcingUpdate(event) {
    const editableFields = _.get(this.creationContext, 'editableFields');
    if (this.creationMode === 'sourcingreview' && editableFields && !_.isEmpty(editableFields[this.creationMode])) {
      this.validateFormFields();
      if(this.showFormError === true) {
        this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.029'));
        return false;        }
      }
      let questionIds = [];
      let comments = event.comment
      let successMessage = '';
      this.editorService.fetchCollectionHierarchy(this.questionSetId).subscribe(res => {
        const questionSet = res.result['questionset'];
        switch (event.button) {
          case 'sourcingApproveQuestion':
            questionIds = questionSet.acceptedContributions || [];
            successMessage = _.get(this.configService, 'labelConfig.messages.success.038')
            break;
          case 'sourcingRejectQuestion':
            questionIds = questionSet.rejectedContributions || [];
            comments = questionSet.rejectedContributionComments || {};
            comments[this.questionId] = event.comment;
            successMessage = _.get(this.configService, 'labelConfig.messages.success.039')
            break;
          default:
            break;
        }
        questionIds.push(this.questionId);
        event['requestBody'] = this.prepareSourcingUpdateBody(questionIds, comments);
        this.editorService.updateCollection(this.questionSetId, event).subscribe(res => {
          this.toasterService.success(successMessage);
          this.redirectToChapterList();
        })
      })
    }

  sendBackQuestion(event) {
    this.questionService.readQuestion(this.questionId, 'status')
      .subscribe((res) => {
        const requestObj = {
          question: {
            prevStatus: _.get(res.result, `question.status`),
            status: 'Draft',
            requestChanges: event.comment
          }
        };
        this.questionService.updateQuestion(this.questionId, requestObj).subscribe(res => {
            this.toasterService.success(_.get(this.configService, 'labelConfig.messages.success.040'));
            this.redirectToChapterList();
        });
      }, (err: ServerResponse) => {
        const errInfo = {
          errorMsg: 'Cannot update question status. Please try again...',
        };
        this.editorService.apiErrorHandling(err, errInfo);
      });
  }

  validateQuestionData() {
    if ([undefined, ''].includes(this.editorState.question)) {
      this.showFormError = true;
      return;
    } else {
      this.showFormError = false;
    }

    // to handle when question type is subjective
    if (this.questionInteractionType === 'default') {
      this.validateDefaultQuestionData();
    }

    // to handle when question type is mcq
    if (this.questionInteractionType === 'choice') {
      this.validateChoiceQuestionData();
    }

    if (this.questionInteractionType === 'slider') {
      this.validateSliderQuestionData();
    }

  }

  validateDefaultQuestionData() {
    if (this.editorState.answer !== '') {
      this.showFormError = false;
    } else {
      this.showFormError = true;
      return;  //NOSONAR
    }
  }

  validateChoiceQuestionData() {
    const data = _.get(this.treeNodeData, 'data.metadata');
    if (_.get(this.editorState, 'interactionTypes[0]') === 'choice' &&
      _.isEmpty(this.editorState?.responseDeclaration?.response1?.mapping) &&
      !_.isUndefined(this.editorService?.editorConfig?.config?.renderTaxonomy) &&
      _.get(data,'allowScoring') === 'Yes') {
      this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.005'));
      this.showFormError = true;
      return;
    } else {
      this.showFormError = false;
    }
    const optionValid = _.find(this.editorState.options, option =>
      (option.body === undefined || option.body === '' || option.length > this.setCharacterLimit));
    if (optionValid || (_.isUndefined(this.editorState.answer) && this.sourcingSettings?.enforceCorrectAnswer)) {
      this.showFormError = true;
      return; //NOSONAR
    } else {
      this.showFormError = false;
    }
  }

  validateSliderQuestionData() {
    const min = _.get(this.sliderDatas, 'validation.range.min');
    const max = _.get(this.sliderDatas, 'validation.range.max');
    const step =  _.get(this.sliderDatas, 'step');
    if (_.isEmpty(this.sliderDatas) || _.isEmpty(min) || _.isEmpty(max) || _.isEmpty(step)) {
      this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.005'));
      this.showFormError = true;
    } else {
      this.showFormError = false;
    }
  }

  redirectToQuestionset() {
    this.showConfirmPopup = false;
    this.treeService.clearTreeCache();
    setTimeout(() => {
      this.showAddSecondaryQuestionCat ?
      this.questionEmitter.emit({ type: 'createNewContent', isChildQuestion: true }) :
      this.editorService.parentIdentifier = undefined;
      this.showAddSecondaryQuestionCat = false;
      this.questionEmitter.emit({ status: false });
    }, 100);
  }

  redirectToChapterList() {
    this.showConfirmPopup = false;
    setTimeout(() => {
      this.questionEmitter.emit({ type: 'close', actionType: this.actionType, identifier: this.questionId });
    }, 100);
  }

  editorDataHandler(event, type?) {
    if (type === 'question') {
      this.editorState.question = writeI18n(this.editorState.question as I18nValue, this.currentLang, event.body);
    } else if (type === 'solution') {
      const current = this._getSolutionsMap();
      current[this.currentLang] = { type: 'html', value: event.body };
      this.editorState.solutions = current;
    } else {
      this.editorState = _.assign(this.editorState, event.body);
    }

    if (event.mediaobj) {
      const media = event.mediaobj;
      this.setMedia(media);
    }
  }

  setMedia(media) {
    if (media) {
      const value = _.find(this.mediaArr, ob => {
        return ob.id === media.id;
      });
      if (value === undefined) {
        this.mediaArr.push(media);
      }
    }
  }

  addResourceToQuestionset(callback = null) {
    this.editorService.addResourceToQuestionset(this.questionSetId, this.unitId, this.questionId).subscribe(res => {
      if (callback) {
        callback();
      } else {
        this.redirectToChapterList();
      }
    }, err => {
        const errInfo = {
          errorMsg: 'Adding question to questionset failed. Please try again.',
        };
        return throwError(this.editorService.apiErrorHandling(err, errInfo));
    })
  }

  saveQuestion() {
    if(_.get(this.creationContext, 'objectType') === 'question') {
      if(this.creationMode === 'edit') {
        const callback = this.addResourceToQuestionset.bind(this);
        this.upsertQuestion(callback);
      } else if (this.creationMode === 'sourcingReview') {
        const callback = this.sendQuestionForPublish.bind(this);
        this.upsertQuestion(callback);
      } else {
        this.upsertQuestion(undefined);
      }
    }
    else {
      if (_.isUndefined(this.questionId)) {
        this.createQuestion();
      }
      if (!_.isUndefined(this.questionId)) {
        this.updateQuestion();
      }
  }
  }

  private _getSolutionsMap(): Record<string, { type: string; value: string }> {
    const sols = this.editorState?.solutions;
    if (!sols || typeof sols !== 'object' || Array.isArray(sols)) return {};
    return { ...(sols as any) };
  }

  assetDataOutput(event) {
    if (event) {
      const lang = this.currentLang;
      const host = _.get(this.editorService.editorConfig, 'context.host') || document.location.origin;
      const current = this._getSolutionsMap();
      current[lang] = { type: this.assetType, value: event.identifier };
      this.editorState.solutions = current;
      this.assetSolutionData = event;
      if (!this.mediaArr.find((m: any) => m.id === event.identifier)) {
        const assetMedia: any = {
          id: event.identifier, src: event.src, type: this.assetType,
          assetId: event.identifier, name: event.name, baseUrl: host,
        };
        if (event?.thumbnail) { assetMedia.thumbnail = event.thumbnail; }
        this.mediaArr.push(assetMedia);
      }
      if (event?.thumbnail) {
        const thumbId = `${this.assetType}_${event.identifier}`;
        if (!this.mediaArr.find((m: any) => m.id === thumbId)) {
          this.mediaArr.push({ src: event.thumbnail, type: 'image', id: thumbId, baseUrl: host });
        }
      }
    } else {
      this.deleteSolution();
    }
    this.assetShow = false;
  }

  selectSolutionType(data: any) {
    const index = _.findIndex(this.solutionTypes, (sol: any) => sol.value === data);
    this.assetType = data;
    const type = this.solutionTypes[index].type;
    if (type === 'video' || type === 'audio') {
      this.assetShow = true;
    } else {
      // html: create empty entry for this lang so solutionDropDown hides
      const current = this._getSolutionsMap();
      current[this.currentLang] = { type: 'html', value: '' };
      this.editorState.solutions = current;
    }
  }

  deleteSolution() {
    const sol = this._currentLangSolution;
    if (sol?.type === 'video' || sol?.type === 'audio') {
      this.mediaArr = _.filter(this.mediaArr, (item: any) =>
        item.id !== sol.value && item.id !== `${this.assetType}_${sol.value}`);
    }
    const remaining = this._getSolutionsMap();
    delete remaining[this.currentLang];
    this.editorState.solutions = Object.keys(remaining).length > 0 ? remaining : '';
    if (!this.selectedSolutionType) {
      // all langs cleared
      this.assetType = '';
    }
  }

  getSolutionObj(solutionUUID, selectedSolutionType, editorStateSolutions: any) {
    // Legacy method for backward compat — new path uses _buildSolutionsHtml directly
    const solutionObj: any = { id: solutionUUID, type: selectedSolutionType };
    if (_.isString(editorStateSolutions)) {
      solutionObj.value = editorStateSolutions;
    } else if (_.isArray(editorStateSolutions)) {
      if (_.has(editorStateSolutions[0], 'value')) {
        solutionObj.value = editorStateSolutions[0].value;
      }
    } else if (editorStateSolutions && typeof editorStateSolutions === 'object') {
      solutionObj.value = editorStateSolutions;
    }
    return solutionObj;
  }

  setQuestionProperties(metadata) {
    if (this.questionInteractionType != 'choice') {
      if (!_.isUndefined(metadata.answer)) {
        if (typeof metadata.answer === 'object') {
          const answerI18n: Record<string, string> = {};
          Object.entries(metadata.answer as Record<string, string>).forEach(([lang, text]) => {
            if (text) {
              answerI18n[lang] = this.getAnswerWrapperHtml(this.getAnswerHtml(text));
            }
          });
          const keys = Object.keys(answerI18n);
          metadata.answer = (keys.length === 1 && keys[0] === 'en')
            ? answerI18n['en']
            : JSON.stringify(answerI18n);
        } else {
          metadata.answer = this.getAnswerWrapperHtml(this.getAnswerHtml(metadata.answer));
        }
      } else {
        metadata.answer = '';
      }
    }

    if (this.questionInteractionType === 'choice') {
      metadata.body = this.buildI18nBody(
        this.editorState.question as I18nValue,
        (text) => this.getMcqQuestionHtmlBody(text, this.editorState.templateId)
      );
      if(_.isNumber(metadata.answer)) {
        metadata.answer = [metadata.answer];
      }
      const correctAnswersData = this.getInteractionValues(metadata.answer, metadata.interactions);
      const answerI18n: Record<string, string> = {};
      _.forEach(correctAnswersData, (answer) => {
        const label = answer.label;
        if (label && typeof label === 'object') {
          Object.entries(label as Record<string, string>).forEach(([lang, text]) => {
            if (text) { answerI18n[lang] = (answerI18n[lang] || '') + this.getAnswerHtml(text); }
          });
        } else {
          answerI18n['en'] = (answerI18n['en'] || '') + this.getAnswerHtml(label || '');
        }
      });
      const answerKeys = Object.keys(answerI18n);
      if (answerKeys.length === 0) {
        metadata.answer = this.getAnswerWrapperHtml('');
      } else if (answerKeys.length === 1 && answerKeys[0] === 'en') {
        metadata.answer = this.getAnswerWrapperHtml(answerI18n['en']);
      } else {
        metadata.answer = JSON.stringify(
          Object.fromEntries(
            Object.entries(answerI18n).map(([lang, html]) => [lang, this.getAnswerWrapperHtml(html)])
          )
        );
      }
    } else if (this.questionInteractionType === 'text') {
      // FTB: transform [[answer]] → [[responseN]] in stored body (language-agnostic keys).
      // The editorState keeps [[answer]] for authoring; body uses [[responseN]] for the player.
      const question = this.editorState.question as I18nValue;
      const langs = typeof question === 'string' ? ['en'] : Object.keys(question as any);
      const rd: any = {};
      const interactions: any = {};
      const transformedBody: Record<string, string> = {};
      langs.forEach(lang => {
        let blankIdx = 0;
        const rawBody = readI18n(question, lang);
        transformedBody[lang] = rawBody.replace(/\[\[(.*?)\]\]/g, (_: string, ans: string) => {
          blankIdx++;
          const key = `response${blankIdx}`;
          const trimmed = ans.trim();
          if (!rd[key]) {
            rd[key] = { cardinality: 'single', type: 'string',
              correctResponse: { value: lang === 'en' ? trimmed : '' }, mapping: [] };
            interactions[key] = { type: 'text' };
          }
          if (lang === 'en') { rd[key].correctResponse.value = trimmed; }
          rd[key].mapping.push({ value: trimmed, score: 1, caseSensitive: false });
          return `[[${key}]]`;
        });
      });
      // evalUnordered: encode the author's intent into the QuML payload by placing all correct
      // answers in every blank's mapping. The player uses MAP_RESPONSE + set-intersection to
      // award credit regardless of which blank the student fills. This is a serialization
      // concern — the player is responsible for the runtime scoring algorithm.
      const allAnswers = Object.values(rd).map((r: any) => r.correctResponse?.value).filter(Boolean);
      if (this.editorState.evalUnordered && allAnswers.length > 1) {
        Object.keys(rd).forEach(key => {
          rd[key].mapping = allAnswers.map((ans: string) => ({ value: ans, score: 1, caseSensitive: false }));
        });
      }

      const numBlanks = Object.keys(rd).length;
      const isPartialScore = !!this.editorState.isPartialScore;
      metadata.body = normalizeI18n(transformedBody);
      metadata.responseDeclaration = rd;
      metadata.interactions = { ...(metadata.interactions || {}), ...interactions };
      metadata.interactionTypes = ['text'];
      metadata.qType = 'FTB';
      metadata.primaryCategory = this.questionPrimaryCategory;
      metadata.scoringMode = 'responseProcessing';
      metadata.responseProcessing = { template: isPartialScore ? 'MAP_RESPONSE' : 'MATCH_CORRECT' };
      metadata.outcomeDeclaration = {
        maxScore: { cardinality: 'single', type: 'integer', defaultValue: isPartialScore ? numBlanks : 1 }
      };
    } else if (this.questionInteractionType === 'match') {
      metadata.body = this.buildI18nBody(
        this.editorState.question as I18nValue,
        (text) => this.getMtfQuestionHtmlBody(text)
      );
    } else if (this.questionInteractionType === 'order') {
      metadata.body = this.buildI18nBody(
        this.editorState.question as I18nValue,
        (text) => this.getOrderQuestionHtmlBody(text)
      );
      if (metadata.sentence && typeof metadata.sentence === 'object') {
        metadata.sentence = readI18n(metadata.sentence as I18nValue, 'en');
      }
    } else if (this.questionInteractionType != 'default') {
      metadata.responseDeclaration = this.getResponseDeclaration(this.questionInteractionType);
    }
    return metadata;
  }

  buildI18nBody(question: I18nValue, buildFn: (text: string) => string): string {
    if (!question) return buildFn('');
    if (typeof question === 'string') return buildFn(question);
    const bodyI18n: Record<string, string> = {};
    Object.entries(question as Record<string, string>).forEach(([lang, text]) => {
      if (text) { bodyI18n[lang] = buildFn(text); }
    });
    const keys = Object.keys(bodyI18n);
    if (keys.length === 0) return buildFn('');
    if (keys.length === 1 && keys[0] === 'en') return bodyI18n['en'];
    return JSON.stringify(bodyI18n);
  }

  getMtfQuestionHtmlBody(question: string): string {
    return `<div class='question-body' tabindex='-1'><div class='mtf-title' tabindex='0'>${question}</div><div data-match-interaction='response1'></div></div>`;
  }

  getOrderQuestionHtmlBody(question: string): string {
    return `<div class='question-body' tabindex='-1'><div class='order-title' tabindex='0'>${question}</div><div data-ordered-interaction='response1'></div></div>`;
  }

  getQuestionMetadata() {
    let metadata: any = {
      mimeType: 'application/vnd.sunbird.question',
      media: this.mediaArr,
      editorState: {}
    };
    metadata = _.assign(metadata, this.editorState);
    metadata.editorState.question = metadata.question;
    metadata.body = metadata.question;
    if (!_.isUndefined(this.editorService?.editorConfig?.config?.renderTaxonomy)) {
      const treeNodeData = _.get(this.treeNodeData, 'data.metadata');
      if (_.get(treeNodeData,'allowScoring') != 'Yes') {
       _.set(metadata,'responseDeclaration.response1.mapping',[]);
      }
    }

    metadata = this.setQuestionProperties(metadata);

    const solutionsMap = this._getSolutionsMap();
    if (Object.keys(solutionsMap).length > 0) {
      // editorState.solutions: { uuid: { lang: { type, value } } }
      // — editor needs type+value per lang for rehydration (to show CKEditor vs asset picker)
      const editorStateSolValue: Record<string, { type: string; value: string }> = {};
      Object.entries(solutionsMap).forEach(([lang, sol]) => {
        editorStateSolValue[lang] = { type: sol.type, value: sol.value };
      });
      metadata.editorState.solutions = [{ id: this.solutionUUID, value: editorStateSolValue }];

      // metadata.solutions: { uuid: { lang: "<rendered html>" } }
      // — player only needs HTML per lang, not the type
      metadata.solutions = this._buildSolutionsHtml(solutionsMap);
    }
    if (_.isEmpty(this.editorState.solutions)) {
      metadata.solutions = {};
    }
    metadata = _.merge(metadata, this.getDefaultSessionContext());
    if(_.get(this.creationContext, 'objectType') === 'question') {
      metadata.programId = _.get(this.editorService, 'editorConfig.context.programId');
      metadata.collectionId = _.get(this.editorService, 'editorConfig.context.collectionIdentifier');
      metadata.organisationId = _.get(this.editorService, 'editorConfig.context.contributionOrgId');
    }
    metadata['outcomeDeclaration'] = this.getOutcomeDeclaration(metadata);
    metadata = _.merge(metadata, _.pickBy(this.childFormData, _.identity));
    if (!metadata.name) {
      metadata.name = this.questionPrimaryCategory || 'Untitled Question';
    }
    if (_.get(this.creationContext, 'objectType') === 'question') {
      metadata.isReviewModificationAllowed = !!_.get(this.questionMetaData, 'isReviewModificationAllowed');
    }

    if (!_.isEmpty(metadata.media)) {
      metadata.media = this.removeUnusedMedia(metadata);
    }
    // tslint:disable-next-line:max-line-length
    return _.omit(metadata, ['question', 'numberOfOptions', 'options', 'allowMultiSelect', 'showEvidence', 'evidenceMimeType', 'showRemarks', 'markAsNotMandatory', 'leftAnchor', 'rightAnchor', 'step', 'numberOnly', 'characterLimit', 'dateFormat', 'autoCapture', 'remarksLimit', 'maximumOptions', 'i18n']);
  }

  removeUnusedMedia(questionMetadata: any) {
    const media = _.get(questionMetadata, 'media');
    for (let i = media.length - 1; i >= 0; i--) {
      if (!this.checkMediaExists(questionMetadata, media[i].id)) {
        media.splice(i, 1);
      }
    }
    return media;
  }

  checkMediaExists(questionMetadata, mediaId) {
    // body/answer may be i18n map objects — stringify to enable substring search
    const bodyStr   = typeof questionMetadata.body   === 'object' ? JSON.stringify(questionMetadata.body)   : questionMetadata.body;
    const answerStr = typeof questionMetadata.answer === 'object' ? JSON.stringify(questionMetadata.answer) : questionMetadata.answer;
    if (_.includes(bodyStr, mediaId) || _.includes(answerStr, mediaId)) {
      return true;
    }

    if (questionMetadata?.solutions) {
      const solutionValues = _.values(questionMetadata.solutions);
      for (const solution of solutionValues) {
        const solStr = typeof solution === 'object' ? JSON.stringify(solution) : solution;
        if (_.includes(solStr, mediaId)) {
          return true;
        }
      }
    }

    if (questionMetadata?.qType !== 'SA' && questionMetadata?.interactions?.response1?.options) {
      const raw = questionMetadata.interactions.response1.options;
      // MCQ: options is a flat array; MTF: options is { left: [...], right: [...] }
      const optionsList: any[] = Array.isArray(raw)
        ? raw
        : ([] as any[]).concat(...Object.values(raw));
      for (const option of optionsList) {
        // MTF labels are i18n map objects — stringify for substring search
        const labelStr = typeof option?.label === 'object'
          ? JSON.stringify(option.label) : (option?.label ?? '');
        if (_.includes(labelStr, mediaId)) {
          return true;
        }
      }
    }

    return false;
  }

  getAnswerHtml(optionLabel) {
    const answerHtml = '<div class=\'answer-body\'>{answer}</div>';
    const optionHtml = answerHtml.replace('{answer}', optionLabel);
    return optionHtml;
  }

  getAnswerWrapperHtml(concatenatedAnswers) {
    const answerTemplate = '<div class=\'answer-container\'>{answers}</div>';
    const answer = answerTemplate.replace('{answers}', concatenatedAnswers);
    return answer;
  }

  getInteractionValues(answer, interactions) {
    const correctAnswers = _.filter(interactions.response1.options, (value, key) => {
      return _.includes(answer, value.value);
    });
    return correctAnswers;
  }

  getQuestionSolution(solutionObj) {
    if (solutionObj?.type === 'html') {
      return {[solutionObj?.id]: solutionObj.value};
    } else if (solutionObj?.type === 'video' || solutionObj?.type === 'audio') {
      const val = solutionObj?.value;
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        // i18n map of asset IDs → build per-language HTML
        const solutionHtml: Record<string, string> = {};
        Object.entries(val as Record<string, string>).forEach(([lang, assetId]) => {
          const media = this.getMediaById(assetId);
          if (media) {
            solutionHtml[lang] = this.getAssetSolutionHtml(media.thumbnail || '', media.src, media.id, solutionObj.type);
          }
        });
        const keys = Object.keys(solutionHtml);
        if (keys.length === 0) return {[solutionObj.id]: ''};
        if (keys.length === 1 && keys[0] === 'en') return {[solutionObj.id]: solutionHtml['en']};
        return {[solutionObj.id]: solutionHtml};
      } else {
        // Legacy single-asset string
        const assetMedia = this.getMediaById(val);
        if (!assetMedia) return {[solutionObj.id]: ''};
        const assetSolution = this.getAssetSolutionHtml(assetMedia?.thumbnail || '', assetMedia?.src, assetMedia.id, solutionObj.type);
        return {[solutionObj.id]: assetSolution};
      }
    }
  }

  getMediaById(mediaId) {
    return _.find(this.mediaArr, { 'id': mediaId });
  }

  private _buildSolutionsHtml(solutionsMap: Record<string, { type: string; value: string }>): Record<string, any> {
    const perLang: Record<string, string> = {};
    Object.entries(solutionsMap).forEach(([lang, sol]) => {
      let html = '';
      if (sol.type === 'html') {
        html = sol.value;
      } else if (sol.type === 'video' || sol.type === 'audio') {
        const media = this.getMediaById(sol.value);
        if (media) {
          html = this.getAssetSolutionHtml(media.thumbnail || '', media.src, media.id, sol.type);
        }
      }
      if (html) perLang[lang] = html;
    });

    if (Object.keys(perLang).length === 0) return {};

    // Single EN-only: keep as plain string for backward compat with existing players
    const langKeys = Object.keys(perLang);
    if (langKeys.length === 1 && langKeys[0] === 'en') {
      return { [this.solutionUUID]: perLang['en'] };
    }
    return { [this.solutionUUID]: perLang };
  }

  getResponseDeclaration(type) {
    const responseDeclaration = {
      response1: {
        type: type === 'slider' ? 'integer' : 'string'
      }
    };
    return responseDeclaration;
  }

  getAssetSolutionHtml(posterURL, srcUrl, solutionMediaId, solType: string) {
    let assetSolutionHtml: string;
    if (solType === 'video') {
      assetSolutionHtml = '<video data-asset-variable=\'{solutionMediaId}\' width=\'400\' controls=\'\' poster=\'{posterUrl}\'><source type=\'video/mp4\' src=\'{sourceURL}\'><source type=\'video/webm\' src=\'{sourceURL}\'></video>';
    } else if (solType === 'audio') {
      assetSolutionHtml = '<audio data-asset-variable=\'{solutionMediaId}\' width=\'400\' controls=\'\' poster=\'{posterUrl}\'><source type=\'audio/mp3\' src=\'{sourceURL}\'><source type=\'audio/wav\' src=\'{sourceURL}\'></audio>';
    } else {
      return '';
    }
    return assetSolutionHtml.replace('{posterUrl}', posterURL).replace('{sourceURL}', srcUrl).replace('{sourceURL}', srcUrl).replace('{solutionMediaId}', solutionMediaId);
  }

  getMcqQuestionHtmlBody(question, templateId) {
    const mcqTemplateConfig = {
      // tslint:disable-next-line:max-line-length
      mcqBody: '<div class=\'question-body\' tabindex=\'-1\'><div class=\'mcq-title\' tabindex=\'0\'>{question}</div><div data-choice-interaction=\'response1\' class=\'{templateClass}\'></div></div>'
    };
    const { mcqBody } = mcqTemplateConfig;
    const questionBody = mcqBody.replace('{templateClass}', templateId)
      .replace('{question}', question);
    return questionBody;
  }

  getDefaultSessionContext() {
    const editorConfigArray = ["topic", ...this.categoryCodes];
    return _.omitBy(_.merge(
      {
        creator: _.get(this.editorService.editorConfig, 'context.user.fullName'),
        createdBy: _.get(this.editorService.editorConfig, 'context.user.id'),
        ..._.pick(_.get(this.editorService.editorConfig, 'context'), editorConfigArray)
      },
      {
        ..._.pick(this.questionSetHierarchy, this.sessionContext)
      }
    ), key => _.isEmpty(key));
  }

  setQuestionTypeValues(metaData) {
    metaData.showEvidence = this.childFormData.showEvidence;
    if (metaData.showEvidence === 'Yes') {
        metaData.evidence = {
          required: 'No',
          mimeType: this.childFormData.evidenceMimeType,
          minCount: 1,
          maxCount: 1,
          sizeLimit: evidenceSizeLimit,
        };
    }
    metaData.showRemarks = this.childFormData.showRemarks;
    if (metaData.showRemarks === 'Yes') {
      metaData.remarks = {
        maxLength:  this.childFormData.remarksLimit,
        required: 'No'
      };
    }
    metaData.interactions = metaData.interactions || {};
    if (this.questionInteractionType !== 'default' && metaData.interactions.response1) {
      metaData.interactions.response1.validation = { required: this.childFormData.markAsNotMandatory === 'Yes' ? 'No' : 'Yes'};
    }

    if (this.childFormData.allowMultiSelect === 'Yes') {
      metaData.responseDeclaration.response1.cardinality = 'multiple';
    }

    this.InsertHintAndInstructions(metaData)

    if (!_.isEmpty(this.sliderDatas) && this.questionInteractionType === 'slider') {
      metaData.interactionTypes = [this.questionInteractionType];
      metaData.primaryCategory = this.questionPrimaryCategory;
      metaData.interactions = {
        ...metaData.interactions,
        response1: {
          validation: this.sliderDatas.validation,
          step: this.sliderDatas.step
        }
      };
    }

    if (this.questionInteractionType === 'date') {
      metaData.interactionTypes = [this.questionInteractionType];
      metaData.primaryCategory = this.questionPrimaryCategory;
      metaData.interactions = {
        ...metaData.interactions,
        response1: {
          validation: {pattern: this.childFormData.dateFormat},
          autoCapture: this.childFormData.autoCapture
        }
      };
  }

    if (this.questionInteractionType === 'text' && this.questionPrimaryCategory !== 'FTB Question') {
      metaData.interactionTypes = [this.questionInteractionType];
      metaData.primaryCategory = this.questionPrimaryCategory;
      metaData.interactions = {
        ...metaData.interactions,
        response1: {
          validation: {
            limit: {
              maxLength: this.childFormData.characterLimit,
            }
          },
          type: {
            number: this.childFormData.numberOnly
          }
        }
      };
    }
    //  return metaData;
  }

  InsertHintAndInstructions(metaData) {
    _.forEach(this.subMenus, (el: any) => {
      if (el.id === 'addHint') {
        metaData.hints = metaData.hints ? metaData.hints : {};
        metaData.hints[this.hintsUUID] = {en: el.value}
        this.getOutcomeDeclaration(metaData)
      }
      if (el.id === 'addTip') {
        metaData.instructions = el.value;
      }
    });
    return metaData
  }

  prepareRequestBody() {
    const questionId = this.questionId ? this.questionId : uuidv4();
    this.newQuestionID = questionId;
    const data = this.treeNodeData;
    const activeNode = this.treeService.getActiveNode();
    const selectedUnitId = _.get(activeNode, 'data.id');
    this.editorService.data = {};
    this.editorService.selectedSection = selectedUnitId;
    let metaData = this.getQuestionMetadata();
    this.setQuestionTypeValues(metaData);
    return {
      nodesModified: {
        [questionId]: {
          metadata: _.omit(metaData, ['creator']),
          objectType: 'Question',
          root: false,
          isNew: !this.questionId
        }
      },
      hierarchy: this.editorService.getHierarchyObj(data, questionId, selectedUnitId)
    };
  }

  prepareQuestionBody () {
    return this.questionId ?
    {
      question: _.omit(this.getQuestionMetadata(), ['mimeType', 'creator', 'createdBy', 'organisationId'])
    } :
    {
      question: {
        code: uuidv4(),
        ...this.getQuestionMetadata()
      }
    };
  }

  prepareSourcingUpdateBody (questionIds, comments?) {
      const sourcingUpdateAttribute = this.actionType === 'sourcingApproveQuestion' ? 'acceptedContributions'
        : 'rejectedContributions';
      const collectionObjectType = _.replace(_.lowerCase(this.creationContext['collectionObjectType']), ' ', '');
      const requestBody = {
        request: {
          [collectionObjectType]: {
            [sourcingUpdateAttribute]: questionIds
          }
        }
      };
      if (this.actionType === 'sourcingRejectQuestion') {
        requestBody.request[collectionObjectType]['rejectedContributionComments'] = comments;
        // requestBody.request[collectionObjectType]['rejectComment'] = comments;
      }
      return requestBody;
  }

  upsertQuestion(callback) {
    const requestBody = this.prepareQuestionBody();
    this.showHideSpinnerLoader(true);
    this.questionService.upsertQuestion(this.questionId, requestBody).pipe(
      finalize(() => {
        this.showHideSpinnerLoader(false);
      })).subscribe((response: ServerResponse) => {
        if (!_.includes(['submitQuestion'],this.actionType)) {
          this.toasterService.success(_.get(this.configService, 'labelConfig.messages.success.013'));
        }
        this.setQuestionId(_.get(response, 'result.identifier'));
        if (callback) callback();
      }, (err: ServerResponse) => {
          const errInfo = {
            errorMsg: 'Failed to save question. Please try again...',
          };
          this.editorService.apiErrorHandling(err, errInfo);
        });
  }


  createQuestion() {
    if (this.showOptions) {
      this.buildCondition('create');
    } else {
      const requestBody = this.prepareRequestBody();
      this.saveQuestions(requestBody, 'create');
  }
}


  saveQuestions(requestBody, type) {
    this.showHideSpinnerLoader(true);
    this.questionService.updateQuestionHierarchy(requestBody).pipe(
      finalize(() => {
        this.showHideSpinnerLoader(false);
      })).subscribe((response: ServerResponse) => {
        if (this.showAddSecondaryQuestionCat) {
          const result = _.get(response.result.identifiers, this.newQuestionID);
          this.editorService.parentIdentifier = result;
        }

        if (type === 'create') {
          this.toasterService.success(_.get(this.configService, 'labelConfig.messages.success.007'));
        } else {
          this.toasterService.success(_.get(this.configService, 'labelConfig.messages.success.008'));
        }
        this.redirectToQuestionset();
      }, (err: ServerResponse) => {
          const errInfo = {
            errorMsg: 'Question creating failed. Please try again...',
          };
          this.editorService.apiErrorHandling(err, errInfo);
        });
  }


  updateQuestion() {
    if (this.isChildQuestion) {
      this.buildCondition('update');
    } else {
      this.saveUpdateQuestions();
    }
  }

 saveUpdateQuestions() {
    const requestBody = this.prepareRequestBody();
    this.showHideSpinnerLoader(true);
    this.questionService.updateQuestionHierarchy(requestBody).pipe(
      finalize(() => {
        this.showHideSpinnerLoader(false);
      })).subscribe((response: ServerResponse) => {
        if (this.showAddSecondaryQuestionCat) {
          const result = _.get(response.result.identifiers, this.questionId);
          this.editorService.parentIdentifier = result;
        }

        this.toasterService.success(_.get(this.configService, 'labelConfig.messages.success.008'));
        this.redirectToQuestionset();
      }, (err: ServerResponse) => {
        const errInfo = {
          errorMsg: 'Question updating failed. Please try again...',
        };
        this.editorService.apiErrorHandling(err, errInfo);
      });
  }

  showHideSpinnerLoader(status: boolean, type?) {
    this.buttonLoaders.saveButtonLoader = status;
    if(type) {
      this.buttonLoaders[type] = status;
    }
  }

  previewContent() {
    this.validateQuestionData();
    if (this.showFormError === false && this.questionMetadataFormStatus === true) {
      this.previewFormData(false);
      const activeNode = this.treeService.getActiveNode();
      let questionId = '';
      if (_.isUndefined(this.questionId)) {
        questionId = this.tempQuestionId;
        this.setParentConfig(activeNode?.data?.metadata);
      } else {
        questionId = this.questionId;
        this.setParentConfig(activeNode?.parent?.data?.metadata);
      }
      this.questionSetHierarchy.childNodes = [questionId];
      this.setQumlPlayerData(questionId);
      this.showPreview = true;
      this.toolbarConfig.showPreview = true;
    } else {
      this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.042'));
    }
  }

  setParentConfig(parentConfig) {
    this.questionSetHierarchy.showSolutions = !_.isUndefined(parentConfig?.showSolutions) ?
    parentConfig.showSolutions : false;
    this.questionSetHierarchy.shuffle = !_.isUndefined(parentConfig?.shuffle) ?
    parentConfig.shuffle : false;
    this.questionSetHierarchy.showFeedback = !_.isUndefined(parentConfig?.showFeedback) ?
    parentConfig.showFeedback : false;
  }

  setQumlPlayerData(questionId: string) {
    const questionMetadata: any = _.cloneDeep(this.getQuestionMetadata());
    questionMetadata.identifier = questionId;
    this.questionSetHierarchy.children = [questionMetadata];
    this.questionSetHierarchy['outcomeDeclaration'] = this.getOutcomeDeclaration(questionMetadata);
    if (this.questionSetHierarchy.shuffle === true) {
      this.questionSetHierarchy.outcomeDeclaration.maxScore.defaultValue = DEFAULT_SCORE;
    } else {
      if (questionMetadata.qType === 'SA') {
        this.questionSetHierarchy['outcomeDeclaration'] = {maxScore: {defaultValue: 0}};
      }
    }
    this.editorCursor.setQuestionMap(questionId, questionMetadata);
  }

  getOutcomeDeclaration(questionMetadata) {
    let cardinality = 'single';
    if (!_.isUndefined(questionMetadata?.responseDeclaration?.response1?.mapping) &&
    (questionMetadata.responseDeclaration.response1.mapping).length > 1) {
        cardinality = 'multiple';
    }
    const outcomeDeclaration = {
      maxScore: {
        cardinality: cardinality,
        type: 'integer',
        defaultValue: this.maxScore
      },
      hint: {
        cardinality: "single",
        type: "string",
        defaultValue: this.hintsUUID ? this.hintsUUID : ''
      }
    };
    return outcomeDeclaration;
  }

  setQuestionId(questionId) {
    this.questionId = questionId;
  }

  setQuestionTitle(questionId?) {
    let index;
    let questionTitle = '';
    if (_.get(this.creationContext, 'objectType') === 'question') {
      if (!_.isUndefined(this.questionPrimaryCategory)) {
        questionTitle = this.questionPrimaryCategory;
      }
    } else {
      if (!_.isUndefined(questionId)) {
        questionTitle = this.getExistingQuestionTitle(questionId);
      } else {
        const hierarchyChildren = this.treeService.getChildren();
        index = hierarchyChildren.length;
        questionTitle = `Q${(index + 1).toString()} | `;
        if (!_.isUndefined(this.questionPrimaryCategory)) {
          questionTitle = questionTitle + (_.get(this.categoryLabel, `${this.questionPrimaryCategory}`) || this.questionPrimaryCategory);
        }
      }
    }
    this.toolbarConfig.title = questionTitle;
  }

  getExistingQuestionTitle(questionId) {
    let index;
    let questionTitle = '';
    const parentNode = this.treeService.getActiveNode().getParent();
    let hierarchyChildren = parentNode.getChildren();
    _.forEach(hierarchyChildren, (child) => {
      if (child.children) {
        index =  _.findIndex(child.children, { identifier: questionId });
        const question  = child.children[index];
        // tslint:disable-next-line:max-line-length
        questionTitle = `Q${(index + 1).toString()} | ` + (_.get(this.categoryLabel, `${question.primaryCategory}`) || question.primaryCategory);
      } else {
        index =  _.findIndex(hierarchyChildren, (node) => node.data.id === questionId);
        const question  = hierarchyChildren[index];
        // tslint:disable-next-line:max-line-length
        questionTitle = `Q${(index + 1).toString()} | ` + (_.get(this.categoryLabel, `${_.get(question, 'data.primaryCategory')}`) || _.get(question, 'data.primaryCategory'));
      }
    });
    return questionTitle;
  }

  onStatusChanges(event) {
    if (_.has(event, 'isValid')) {
      this.questionMetadataFormStatus = event.isValid;
    }
  }

  valueChanges(event) {
    if (_.has(event, 'maxScore')) {
      // tslint:disable-next-line:radix
      event.maxScore = !_.isNull(event.maxScore) ? parseInt(event.maxScore) : this.maxScore;
      this.maxScore = event.maxScore;
    }
    this.childFormData = event;
  }

  validateFormFields() {
    _.forEach(this.questionFormConfig, (formFieldCategory) => {
      if (formFieldCategory.required && !this.childFormData[formFieldCategory.code]) {
        this.showFormError = true;
        this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.008'));
        return false;
      }
    });
    return true;
  }

  previewFormData(status) {
    const formConfig = _.cloneDeep(this.leafFormConfig);
    this.questionFormConfig = null;
    _.forEach(formConfig, (formFieldCategory) => {
      if (_.has(formFieldCategory, 'editable') && !_.isUndefined(formFieldCategory.editable)) {
        formFieldCategory.editable = status ? _.find(this.leafFormConfig, { code: formFieldCategory.code }).editable : status;
        formFieldCategory.default = this.childFormData[formFieldCategory.code];
      }
    });
    this.questionFormConfig = formConfig;
  }

  populateFormData() {
    this.childFormData = {};
      if (!_.isUndefined(this.questionId)) {
        this.setExistingQuestionData();
      } else {
        _.forEach(this.leafFormConfig, (formFieldCategory) => {
        // tslint:disable-next-line:max-line-length
        const questionSetDefaultValue = _.get(this.questionSetHierarchy, formFieldCategory.code) ? _.get(this.questionSetHierarchy, formFieldCategory.code) : '';
        const defaultEditStatus = _.find(this.initialLeafFormConfig, {code: formFieldCategory.code}).editable === true;
        formFieldCategory.default = defaultEditStatus ? '' : questionSetDefaultValue;
        this.childFormData[formFieldCategory.code] = formFieldCategory.default;
        if (formFieldCategory.code === 'maxScore' && this.questionInteractionType === 'choice') {
          this.childFormData[formFieldCategory.code] = this.maxScore;
        }
      });
    }
    this.fetchFrameWorkDetails();
    (this.isReadOnlyMode ===true && !_.isUndefined(this.editorService?.editorConfig?.config?.renderTaxonomy)) ? this.previewFormData(false) : this.previewFormData(true);
  }

  setExistingQuestionData() {
    const availableAlias = {
      dateFormat: 'interactions.response1.validation.pattern',
      autoCapture: 'interactions.response1.autoCapture',
      markAsNotMandatory: 'interactions.validation.required',
      numberOnly: 'interactions.response1.type.number',
      characterLimit: 'interactions.response1.validation.limit.maxLength',
      remarksLimit: 'remarks.maxLength',
      evidenceMimeType: 'evidence.mimeType'
    };
    _.forEach(this.leafFormConfig, (formFieldCategory) => {
      if (formFieldCategory.code === 'maxScore' && this.questionInteractionType === 'choice') {
        const defaultValue = _.get(this.questionMetaData, 'outcomeDeclaration.maxScore.defaultValue');
        this.childFormData[formFieldCategory.code] = defaultValue || this.maxScore;
      }
      else if (formFieldCategory.code === 'allowMultiSelect' && this.questionInteractionType === 'choice') {
        const defaultValue = _.get(this.questionMetaData, 'responseDeclaration.response1.cardinality')
        this.childFormData[formFieldCategory.code] =  defaultValue === 'multiple' ? 'Yes' : 'No';
      }
      else if (this.questionMetaData && _.has(availableAlias, formFieldCategory.code)) {
        this.setChildAliasData(availableAlias, formFieldCategory);
      }
      else if (this.questionMetaData && _.has(this.questionMetaData, formFieldCategory.code)) {
        formFieldCategory.default = this.questionMetaData[formFieldCategory.code];
        this.childFormData[formFieldCategory.code] = this.questionMetaData[formFieldCategory.code];
      }
    });
  }

  setChildAliasData(availableAlias, formFieldCategory) {
    let defaultValue = _.get(this.questionMetaData, availableAlias[formFieldCategory.code]);
        if (formFieldCategory.code === 'markAsNotMandatory') {
          defaultValue === 'Yes' ? (defaultValue = 'No') : (defaultValue = 'Yes');
        }
        formFieldCategory.default = defaultValue;
        this.childFormData[formFieldCategory.code] = defaultValue;
  }

  subMenuChange({ index, value }) {
    if (this.subMenus[index].id === 'addDependantQuestion') {
      this.showAddSecondaryQuestionCat = true;
      this.saveContent();
      if (this.showFormError) {
        this.showAddSecondaryQuestionCat = false;
        return;
      }
    }
    this.subMenus[index].value = value;
  }

  get dependentQuestions() {
    try {
       return this.subMenus.filter(menu => menu.id === 'addDependantQuestion')[0].value;
    } catch (error) {
      return null;
    }
  }
  subMenuConfig() {
    this.subMenus = [
      this.getHints(),
      this.getInstructions(),
      {
        id: 'addDependantQuestion',
        name: 'Add Dependant Question',
        label: '',
        value: [],
        enabled: false,
        type: '',
        show: _.get(this.sourcingSettings, 'showAddSecondaryQuestion') && !this.questionInput.setChildQueston
      }
    ];
    if (!_.get(this.sourcingSettings, 'showAddSecondaryQuestion') && !this.questionInput.setChildQueston) {
      this.showOptions = false;
    } else {
    this.showOptions = (this.questionInput.setChildQueston === true) ? true : false;
    }
  }
  getHints() {
    return {
      id: 'addHint',
      name: 'Add Hint',
      value:(() => { 
        if(this.questionMetaData?.outcomeDeclaration ) {
          return this.questionMetaData?.hints[this.questionMetaData.outcomeDeclaration.hint.defaultValue].en;
        }
        else {
           return '';
        }
      })(),
      label: 'Hint',
      enabled:(() => { 
        if(this.questionMetaData?.outcomeDeclaration && this.questionMetaData?.hints[this.questionMetaData.outcomeDeclaration.hint.defaultValue].en.length > 0) {
          return true;
        }
        else {
          return false;
        }
      })(),
      type: 'input',
      show: _.get(this.sourcingSettings, 'showAddHints')
    }
  }

  getInstructions() {
    return {
      id: 'addTip',
      name: 'Add Tip',
      value: (() => { 
        if(this.questionMetaData) {
          return this.questionMetaData?.instructions
        }
        else {
          return '';
        }
      })(),
      label: 'Tip',
      enabled: (() => { 
        if(this.questionMetaData && this.questionMetaData?.instructions?.length > 0) {
          return true;
        }
        else {
           return false;
        }
      })(),
      type: 'input',
      show: _.get(this.sourcingSettings, 'showAddTips')
    }
  }
  private renderEditorComponent(): void {
    if (!this.editorOutlet) { return; }
    const def = this.editorRegistry.resolveByCategory(this.questionPrimaryCategory) ||
                this.editorRegistry.resolveByInteractionType(this.questionInteractionType);
    if (!def) { return; }
    this.activeEditorRef?.destroy();
    this.editorOutlet.clear();
    const ref = this.editorOutlet.createComponent(def.component, { ngModuleRef: this.ngModuleRef });
    ref.instance.editorState            = this.editorState;
    ref.instance.questionPrimaryCategory = this.questionPrimaryCategory;
    ref.instance.showFormError          = this.showFormError;
    ref.instance.isReadOnlyMode         = this.isReadOnlyMode;
    if ('sourcingSettings' in ref.instance) { ref.instance['sourcingSettings'] = this.sourcingSettings; }
    if ('mapping'          in ref.instance) { ref.instance['mapping']          = this.scoreMapping; }
    if ('maxScore'         in ref.instance) { ref.instance['maxScore']         = this.maxScore; }
    if ('activeLang'       in ref.instance) { (ref.instance as any)['activeLang'] = this.activeLang; }
    ref.instance.editorDataOutput.subscribe((e: any) => this.editorDataHandler(e));
    ref.changeDetectorRef.markForCheck();
    this.activeEditorRef = ref;
  }

  ngOnDestroy() {
    try { this.activeEditorRef?.destroy(); } catch (_) {}
    this.activeEditorRef = null;
    this.onComponentDestroy$.next();
    this.onComponentDestroy$.complete();
    this.editorCursor.clearQuestionMap();
    this.editorCursor.removeQuestionMap(this.questionId || this.tempQuestionId);
  }

  sliderData($event) {
    const val = $event;
    const obj = {
      validation: {
        range: {
          min: '',
          max: ''
        }
      },
      step: ''
    };
    if (val.leftAnchor) {
      obj.validation.range.min = val.leftAnchor;
    }
    if (val.rightAnchor) {
      obj.validation.range.max = val.rightAnchor;
    }
    if (val.step) {
      obj.step = val.step;
    }
    this.sliderDatas = obj;
  }

  optionHandler(e) {
    this.targetOption = e.target.value;
  }


  buildCondition(type) {
    if(this.condition ==='default' || _.isEmpty(this.selectedOptions) ){
      this.toasterService.error(_.get(this.configService, 'labelConfig.messages.error.038'));
      return;
    }
    const questionId = this.questionId ? this.questionId : uuidv4();
    const data = this.treeNodeData;
    const hierarchyData = this.editorService.getHierarchyObj(data, '', this.selectedSectionId);
    const sectionData = _.get(hierarchyData, `${this.selectedSectionId}`);
    const sectionName = sectionData.name;
    const branchingLogic = {
      ...this.branchingLogic,
      [this.editorService.parentIdentifier]: {
        target: this.updateTarget(questionId),
        preCondition: {},
        source: []
      },
      [questionId]: {
        target: [],
        source: [this.editorService.parentIdentifier],
        preCondition: {
          and: [
            {
              [this.condition]: [
                {
                  var: `${this.editorService.parentIdentifier}.${this.responseVariable}.value`,
                  type: 'responseDeclaration',
                },
                this.selectedOptions,
              ],
            },
          ],
        },
      },
  };
    this.updateTreeCache(sectionName, branchingLogic, this.selectedSectionId);
    const metaData = this.getQuestionMetadata();
    this.setQuestionTypeValues(metaData);
    const finalResult = {
      nodesModified: {
        [questionId]: {
          metadata: metaData,
          objectType: 'Question',
          root: false,
          isNew: this.questionId ? false : true
        },
        [this.selectedSectionId]: {
          ...this.treeService.treeCache.nodesModified[this.selectedSectionId]
        }
      },
      hierarchy: this.editorService.getHierarchyObj(data, questionId, this.selectedSectionId,this.editorService.parentIdentifier)
    };
    this.saveQuestions(finalResult, type);
  }

  updateTarget(questionId) {
    if (!_.isEmpty(this.branchingLogic) && _.get(this.branchingLogic, `${this.editorService.parentIdentifier}.target`)) {
      if (this.branchingLogic[this.editorService.parentIdentifier].target.includes(questionId)) {
        return [...this.branchingLogic[this.editorService.parentIdentifier].target];
      }
      return [...this.branchingLogic[this.editorService.parentIdentifier].target, `${questionId}`];
    }
    return [`${questionId}`];
  }

  getOptions() {
    if (this.editorService.optionsLength) {
      this.options = [];
      Array.from({length: this.editorService.optionsLength}, (x, i) => {
        this.options.push({value: i, label: i});
      });
    }
  }

  getParentQuestionOptions(questionId) {
    this.editorService.parentIdentifier = questionId;
    this.questionService.readQuestion(questionId)
    .subscribe((res) => {
      if (res.responseCode === 'OK') {
        const result = res.result.question;
        if (result.interactionTypes[0] === 'choice') {
          const numberOfOptions = result.interactions.response1.options.length;
          this.editorService.optionsLength = numberOfOptions;
          this.getOptions();
        }
      }
    });
  }

  updateTreeCache(sectionName, branchingLogic, selectedSection) {
    const metadata = {
      name: sectionName,
      primaryCategory: this.sectionPrimaryCategory,
      allowBranching: 'Yes',
      branchingLogic
    };
    this.treeService.updateNode(metadata, selectedSection, this.sectionPrimaryCategory);
  }

  setCondition(data) {
    const Condition = _.get(data?.branchingLogic, `${this.questionId}.preCondition.and[0]`);
    const getCondition = Object.keys(Condition);
    this.condition = getCondition[0];
    this.selectedOptions = Condition[getCondition][1];
  }

  getBranchingLogic(children) {
    _.forEach(children, (data) => {
      if (data.identifier === this.selectedSectionId) {
        this.branchingLogic = data?.branchingLogic ? data?.branchingLogic : {};
        if (_.get(data?.branchingLogic, `${this.questionId}.source[0]`)) {
          this.isChildQuestion = true;
          this.getParentQuestionOptions(data.branchingLogic[this.questionId].source[0]);
          this.setCondition(data);
        }
      }
      if (data?.children) {
        this.getBranchingLogic(data?.children);
      }
    });
  }

  onQualityFormSubmit(event) {
    switch (event.action) {
      case 'submit':
        this.saveQualityParameters(event.data, this.sendQuestionForPublish.bind(this, {}));
        break;
      case 'requestChange':
        this.requestChangesPopupAction = null;
        this.saveQualityParameters(event.data, this.openRequestChangesPopup.bind(this, {}));
        break;
      default:
        this.showQualityParameterPopup = false;
    }
  }

  saveQualityParameters(qualityParameters, callback) {
    const requestObj = {
      question: {
        reviewerQualityChecks: qualityParameters
      }
    };
    this.questionService.updateQuestion(this.questionId, requestObj).subscribe(res => {
        this.showQualityParameterPopup = false;
        if (callback) {
          callback();
        }
    });
  }

  openRequestChangesPopup() {
    this.requestChangesPopupAction = 'rejectQuestion';
  }
}