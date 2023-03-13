import { QuestionService } from './../../services/question/question.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { QuestionComponent } from './question.component';
import { Router } from '@angular/router';
import { PlayerService } from '../../services/player/player.service';
import { EditorTelemetryService } from '../../services/telemetry/telemetry.service';
import { EditorService } from '../../services/editor/editor.service';
import { ToasterService } from '../../services/toaster/toaster.service';
import { EditorCursor } from '../../collection-editor-cursor.service';
import { TreeService } from '../../services/tree/tree.service';
import { SuiModule } from 'ng2-semantic-ui-v9';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TelemetryInteractDirective } from '../../directives/telemetry-interact/telemetry-interact.directive';
import { collectionHierarchyMock, mockData, readQuestionMock, mockTreeService } from './question.component.spec.data';
import { of } from 'rxjs';

const mockEditorService = {
  editorConfig: {
    config: {
      renderTaxonomy:false,
      hierarchy: {
        level1: {
          name: "Module",
          type: "Unit",
          mimeType: "application/vnd.ekstep.content-collection",
          contentType: "Course Unit",
          iconClass: "fa fa-folder-o",
          children: {},
        },
      },
    },
  },
  parentIdentifier: "",
  optionsLength: 4,
  selectedChildren: {
    primaryCategory: "Multiselect Multiple Choice Question",
    label: "Multiple Choice Question",
    interactionType: "choice",
  },
  getToolbarConfig: () => {},
  getHierarchyObj: () => {},
  fetchCollectionHierarchy: (questionSetId) => {
    subscribe: (fn) => fn(collectionHierarchyMock);
  },
  updateCollection: (questionSetId, event) => {
    subscribe: (fn) => fn({});
  },
  addResourceToQuestionset: (questionSetId, unitId, questionId) => {
    subscribe: (fn) => fn({});
  },
  apiErrorHandling: () => {},
  editorMode:'review'
};

describe('QuestionComponent', () => {
  let component: QuestionComponent;
  let fixture: ComponentFixture<QuestionComponent>;
  class RouterStub {
    navigate = jasmine.createSpy('navigate');
  }
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QuestionComponent, TelemetryInteractDirective],
      imports: [HttpClientTestingModule, SuiModule],
      providers: [EditorTelemetryService, QuestionService, ToasterService,
        PlayerService, { provide: EditorService, useValue: mockEditorService }, { provide: Router, useClass: RouterStub }, EditorCursor,
        { provide: TreeService, useValue: mockTreeService }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionComponent);
    component = fixture.componentInstance;
    component.questionInput = {
      "questionSetId": "do_11330102570702438417",
      "questionId": "do_11330103476396851218"
    };
    component.questionId = "do_1134357224765685761203";
    component.questionInteractionType = "choice";
    editorService = TestBed.inject(EditorService);
    configService = TestBed.inject(ConfigService);
    telemetryService = TestBed.inject(EditorTelemetryService);
    treeService = TestBed.get(TreeService);
    questionService = TestBed.get(QuestionService);
    toasterService = TestBed.get(ToasterService);
    spyOn(telemetryService, "impression").and.callFake(() => {});
    editorService.selectedChildren.label = "Slider";
    component.toolbarConfig.showPreview = false;
    component.creationContext = creationContextMock;
    component.leafFormConfig = leafFormConfigMock;
    editorService.optionsLength = 4;
    editorService.selectedChildren.label = "MCQ";
    component.questionInput = {
      questionSetId: "do_11330102570702438417",
      questionId: "do_11330103476396851218",
      type: undefined,
      category: "MTF",
      config: {},
      creationContext: creationContextMock,
      setChildQueston: undefined,
    };
    component.showTranslation = false;
    spyOn(treeService, "getNodeById").and.callFake(()=>{
      return treeNodeData;
    })

    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("Unit test for #ngOnInit()", () => {
    component.toolbarConfig = editorService.toolbarConfig;
    component.leafFormConfig=leafFormConfigMock;
    component.initialLeafFormConfig=leafFormConfigMock;
    component.questionFormConfig = leafFormConfigMock;
    component.questionInput = {
      questionSetId: "do_11330102570702438417",
      questionId: "do_11330103476396851218",
      type: 'choice',
      category: "MTF",
      config: {},
      creationContext: creationContextMock,
      setChildQueston: undefined,
    };
    component.creationContext.objectType = "question";
    spyOn(editorService, "getToolbarConfig").and.returnValue({
      title: "abcd",
      showDialcode: "No",
      showPreview: "",
    });
    spyOn(editorService, "fetchCollectionHierarchy").and.callFake(() => {
      return of(collectionHierarchyMock);
    });
    spyOn(questionService, "readQuestion").and.returnValue(
      of(mockData.mcqQuestionMetaData)
    );
    component.ngOnInit();
    component.previewFormData(true);
    expect(component.questionInteractionType).toEqual("choice");
    expect(component.questionCategory).toEqual("MTF");
    expect(component.questionId).toEqual("do_11330103476396851218");
    expect(component.questionSetId).toEqual("do_11330102570702438417");
    expect(component.creationContext).toEqual(creationContextMock);
    expect(component.unitId).toEqual(creationContextMock.unitIdentifier);
    expect(component.isReadOnlyMode).toEqual(
      creationContextMock.isReadOnlyMode
    );
    expect(component.toolbarConfig).toBeDefined();
    expect(component.toolbarConfig.showPreview).toBeFalsy();
    expect(component.questionInput.setChildQueston).toBeFalsy();
  });
  it('should call validateFormFields', () => {
    component.leafFormConfig = mockData.childMetadata;
    component.childFormData = mockData.formData;
    const toasterService = TestBed.get(ToasterService);
    spyOn(toasterService, 'error').and.callThrough();
    component.validateFormFields();
    expect(component.showFormError).toBeFalsy();
  });
  it('#populateFrameworkData() should call populateFrameworkData and set leafFormConfig values ', () => {
    component.frameworkDetails.frameworkData = mockData.frameWorkDetails.frameworkData;
    component.leafFormConfig = mockData.formData;
    component.populateFrameworkData();
    expect(component.leafFormConfig).toBeDefined();
  });

  it("#initialize should call when question page for question mcq", () => {
    component.initialLeafFormConfig = leafFormConfigMock;
    component.leafFormConfig = leafFormConfigMock;
    component.questionFormConfig=leafFormConfigMock;
    spyOn(component, "initialize").and.callThrough();
    component.questionId = "do_11330103476396851218";
    editorService.parentIdentifier = undefined;
    component.questionPrimaryCategory = undefined;
    spyOn(editorService, "getToolbarConfig").and.returnValue({
      title: "abcd",
      showDialcode: "No",
      showPreview: "false",
    });
    component.toolbarConfig.showPreview = false;
    spyOn(editorService, "fetchCollectionHierarchy").and.callFake(() => {
      return of(collectionHierarchyMock);
    });
    component.questionId = "do_123";
    component.questionSetHierarchy = collectionHierarchyMock.result.questionSet;
    spyOn(questionService, "readQuestion").and.returnValue(
      of(mockData.mcqQuestionMetaData)
    );
    component.questionMetaData = mockData.mcqQuestionMetaData.result.question;
    component.questionInteractionType = "choice";
    component.scoreMapping =
      mockData.mcqQuestionMetaData.result.question.responseDeclaration.response1.mapping;
    component.sourcingSettings = sourcingSettingsMock;
    component.questionInput.setChildQuestion = false;
    component.editorState.solutions=[{
      id:'1',
      type:'vedio'
    }]
    component.initialize();
    component.previewFormData(true);
    expect(component.initialize).toHaveBeenCalled();
  });

  it("#initialize should call when question page for question mcq api fail", () => {
    spyOn(component, "initialize").and.callThrough();
    component.questionId = "do_11330103476396851218";
    editorService.parentIdentifier = undefined;
    component.questionFormConfig = leafFormConfigMock;
    component.leafFormConfig = leafFormConfigMock;
    spyOn(editorService, "getToolbarConfig").and.returnValue({
      title: "abcd",
      showDialcode: "No",
      showPreview: "false",
    });
    component.toolbarConfig.showPreview = false;
    spyOn(editorService, "fetchCollectionHierarchy").and.callFake(() => {
      return throwError("error");
    });
    component.questionId = "do_123";
    spyOn(editorService, "apiErrorHandling").and.callFake(() => {});
    component.initialize();
    expect(component.initialize).toHaveBeenCalled();
  });

  it("#initialize should call when question page for question slider", () => {
    spyOn(component, "initialize").and.callThrough();
    component.questionId = "do_11330103476396851218";
    component.questionInteractionType = "slider";
    editorService.parentIdentifier = undefined;
    component.questionPrimaryCategory = "Slider";
    component.questionFormConfig = leafFormConfigMock;
    component.leafFormConfig = leafFormConfigMock;
    spyOn(editorService, "getToolbarConfig").and.returnValue({
      title: "abcd",
      showDialcode: "No",
      showPreview: "false",
    });
    component.toolbarConfig.showPreview = false;
    spyOn(editorService, "fetchCollectionHierarchy").and.callFake(() => {
      return of(collectionHierarchyMock);
    });
    component.questionSetHierarchy = collectionHierarchyMock.result.questionSet;
    component.questionId = "do_1234";
    spyOn(questionService, "readQuestion").and.returnValue(
      of(mockData.sliderQuestionMetaData)
    );
    component.questionMetaData =
      mockData.sliderQuestionMetaData.result.question;
    component.editorState =
      mockData.sliderQuestionMetaData.result.question.editorState;
    component.initialize();
    expect(component.initialize).toHaveBeenCalled();
  });

  it("#initialize should call when question page for question text", () => {
    spyOn(component, "initialize").and.callThrough();
    component.leafFormConfig=leafFormConfigMock;
    component.initialLeafFormConfig=leafFormConfigMock;
    component.childFormData = childMetaData;
    component.questionInteractionType = "text";
    component.questionId = "do_11330103476396851218";
    editorService.parentIdentifier = undefined;
    spyOn(editorService, "getToolbarConfig").and.returnValue({
      title: "abcd",
      showDialcode: "No",
      showPreview: "false",
    });
    component.toolbarConfig.showPreview = false;
    spyOn(editorService, "fetchCollectionHierarchy").and.callFake(() => {
      return of(collectionHierarchyMock);
    });
    component.questionSetHierarchy = collectionHierarchyMock.result.questionSet;
    component.questionId = "do_1235";
    spyOn(questionService, "readQuestion").and.returnValue(
      of(mockData.textQuestionNetaData)
    );
    component.questionMetaData = mockData.textQuestionNetaData.result.question;
    component.editorState =
      mockData.textQuestionNetaData.result.question.editorState;
    component.initialize();
    component.previewFormData(false);
    expect(component.initialize).toHaveBeenCalled();
  });

  it("#initialize should call when question page for question date", () => {
    spyOn(component, "initialize").and.callThrough();
    component.questionInteractionType = "date";
    component.leafFormConfig=leafFormConfigMock;
    component.initialLeafFormConfig=leafFormConfigMock;
    component.childFormData = childMetaData;
    component.questionId = "do_11330103476396851218";
    editorService.parentIdentifier = undefined;
    spyOn(editorService, "getToolbarConfig").and.returnValue({
      title: "abcd",
      showDialcode: "No",
      showPreview: "false",
    });
    component.toolbarConfig.showPreview = false;
    spyOn(editorService, "fetchCollectionHierarchy").and.callFake(() => {
      return of(collectionHierarchyMock);
    });
    component.questionId = "do_126";
    component.questionPrimaryCategory = undefined;
    component.questionSetHierarchy = collectionHierarchyMock.result.questionSet;
    spyOn(questionService, "readQuestion").and.returnValue(
      of(mockData.dateQuestionMetaDate)
    );
    component.questionMetaData = mockData.dateQuestionMetaDate.result.question;
    component.editorState =
      mockData.dateQuestionMetaDate.result.question.editorState;
    component.initialize();
    expect(component.initialize).toHaveBeenCalled();
  });

  it("#initialize should call when question page for question default", () => {
    spyOn(component, "initialize").and.callThrough();
    component.questionId = "do_11330103476396851218";
    editorService.parentIdentifier = undefined;
    component.leafFormConfig=leafFormConfigMock;
    component.initialLeafFormConfig=leafFormConfigMock;
    component.childFormData = childMetaData;
    spyOn(editorService, "getToolbarConfig").and.returnValue({
      title: "abcd",
      showDialcode: "No",
      showPreview: "false",
    });
    component.toolbarConfig.showPreview = false;
    spyOn(editorService, "fetchCollectionHierarchy").and.callFake(() => {
      return of(collectionHierarchyMock);
    });
    component.questionSetHierarchy = collectionHierarchyMock.result.questionSet;
    spyOn(questionService, "readQuestion").and.returnValue(
      of(mockData.defaultQuestionMetaData)
    );
    component.questionMetaData =
      mockData.defaultQuestionMetaData.result.question;
    component.questionInteractionType = "default";
    component.initialize();
    expect(component.initialize).toHaveBeenCalled();
  });

  it("#initialize should call when question page for question mcq", () => {
    spyOn(component, "initialize").and.callThrough();
    component.initialLeafFormConfig = leafFormConfigMock;
    component.leafFormConfig = leafFormConfigMock;
    component.questionFormConfig = leafFormConfigMock;
    component.questionId = "do_11330103476396851218";
    editorService.parentIdentifier = undefined;
    spyOn(editorService, "getToolbarConfig").and.returnValue({
      title: "abcd",
      showDialcode: "No",
      showPreview: "false",
    });
    component.toolbarConfig.showPreview = false;
    spyOn(editorService, "fetchCollectionHierarchy").and.callFake(() => {
      return of(collectionHierarchyMock);
    });
    component.questionId = undefined;
    component.questionSetHierarchy = collectionHierarchyMock.result.questionSet;
    spyOn(questionService, "readQuestion").and.returnValue(
      of(mockData.mcqQuestionMetaData)
    );
    component.questionMetaData = mockData.mcqQuestionMetaData.result.question;
    component.editorState =
      mockData.mcqQuestionMetaData.result.question.editorState;
    spyOn(editorService, "apiErrorHandling").and.callFake(() => {});
    component.questionMetaData = mockData.mcqQuestionMetaData;
    component.questionInteractionType = "choice";
    component.initialize();
    expect(component.initialize).toHaveBeenCalled();
  });

  it("#initialize should call when question page for question slider", () => {
    spyOn(component, "initialize").and.callThrough();
    component.initialLeafFormConfig = leafFormConfigMock;
    component.leafFormConfig = leafFormConfigMock;
    component.questionId = "do_11330103476396851218";
    editorService.parentIdentifier = undefined;
    spyOn(editorService, "getToolbarConfig").and.returnValue({
      title: "abcd",
      showDialcode: "No",
      showPreview: "false",
    });
    component.toolbarConfig.showPreview = false;
    component.questionSetHierarchy = collectionHierarchyMock.result.questionSet;
    spyOn(editorService, "fetchCollectionHierarchy").and.callFake(() => {
      return of(collectionHierarchyMock);
    });
    component.questionId = undefined;
    spyOn(questionService, "readQuestion").and.returnValue(
      of(mockData.sliderQuestionMetaData)
    );
    component.questionMetaData = mockData.sliderQuestionMetaData;
    component.questionInteractionType = "slider";
    component.initialize();
    expect(component.initialize).toHaveBeenCalled();
  });

  it("#initialize should call when question page for question text", () => {
    spyOn(component, "initialize").and.callThrough();
    component.initialLeafFormConfig = leafFormConfigMock;
    component.leafFormConfig = leafFormConfigMock;
    component.questionFormConfig = leafFormConfigMock;
    component.questionId = "do_11330103476396851218";
    editorService.parentIdentifier = undefined;
    spyOn(editorService, "getToolbarConfig").and.returnValue({
      title: "abcd",
      showDialcode: "No",
      showPreview: "false",
    });
    component.toolbarConfig.showPreview = false;
    component.questionSetHierarchy = collectionHierarchyMock.result.questionSet;
    spyOn(editorService, "fetchCollectionHierarchy").and.callFake(() => {
      return of(collectionHierarchyMock);
    });
    component.questionId = undefined;
    spyOn(questionService, "readQuestion").and.returnValue(
      of(mockData.textQuestionNetaData)
    );
    component.questionMetaData = mockData.textQuestionNetaData;
    component.questionInteractionType = "text";
    component.initialize();
    expect(component.initialize).toHaveBeenCalled();
  });

  it("#initialize should call when question page for question date", () => {
    spyOn(component, "initialize").and.callThrough();
    component.initialLeafFormConfig = leafFormConfigMock;
    component.leafFormConfig = leafFormConfigMock;
    component.questionFormConfig = leafFormConfigMock;
    component.questionId = "do_11330103476396851218";
    editorService.parentIdentifier = undefined;
    spyOn(editorService, "getToolbarConfig").and.returnValue({
      title: "abcd",
      showDialcode: "No",
      showPreview: "false",
    });
    component.toolbarConfig.showPreview = false;
    spyOn(editorService, "fetchCollectionHierarchy").and.callFake(() => {
      return of(collectionHierarchyMock);
    });
    component.questionSetHierarchy = collectionHierarchyMock.result.questionSet;
    spyOn(questionService, "readQuestion").and.returnValue(
      of(mockData.dateQuestionMetaDate)
    );
    component.questionInteractionType = "date";
    component.initialize();
    expect(component.initialize).toHaveBeenCalled();
  });

  it("#toolbarEventListener() should call toolbarEventListener for saveContent", () => {
    const event = { button: "saveContent" };
    component.actionType = event.button;
    spyOn(component, "saveContent");
    component.toolbarEventListener(event);
    expect(component.toolbarEventListener).toHaveBeenCalledWith;
  });

  it("#toolbarEventListener() should call toolbarEventListener for showTranslation", () => {
    spyOn(component, "toolbarEventListener").and.callThrough();
    const event = { button: "showTranslation" };
    component.actionType = event.button;
    component.toolbarEventListener(event);
    expect(component.toolbarEventListener).toHaveBeenCalledWith(event);
    expect(component.showTranslation).toBe(true);
  });

  it("#toolbarEventListener() should call toolbarEventListener for cancelContent", () => {
    const data = { button: "cancelContent" };
    spyOn(component, "handleRedirectToQuestionset");
    component.toolbarEventListener(data);
    expect(component.handleRedirectToQuestionset).toHaveBeenCalled();
  });
  it('#toolbarEventListener() should call toolbarEventListener for backContent', () => {
    const data = { button: 'backContent' };
    spyOn(component, 'handleRedirectToQuestionset');
    component.toolbarEventListener(data);
    expect(component.handleRedirectToQuestionset).toHaveBeenCalled();
  });
  it('#toolbarEventListener() should call toolbarEventListener for previewContent', () => {
    const data = { button: 'previewContent' };
    spyOn(component, 'previewContent');
    component.toolbarEventListener(data);
    expect(component.previewContent).toHaveBeenCalled();
  });
  it('#toolbarEventListener() should call toolbarEventListener for editContent', () => {
    const data = { button: 'editContent' };
    spyOn(component, 'previewFormData');
    component.toolbarEventListener(data);
    expect(component.previewFormData).toHaveBeenCalledWith(true);
    expect(component.showPreview).toBeFalsy();
    expect(component.toolbarConfig.showPreview).toBeFalsy();
  });
  it('#toolbarEventListener() should call toolbarEventListener for default case', () => {
    const data = { button: '' };
    spyOn(component, 'toolbarEventListener');
    component.toolbarEventListener(data);
    expect(component.toolbarEventListener).toHaveBeenCalledWith(data);
  });

  it("Unit test for #populateFormData ", () => {
    component.childFormData = {};
    component.isReadOnlyMode=false;
    component.questionMetaData=mockData.mcqQuestionMetaData.result.question;
    component.leafFormConfig = leafFormConfigMock;
    component.initialLeafFormConfig = leafFormConfigMock;
    component.questionFormConfig = leafFormConfigMock;
    component.questionId = "do_123";
    component.questionSetHierarchy = collectionHierarchyMock.result.questionSet;
    component.previewFormData(false);
    component.populateFormData();
  });

  it("Unit test for #populateFormData readonly mode true ", () => {
    component.childFormData = {};
    component.isReadOnlyMode=true;
    component.questionMetaData=mockData.mcqQuestionMetaData.result.question;
    component.leafFormConfig = leafFormConfigMock;
    component.initialLeafFormConfig = leafFormConfigMock;
    component.questionFormConfig = leafFormConfigMock;
    component.questionId = "do_123";
    component.questionSetHierarchy = collectionHierarchyMock.result.questionSet;
    component.previewFormData(true);
    component.populateFormData();
  });

  it("should call previewFormData ", () => {
    spyOn(component, "previewFormData").and.callThrough();
    component.leafFormConfig = mockData.childMetadata.properties;
    component.initialLeafFormConfig = mockData.childMetadata.properties;
    component.childFormData = childMetaData;
    component.questionFormConfig = mockData.childMetadata.properties;
    component.previewFormData(true);
    expect(component.leafFormConfig).toEqual(mockData.childMetadata.properties);
    expect(component.previewFormData).toHaveBeenCalled();
  });
  it("should call valueChanges", () => {
    component.valueChanges(childMetaData);
    expect(component.childFormData).toEqual(childMetaData);
  });
  it("should call validateFormFields", () => {
    component.leafFormConfig = mockData.childMetadata;
    component.childFormData = childMetaData;
    const toasterService = TestBed.get(ToasterService);
    spyOn(toasterService, "error").and.callThrough();
    component.validateFormFields();
    expect(component.showFormError).toBeFalsy();
  });

  it("#populateFrameworkData() should call populateFrameworkData and set leafFormConfig values ", () => {
    component.frameworkDetails.frameworkData =
      mockData.frameWorkDetails.frameworkData;
    component.questionFormConfig = leafFormConfigMock;
    component.leafFormConfig = leafFormConfigMock;
    component.populateFrameworkData();
    expect(component.leafFormConfig).toBeDefined();
  });
  it("#outputData() should call outputData", () => {
    spyOn(component, "output").and.callThrough();
    component.output({});
    expect(component.output).toHaveBeenCalled();
  });
  it("#onStatusChanges() should call onStatusChanges", () => {
    spyOn(component, "onStatusChanges");
    component.onStatusChanges("");
    expect(component.onStatusChanges).toHaveBeenCalled();
  });

  it("call #getMcqQuestionHtmlBody() to verify questionBody", () => {
    const question = '<div class=\'question-body\' tabindex=\'-1\'><div class=\'mcq-title\' tabindex=\'0\'>{question}</div><div data-choice-interaction=\'response1\' class=\'{templateClass}\'></div></div>';
    const templateId = "mcq-vertical";
    component.getMcqQuestionHtmlBody(question, templateId);
  });

  it("Unit test for #sendForReview", () => {
    spyOn(component, "upsertQuestion");
    component.sendForReview();
    expect(component.upsertQuestion).toHaveBeenCalled();
  });

  it("Unit test for #setQuestionId", () => {
    spyOn(component, "setQuestionTitle");
    component.setQuestionId("do_11330103476396851218");
    expect(component.questionId).toEqual("do_11330103476396851218");
    expect(component.setQuestionTitle);
  });

  it("#submitHandler() should call #validateQuestionData and #validateFormFields", () => {
    spyOn(component, "validateQuestionData");
    spyOn(component, "validateFormFields");
    component.showFormError = false;
    component.submitHandler();
    expect(component.validateQuestionData).toHaveBeenCalledWith();
    expect(component.validateFormFields).toHaveBeenCalledWith();
  });
  it("#rejectQuestion() should call #requestForChanges", () => {
    const comment = "test comment";
    spyOn(component, "requestForChanges");
    component.showFormError = false;
    component.rejectQuestion(comment);
    expect(component.requestForChanges).toHaveBeenCalledWith(comment);
  });
  it("#handleRedirectToQuestionset() should call handleRedirectToQuestionset and redirectToQuestionset to be called ", () => {
    component.questionId = "do_11326368076523929611";
    spyOn(component, "redirectToQuestionset");
    component.handleRedirectToQuestionset();
    expect(component.showConfirmPopup).toBeFalsy();
    expect(component.redirectToQuestionset).toHaveBeenCalled();
  });
  it('redirectToQuestionset should call handleRedirectToQuestionset and set showConfirmPopup', () => {
    component.questionId = undefined;
    spyOn(component, 'redirectToQuestionset');
    component.handleRedirectToQuestionset();
    expect(component.showConfirmPopup).toBeTruthy();
  });
  it('#saveContent() should call saveContent and set showFormError ', () => {
    spyOn(component, 'validateQuestionData');
    spyOn(component, 'validateFormFields');
    spyOn(component, 'saveQuestion');
    component.showFormError = false;
    component.saveContent();
    expect(component.showFormError).toBeFalsy();
    expect(component.saveQuestion).toHaveBeenCalled();
  });
  it('#redirectToQuestionset() should call redirectToQuestionset and set showConfirmPopup', () => {
    spyOn(component.questionEmitter, 'emit');
    component.redirectToQuestionset();
    expect(component.showConfirmPopup).toBeFalsy();
  });
  it('#editorDataHandler() should call editorDataHandler for not any type', () => {
    component.editorState = mockData.editorState;
    component.editorDataHandler(mockData.eventData);
    expect(component.editorState).toBeDefined();
  });
  it('#editorDataHandler() should call editorDataHandler for question', () => {
    component.editorState = mockData.editorState;
    component.editorDataHandler(mockData.eventData, 'question');
    expect(component.editorState).toBeDefined();
  });
  it('#editorDataHandler() should call editorDataHandler for solution', () => {
    component.editorState = mockData.editorState;
    component.editorDataHandler(mockData.eventData, 'solution');
    expect(component.editorState).toBeDefined();
  });
  it('#editorDataHandler() should call editorDataHandler for media', () => {
    component.editorState = mockData.editorState;
    mockData.eventData.mediaobj = { id: '1234' };
    spyOn(component, 'setMedia');
    component.editorDataHandler(mockData.eventData);
    expect(component.editorState).toBeDefined();
    expect(component.setMedia).toHaveBeenCalledWith(mockData.eventData.mediaobj);
  });
  it('#setMedia should call setMedia and set media arry', () => {
    component.editorState = mockData.editorState;
    component.mediaArr = [{ id: '6789' }];
    component.setMedia({ id: '1234' });
    expect(component.mediaArr).toBeDefined();
  });
  it('#saveQuestion() should call saveQuestion for updateQuestion', () => {
    component.editorState = mockData.editorState;
    component.questionId = 'do_11326368076523929611';
    spyOn(component, 'updateQuestion');
    component.saveQuestion();
    expect(component.updateQuestion).toHaveBeenCalled();
  });
  it('#deleteSolution() should call deleteSolution and set showSolutionDropDown value', () => {
    component.editorState = mockData.editorState;
    component.deleteSolution();
    expect(component.showSolutionDropDown).toBeTruthy();
  });
  it('#deleteSolution() should call deleteSolution and define mediaArr for video type', () => {
    component.editorState = mockData.editorState;
    component.selectedSolutionType = 'video';
    component.deleteSolution();
    expect(component.mediaArr).toBeDefined();
  });
  it('#validateQuestionData() should call validateQuestionData and question is undefined', () => {
    component.editorState = mockData.editorState;
    component.editorState.question = undefined;
    component.validateQuestionData();
    expect(component.showFormError).toBeTruthy();
  });
  it('#validateQuestionData() should call validateQuestionData and questionInteractionType is default', () => {
    component.editorState = mockData.editorState;
    component.editorState.question = '<p> Hi how are you </p>';
    component.questionInteractionType = 'default';
    component.validateQuestionData();
    expect(component.showFormError).toBeFalsy();
  });
  it('#validateQuestionData() should call validateQuestionData and questionInteractionType is default', () => {
    component.editorState = mockData.editorState;
    component.editorState.question = '<p> Hi how are you </p>';
    component.editorState.answer = '';
    component.questionInteractionType = 'default';
    component.validateQuestionData();
    expect(component.showFormError).toBeTruthy();
  });
  it('#validateQuestionData() should call validateQuestionData and questionInteractionType is default', () => {
    component.editorState = mockData.editorState;
    component.editorState.question = '<p> Hi how are you </p>';
    component.editorState.answer = '';
    component.questionInteractionType = 'choice';
    component.validateQuestionData();
    expect(component.showFormError).toBeTruthy();
  });
  it('#videoDataOutput() should call videoDataOutput and event data is empty', () => {
    const event = '';
    spyOn(component, 'deleteSolution');
    component.videoDataOutput(event);
    expect(component.deleteSolution).toHaveBeenCalled();
  });
  it('#videoDataOutput() should call videoDataOutput and event data is not  empty', () => {
    const event = { name: 'event name', identifier: '1234' };
    component.videoDataOutput(event);
    expect(component.videoSolutionData).toBeDefined();
  });
  it('#videoDataOutput() should call videoDataOutput for thumbnail', () => {
    const event = { name: 'event name', identifier: '1234', thumbnail: 'sample data' };
    component.videoDataOutput(event);
    expect(component.videoSolutionData).toBeDefined();
  });
  it('#videoDataOutput() should call videoDataOutput for thumbnail', () => {
    const event = { name: 'event name', identifier: '1234', thumbnail: 'sample data' };
    component.videoDataOutput(event);
    expect(component.videoSolutionData).toBeDefined();
  });
});
