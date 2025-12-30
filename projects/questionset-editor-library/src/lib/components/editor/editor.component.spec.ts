import { EditorService } from './../../services/editor/editor.service';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { EditorComponent } from './editor.component';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EditorTelemetryService } from '../../services/telemetry/telemetry.service';
import { TelemetryInteractDirective } from '../../directives/telemetry-interact/telemetry-interact.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TreeService } from '../../services/tree/tree.service';
import {
  editorConfig, editorConfig_question, toolbarConfig_question,
  nativeElement, getCategoryDefinitionResponse, hierarchyResponse,
  categoryDefinition, categoryDefinitionData,
  SelectedNodeMockData, observationAndRubericsField,
  questionsetRead, questionsetHierarchyRead, nodesModifiedData, treeNodeData,
  questionSetEditorConfig, categoryDefinitionPublishCheckList,
  frameworkData, serverResponse, fakeApiResponse } from './editor.component.spec.data';
import { ConfigService } from '../../services/config/config.service';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { treeData } from './../fancy-tree/fancy-tree.component.spec.data';
import * as urlConfig from '../../services/config/url.config.json';
import * as labelConfig from '../../services/config/label.config.json';
import * as categoryConfig from '../../services/config/category.config.json';
import { FrameworkService } from '../../services/framework/framework.service';
import { HelperService } from '../../services/helper/helper.service';
import { ToasterService } from '../../services/toaster/toaster.service';

describe('EditorComponent', () => {
  const configStub = {
    urlConFig: (urlConfig as any).default,
    labelConfig: (labelConfig as any).default,
    categoryConfig: (categoryConfig as any).default
  };

  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;
  let toasterService;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule, RouterTestingModule],
      declarations: [EditorComponent, TelemetryInteractDirective],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [EditorTelemetryService, EditorService, ToasterService,
        { provide: ConfigService, useValue: configStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;
    toasterService = TestBed.inject(ToasterService);
    // tslint:disable-next-line:no-string-literal
    editorConfig.context['targetFWIds'] = ['nit_k12'];
    // tslint:disable-next-line:no-string-literal
    editorConfig.context['correctionComments'] = 'change description';
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('unloadHandler should call generateTelemetryEndEvent', () => {
    spyOn(component, 'unloadHandler').and.callThrough();
    spyOn(component, 'generateTelemetryEndEvent').and.callFake(() => {});
    component.unloadHandler({});
    expect(component.generateTelemetryEndEvent).toHaveBeenCalled();
  })

  it('should have default value of variables', () => {
    expect(component.questionComponentInput).toEqual({});
    expect(component.selectedNodeData).toEqual({});
    expect(component.showConfirmPopup).toBeFalsy();
    expect(component.terms).toBeFalsy();
    expect(component.pageId).toBeUndefined();
    expect(component.pageStartTime).toBeUndefined();
    expect(component.rootFormConfig).toBeUndefined();
    expect(component.unitFormConfig).toBeUndefined();
    expect(component.searchFormConfig).toBeUndefined();
    expect(component.leafFormConfig).toBeUndefined();
    expect(component.questionlibraryInput).toEqual({});
    expect(component.isQumlPlayer).toBeUndefined();
    expect(component.showQuestionTemplatePopup).toBeFalsy();
    expect(component.showDeleteConfirmationPopUp).toBeFalsy();
    expect(component.showPreview).toBeFalsy();
    expect(component.buttonLoaders.previewButtonLoader).toBeFalsy();
    expect(component.buttonLoaders.saveAsDraftButtonLoader).toBeFalsy();
    expect(component.buttonLoaders.addFromLibraryButtonLoader).toBeFalsy();
    expect(component.buttonLoaders.showReviewComment).toBeFalsy();
    expect(component.isStatusReviewMode).toBeFalsy();
    expect(component.ishierarchyConfigSet).toBeFalsy();
  });

  it('#setEditorConfig() should set editor config', () => {
    const sampleEditorConfig: any = JSON.stringify(editorConfig);
    component.editorConfig = sampleEditorConfig;
    spyOn(component, 'setEditorConfig').and.callThrough();
    component.setEditorConfig();
  })

  it('#ngOnInit() should call all methods inside it (for objectType QuestionSet)', () => {
    const sampleEditorConfig: any = JSON.stringify(editorConfig);
    component.editorConfig = sampleEditorConfig;
    component.objectType = 'questionset';
    const editorService = TestBed.inject(EditorService);
    spyOn(editorService, 'initialize').and.callThrough();
    const treeService = TestBed.inject(TreeService);
    spyOn(treeService, 'initialize').and.callThrough();
    const configService = TestBed.inject(ConfigService);
    component.configService = configService;
    spyOn(editorService, 'getToolbarConfig').and.callThrough();
    spyOn(component, 'isReviewMode').and.returnValue(false);
    spyOn(component, 'mergeCollectionExternalProperties').and.returnValue(of(hierarchyResponse));
    spyOn(component, 'initializeFrameworkAndChannel').and.callFake(() => {});
    spyOn(editorService, 'getCategoryDefinition').and.returnValue(of(categoryDefinitionData));
    spyOn(component, 'sethierarchyConfig').and.callFake(() => {});
    const telemetryService = TestBed.inject(EditorTelemetryService);
    spyOn(telemetryService, 'initializeTelemetry').and.callFake(() => { });
    spyOn(telemetryService, 'start').and.callFake(() => { });
    const questionLibraryPage: EventEmitter<any> = new EventEmitter();
    spyOn(editorService, 'getshowQuestionLibraryPageEmitter').and.callFake(() => {return questionLibraryPage});
    spyOn(component, 'showQuestionLibraryComponentPage').and.callFake(() => {});
    spyOn(component, 'getFrameworkDetails').and.callFake(() => {})
    spyOn(editorService, 'readComment').and.returnValue(of(fakeApiResponse));
    component.ngOnInit();
    expect(component.editorConfig).toBeDefined();
    expect(editorService.initialize).toHaveBeenCalledWith(editorConfig);
    expect(editorService.editorMode).toEqual('edit');
    expect(component.editorMode).toEqual('edit');
    expect(treeService.initialize).toHaveBeenCalledWith(editorConfig);
    expect(component.collectionId).toBeDefined();
    expect(component.isReviewMode).toHaveBeenCalled();
    expect(component.isStatusReviewMode).toBeFalsy();
    expect(component.mergeCollectionExternalProperties).toHaveBeenCalled();
    expect(component.toolbarConfig).toBeDefined();
    expect(component.toolbarConfig.title).toEqual(hierarchyResponse[0].result.questionset.name);
    expect(component.initializeFrameworkAndChannel).toHaveBeenCalled();
    expect(editorService.getCategoryDefinition).toHaveBeenCalled();
    expect(telemetryService.initializeTelemetry).toHaveBeenCalled();
    expect(telemetryService.telemetryPageId).toEqual('questionset_editor');
    expect(telemetryService.start).toHaveBeenCalled();
    expect(editorService.readComment).toHaveBeenCalled();
  });

  it('#ngOnInit() should call all methods inside it (for objectType Question)', () => {
    component.editorConfig = editorConfig_question;
    spyOn(component, 'setEditorConfig').and.callFake(() => {});
    const editorService = TestBed.inject(EditorService);
    spyOn(editorService, 'initialize').and.callThrough();
    const treeService = TestBed.inject(TreeService);
    spyOn(treeService, 'initialize').and.callFake(() => {});
    spyOn(editorService, 'getToolbarConfig').and.returnValue(toolbarConfig_question);
    spyOn(component, 'isReviewMode').and.returnValue(true);
    spyOn(component, 'handleQuestionObjectType').and.callFake(() =>{});
    component.ngOnInit();
    expect(editorService.editorMode).toEqual('edit');
    expect(component.editorMode).toEqual('edit');
    expect(editorService.initialize).toHaveBeenCalledWith(editorConfig_question);
    expect(treeService.initialize).toHaveBeenCalled();
    expect(editorService.getToolbarConfig).toHaveBeenCalled();
    expect(component.isReviewMode).toHaveBeenCalled();
    expect(component.handleQuestionObjectType).toHaveBeenCalled();
  });

  it('handleQuestionObjectType() should call redirectToQuestionTab()', () => {
    spyOn(component, 'redirectToQuestionTab').and.callFake(() => {});
    spyOn(component, 'handleQuestionObjectType').and.callThrough();
    component.editorConfig = editorConfig_question;
    spyOn(component, 'initializeFrameworkAndChannel').and.callFake(()=> {});
    const editorService = TestBed.inject(EditorService);
    spyOn(editorService, 'getCategoryDefinition').and.returnValue(of(getCategoryDefinitionResponse));
    spyOn(component, 'getFrameworkDetails').and.callFake(() => {});
    component.handleQuestionObjectType();
  });

  it('Unit test for #initializeFrameworkAndChannel()', () => {
    const helperService = TestBed.inject(HelperService);
    const frameworkService = TestBed.inject(FrameworkService);
    component.editorConfig = editorConfig_question;
    spyOn(frameworkService, 'getTargetFrameworkCategories').and.callFake(() => {});
    spyOn(frameworkService, 'initialize').and.callFake(() => {});
    spyOn(helperService, 'initialize').and.callFake(() => {});
    component.initializeFrameworkAndChannel();
    expect(component.organisationFramework).toEqual(editorConfig_question.context.framework);
    expect(component.targetFramework).toEqual(editorConfig_question.context.targetFWIds);
    expect(frameworkService.initialize).toHaveBeenCalled();
    expect(frameworkService.getTargetFrameworkCategories).toHaveBeenCalledWith(editorConfig_question.context.targetFWIds);
    expect(helperService.initialize).toHaveBeenCalledWith(editorConfig_question.context.channel);
  });

  it('Unit test for #initializeFrameworkAndChannel() negative case', () => {
    const questionEditorConfig = editorConfig_question;
    questionEditorConfig.context.framework = undefined;
    questionEditorConfig.context.targetFWIds = undefined;
    const helperService = TestBed.inject(HelperService);
    const frameworkService = TestBed.inject(FrameworkService);
    component.editorConfig = questionEditorConfig;
    spyOn(frameworkService, 'getTargetFrameworkCategories').and.callFake(() => {});
    spyOn(frameworkService, 'initialize').and.callFake(() => {});
    spyOn(helperService, 'initialize').and.callFake(() => {});
    component.initializeFrameworkAndChannel();
    expect(component.organisationFramework).toBeUndefined();
    expect(component.targetFramework).toBeUndefined();
    expect(frameworkService.initialize).not.toHaveBeenCalled();
    expect(frameworkService.getTargetFrameworkCategories).not.toHaveBeenCalled();
    expect(helperService.initialize).toHaveBeenCalledWith('01309282781705830427');
  });

  it('Unit test for #getFrameworkDetails()', () => {
    spyOn(component, 'setPublishCheckList').and.callFake(() => {});
    component.targetFramework = '';
    spyOn(component, 'setTargetFrameworkData').and.callFake(() => {});
    spyOn(component, 'setOrgFrameworkData').and.callFake(()=> {});
    component.getFrameworkDetails(categoryDefinitionData);
    expect(component.setPublishCheckList).toHaveBeenCalled();
    expect(component.setTargetFrameworkData).toHaveBeenCalled();
    expect(component.setOrgFrameworkData).toHaveBeenCalled();
  });

  it('unit test for #setOrgFrameworkData() having channelFrameworksType same as orgFWType', () => {
    spyOn(component, 'setOrgFrameworkData').and.callThrough();
    const helperService = TestBed.inject(HelperService);
    spyOnProperty(helperService, 'channelInfo').and.returnValue(questionSetEditorConfig.context.channelData);
    const frameworkService = TestBed.inject(FrameworkService);
    frameworkService.frameworkValues = undefined;
    spyOn(component, 'setEditorForms').and.callFake(() => {});
    component.setOrgFrameworkData(categoryDefinitionData);
    expect(frameworkService.frameworkValues).toBeDefined();
    expect(component.setEditorForms).toHaveBeenCalled();
  });

  it('unit test for #setOrgFrameworkData() having channelFrameworksType not same as orgFWType', () => {
    spyOn(component, 'setOrgFrameworkData').and.callThrough();
    const helperService = TestBed.inject(HelperService);
    let channelData = {frameworks: ['NIT']}
    spyOnProperty(helperService, 'channelInfo').and.returnValue(channelData);
    const frameworkService = TestBed.inject(FrameworkService);
    let frameworkResponse = serverResponse;
    frameworkResponse.result = { Framework: [{
          name: 'NIT',
          identifier: 'nit-12',
          objectType: 'Framework',
          status: 'Live',
          type: 'nit'
      }]
    }
    spyOn(frameworkService, 'getFrameworkData').and.returnValue(of(frameworkResponse))
    spyOn(component, 'setEditorForms').and.callFake(() => {});
    component.setOrgFrameworkData(categoryDefinitionData);
    expect(component.setEditorForms).toHaveBeenCalled();
  });

  it('unit test for #setOrgFrameworkData() when orgFWIdentifiers is set', () => {
    const categoryDefResponse = {
      result: {
        objectCategoryDefinition: {
          objectMetadata: {
            schema: {properties: {'framework': {default: 'nit-12'}}}
          }
        }
      }
    };
    spyOn(component, 'setOrgFrameworkData').and.callThrough();
    const helperService = TestBed.inject(HelperService);
    let channelData = {frameworks: ['NIT']}
    spyOnProperty(helperService, 'channelInfo').and.returnValue(channelData);
    const frameworkService = TestBed.inject(FrameworkService);
    let frameworkResponse = serverResponse;
    frameworkResponse.result = { Framework: [{
          name: 'NIT',
          identifier: 'nit-12',
          objectType: 'Framework',
          status: 'Live',
          type: 'nit'
      }]
    }
    spyOn(frameworkService, 'getFrameworkData').and.returnValue(of(frameworkResponse))
    spyOn(component, 'setEditorForms').and.callFake(() => {});
    component.setOrgFrameworkData(categoryDefResponse);
    expect(component.setEditorForms).toHaveBeenCalled();
  });

  it('unit test for #setTargetFrameworkData() having channelFrameworksType same as targetFWType', () => {
    const categoryDefResponse = {
      result: {
        objectCategoryDefinition: {
          objectMetadata: {
            config: {
              frameworkMetadata: {
                targetFWType: ['TPD']
            }}
          }
        }
      }
    };
    spyOn(component, 'setTargetFrameworkData').and.callThrough();
    const helperService = TestBed.inject(HelperService);
    let channelData = questionSetEditorConfig.context.channelData;
    channelData.frameworks = [{
      name: 'nit_tpd',
      relation: 'hasSequenceMember',
      identifier: 'nit_tpd',
      description: 'nit_tpd Framework',
      objectType: 'Framework',
      status: 'Live',
      type: 'TPD'
    }];
    spyOnProperty(helperService, 'channelInfo').and.returnValue(channelData);
    const treeService= TestBed.inject(TreeService);
    spyOn(treeService, 'updateMetaDataProperty').and.callFake(() => {});
    const frameworkService = TestBed.inject(FrameworkService);
    spyOn(frameworkService, 'getTargetFrameworkCategories').and.callFake(() => {});
    component.setTargetFrameworkData(categoryDefResponse);
    expect(treeService.updateMetaDataProperty).toHaveBeenCalled();
    expect(frameworkService.getTargetFrameworkCategories).toHaveBeenCalled();
  });

  it('unit test for #setTargetFrameworkData() having channelFrameworksType not same as targetFWType', () => {
    const categoryDefResponse = {
      result: {
        objectCategoryDefinition: {
          objectMetadata: {
            config: {
              frameworkMetadata: {
                targetFWType: ['TPD', 'NCERT']
            }}
          }
        }
      }
    };
    spyOn(component, 'setTargetFrameworkData').and.callThrough();
    const helperService = TestBed.inject(HelperService);
    let channelData = questionSetEditorConfig.context.channelData;
    channelData.frameworks = [{
      name: 'nit_tpd',
      relation: 'hasSequenceMember',
      identifier: 'nit_tpd',
      description: 'nit_tpd Framework',
      objectType: 'Framework',
      status: 'Live',
      type: 'TPD'
    }];
    spyOnProperty(helperService, 'channelInfo').and.returnValue(channelData);
    const treeService= TestBed.inject(TreeService);
    spyOn(treeService, 'updateMetaDataProperty').and.callFake(() => {});
    const frameworkService = TestBed.inject(FrameworkService);
    let frameworkResponse = serverResponse;
    frameworkResponse.result = { Framework: [{
      name: 'CBSE',
      identifier: 'ncert-k12',
      objectType: 'Framework',
      status: 'Live',
      type: 'NCERT'
      }]
    }
    spyOn(frameworkService, 'getFrameworkData').and.returnValue(of(frameworkResponse))
    spyOn(frameworkService, 'getTargetFrameworkCategories').and.callFake(() => {});
    component.setTargetFrameworkData(categoryDefResponse);
    expect(treeService.updateMetaDataProperty).toHaveBeenCalled();
    expect(frameworkService.getTargetFrameworkCategories).toHaveBeenCalled();
  });

  it('unit test for #setTargetFrameworkData() when targetFWIdentifiers is set', () => {
    const categoryDefResponse = {
      result: {
        objectCategoryDefinition: {
          objectMetadata: {
            schema: {properties: {'targetFWIds': {default: 'nit-12'}}}
          }
        }
      }
    };
    spyOn(component, 'setTargetFrameworkData').and.callThrough();
    const helperService = TestBed.inject(HelperService);
    let channelData = {frameworks: ['NIT']}
    spyOnProperty(helperService, 'channelInfo').and.returnValue(channelData);
    const treeService= TestBed.inject(TreeService);
    spyOn(treeService, 'updateMetaDataProperty').and.callFake(() => {});
    const frameworkService = TestBed.inject(FrameworkService);
    let frameworkResponse = serverResponse;
    frameworkResponse.result = { Framework: [{
          name: 'NIT',
          identifier: 'nit-12',
          objectType: 'Framework',
          status: 'Live',
          type: 'nit'
      }]
    }
    spyOn(frameworkService, 'getFrameworkData').and.returnValue(of(frameworkResponse));
    spyOn(frameworkService, 'getTargetFrameworkCategories').and.callFake(() => {});
    spyOn(component, 'setEditorForms').and.callFake(() => {});
    component.setTargetFrameworkData(categoryDefResponse);
    expect(treeService.updateMetaDataProperty).toHaveBeenCalled();
    expect(frameworkService.getTargetFrameworkCategories).toHaveBeenCalled();
  });

  it('Unit test for #setPublishCheckList()', () => {
    component.publishchecklist = undefined;
    spyOn(component, 'setPublishCheckList').and.callThrough();
    component.setPublishCheckList(categoryDefinitionPublishCheckList);
    expect(component.publishchecklist).toBeDefined();

  })

  it('#setEditorForms() should set variable values for questionset', () => {
    component.objectType = 'questionset';
    spyOn(component, 'setEditorForms').and.callThrough();
    component.setEditorForms(categoryDefinition);
    expect(component.setEditorForms).toHaveBeenCalled();
    expect(component.unitFormConfig).toBeDefined();
    expect(component.rootFormConfig).toBeDefined();
    expect(component.leafFormConfig).toBeDefined();
    expect(component.relationFormConfig).toBeDefined();
  });

  it('#setEditorForms() should set variable values for course', () => {
    component.objectType = 'course';
    spyOn(component, 'setEditorForms').and.callThrough();
    component.setEditorForms(categoryDefinition);
    expect(component.setEditorForms).toHaveBeenCalled();
    expect(component.unitFormConfig).toBeDefined();
    expect(component.rootFormConfig).toBeDefined();
    expect(component.leafFormConfig).toBeDefined();
    expect(component.relationFormConfig).toBeDefined();
  });

  it('#setEditorForms() should set variable values for observation', () => {
    const objectCategoryDefinition = categoryDefinition;
    objectCategoryDefinition.result.objectCategoryDefinition.forms.create.properties = [
      {
        name: 'Basic details',
        fields: observationAndRubericsField
      }
    ];
    component.objectType = 'observation';
    spyOn(component, 'setEditorForms').and.callThrough();
    component.setEditorForms(objectCategoryDefinition);
    expect(component.setEditorForms).toHaveBeenCalled();
    expect(component.unitFormConfig).toBeDefined();
    expect(component.rootFormConfig).toBeDefined();
    expect(component.leafFormConfig).toBeDefined();
    expect(component.relationFormConfig).toBeDefined();
  });

  it('#ngAfterViewInit() should call #impression()', () => {
    const telemetryService = TestBed.inject(EditorTelemetryService);
    telemetryService.telemetryPageId = 'questionset_editor';
    spyOn(telemetryService, 'impression').and.callFake(() => { });
    spyOn(component, 'ngAfterViewInit').and.callThrough();
    component.ngAfterViewInit();
    expect(telemetryService.impression).toHaveBeenCalled();
  });

  it('#mergeCollectionExternalProperties() should call fetchCollectionHierarchy for objectType questionset', () => {
    component.objectType = 'questionset';
    component.collectionId = 'do_113528954932387840149';
    const editorService = TestBed.inject(EditorService);
    component.editorConfig = editorConfig;
    spyOn(component, 'mergeCollectionExternalProperties').and.callThrough();
    spyOn(editorService, 'fetchCollectionHierarchy').and.returnValue(of(questionsetHierarchyRead));
    spyOn(editorService, 'readQuestionSet').and.returnValue(of(questionsetRead));
    spyOn(component, 'showCommentAddedAgainstContent').and.callFake(() => { return false });
    component.mergeCollectionExternalProperties();
    expect(editorService.fetchCollectionHierarchy).toHaveBeenCalled();
    expect(editorService.readQuestionSet).toHaveBeenCalled();
    expect(component.collectionTreeNodes).toBeDefined();
  });

  it('#mergeCollectionExternalProperties() should call fetchCollectionHierarchy for objectType collection', () => {
    component.objectType = 'collection';
    const editorService = TestBed.inject(EditorService);
    component.editorConfig = editorConfig;
    spyOn(component, 'mergeCollectionExternalProperties').and.callThrough();
    spyOn(editorService, 'fetchCollectionHierarchy').and.returnValue(of(hierarchyResponse));
    spyOn(editorService, 'readQuestionSet').and.returnValue(of(serverResponse));
    spyOn(component, 'showCommentAddedAgainstContent').and.callFake(() => { return false });
    component.mergeCollectionExternalProperties();
    expect(editorService.fetchCollectionHierarchy).toHaveBeenCalled();
    expect(editorService.readQuestionSet).not.toHaveBeenCalled();
  });

  it('#sethierarchyConfig() should set #ishierarchyConfigSet', () => {
    component.editorConfig = editorConfig;
    spyOn(component, 'sethierarchyConfig').and.callThrough();
    spyOn(component, 'getHierarchyChildrenConfig').and.callFake(() => {});
    component.sethierarchyConfig(categoryDefinitionData);
    expect(component.getHierarchyChildrenConfig).toHaveBeenCalled();
  });

  it('#toolbarEventListener() should call #saveContent() if event is saveContent', () => {
  spyOn(component, 'saveContent').and.callFake(() => {
    return Promise.resolve();
  });
  const event = {
    button: 'saveContent'
  };
  component.toolbarEventListener(event);
  expect(component.saveContent).toHaveBeenCalled();
  });

  it('#toolbarEventListener() should call #previewContent() if event is previewContent', () => {
    spyOn(component, 'previewContent').and.callFake(() => { });
    const event = {
      button: 'previewContent'
    };
    component.toolbarEventListener(event);
    expect(component.previewContent).toHaveBeenCalled();
  });

  it('#toolbarEventListener() should call #showQuestionLibraryComponentPage() if event is showQuestionLibraryPage', () => {
    spyOn(component, 'showQuestionLibraryComponentPage').and.callFake(() => { });
    const event = {
      button: 'showQuestionLibraryPage'
    };
    component.toolbarEventListener(event);
    expect(component.showQuestionLibraryComponentPage).toHaveBeenCalled();
  });

  it('#toolbarEventListener() should call #submitHandler() if event is submitContent', () => {
    spyOn(component, 'submitHandler').and.callFake(() => { });
    const event = {
      button: 'submitContent'
    };
    component.toolbarEventListener(event);
    expect(component.submitHandler).toHaveBeenCalled();
  });

  it('#toolbarEventListener() should set #showDeleteConfirmationPopUp to true if event is removeContent', () => {
    const event = {
      button: 'removeContent'
    };
    component.showDeleteConfirmationPopUp = false;
    component.toolbarEventListener(event);
    expect(component.showDeleteConfirmationPopUp).toBeTruthy();
  });

  it('#toolbarEventListener() should call #redirectToQuestionTab() if event is editContent', () => {
    spyOn(component, 'redirectToQuestionTab').and.callFake(() => { });
    const event = { button: 'editContent' };
    component.toolbarEventListener(event);
    expect(component.redirectToQuestionTab).toHaveBeenCalled();
  });


  it('#toolbarEventListener() should call #rejectContent() if event is rejectContent', () => {
    spyOn(component, 'rejectContent').and.callFake(() => { return false });
    const event = {
      button: 'rejectContent',
      comment: 'abcd'
    };
    component.toolbarEventListener(event);
    expect(component.rejectContent).toHaveBeenCalledWith(event.comment);
  });

  it('#toolbarEventListener() should call #publishContent() if event is publishContent', () => {
    spyOn(component, 'publishContent').and.callFake(() => { return false });
    const event = {
      button: 'publishContent'
    };
    component.toolbarEventListener(event);
    expect(component.publishContent).toHaveBeenCalled();
  });

  it('#toolbarEventListener() should set formStatusMapper', () => {
    const treeService = TestBed.inject(TreeService);
    spyOn(treeService, 'getActiveNode').and.returnValue({ data: { id: '12345' } });
    const event = {
      button: 'onFormStatusChange',
      event: { isValid: true }
    };
    component.toolbarEventListener(event);
    // tslint:disable-next-line:no-string-literal
    expect(component['formStatusMapper']['12345']).toEqual(true);
  });

  it('#toolbarEventListener() should not set formStatusMapper', () => {
    const treeService = TestBed.inject(TreeService);
    spyOn(treeService, 'getActiveNode').and.returnValue(undefined);
    const event = {
      button: 'onFormStatusChange',
      event: { isValid: true }
    };
    // tslint:disable-next-line:no-string-literal
    component['formStatusMapper'] = undefined;
    component.toolbarEventListener(event);
    // tslint:disable-next-line:no-string-literal
    expect(component['formStatusMapper']).toBeUndefined();
  });

  it('#toolbarEventListener() should call #updateToolbarTitle() if event is onFormValueChange', () => {
    spyOn(component, 'updateToolbarTitle').and.callFake(() => { });
    spyOn(component, 'toolbarEventListener').and.callThrough();
    const event = {
      button: 'onFormValueChange'
    };
    component.toolbarEventListener(event);
    expect(component.toolbarEventListener).toHaveBeenCalledWith(event);
    expect(component.updateToolbarTitle).toHaveBeenCalled();
  });

  it('#toolbarEventListener() should call #redirectToChapterListTab() if event is backContent', () => {
    spyOn(component, 'redirectToChapterListTab').and.callFake(() => { });
    const event = {
      button: 'backContent'
    };
    component.toolbarEventListener(event);
    expect(component.redirectToChapterListTab).toHaveBeenCalled();
  });

  it('#toolbarEventListener() should call #redirectToChapterListTab() if event is sendForCorrections', () => {
    spyOn(component, 'redirectToChapterListTab').and.callFake(() => { });
    const event = {
      button: 'sendForCorrections',
      comment: 'test'
    };
    component.toolbarEventListener(event);
    expect(component.redirectToChapterListTab).toHaveBeenCalled();
  });

  it('#toolbarEventListener() should call #sourcingApproveContent() if event is sourcingApprove', () => {
    spyOn(component, 'sourcingApproveContent').and.callFake(() => { return false });
    const event = {
      button: 'sourcingApprove',
      comment: 'test'
    };
    component.toolbarEventListener(event);
    expect(component.sourcingApproveContent).toHaveBeenCalled();
  });

  it('#toolbarEventListener() should call #redirectToChapterListTab() if event is sourcingReject', () => {
    const editorService = TestBed.inject(EditorService);
    const event = {
      button: 'sourcingReject',
      comment: 'test',
    };
    spyOn(component, 'sourcingRejectContent').and.callFake(() => {return false});
    component.editorConfig = editorConfig;
    component.toolbarEventListener(event);
    expect(component.sourcingRejectContent).toHaveBeenCalledWith({ comment: 'test' });
  });

  it('#toolbarEventListener() should set showReviewModal to true ', () => {
    spyOn(component, 'toolbarEventListener').and.callThrough();
    component.showReviewModal = false;
    const event = {
      button: 'showReviewcomments'
    };
    component.toolbarEventListener(event);
    expect(component.showReviewModal).toEqual(true);
  });

  it('#toolbarEventListener() should set showReviewModal to false ', () => {
    spyOn(component, 'toolbarEventListener').and.callThrough();
    component.showReviewModal = true;
    const event = {
      button: 'showReviewcomments'
    };
    component.toolbarEventListener(event);
    expect(component.showReviewModal).toEqual(false);
  });

  it('#toolbarEventListener() should set showReviewModal to true ', () => {
    spyOn(component, 'toolbarEventListener').and.callThrough();
    // tslint:disable-next-line:no-string-literal
    component['editorConfig'] = editorConfig;
    component.contentComment = 'change description';
    component.showReviewModal = false;
    const event = {
      button: 'showReviewcomments'
    };
    component.toolbarEventListener(event);
    expect(component.contentComment).toEqual('change description');
    expect(component.showReviewModal).toEqual(true);
  });

  it('#toolbarEventListener() should set showReviewModal to false ', () => {
    spyOn(component, 'toolbarEventListener').and.callThrough();
    // tslint:disable-next-line:no-string-literal
    component['editorConfig'] = undefined;
    component.showReviewModal = true;
    const event = {
      button: 'showReviewcomments'
    };
    component.toolbarEventListener(event);
    expect(component.contentComment).toBeUndefined();
    expect(component.showReviewModal).toEqual(false);
  });

  it('#toolbarEventListener() should call redirectToQuestionTab for the case reviewContent', () => {
    spyOn(component, 'toolbarEventListener').and.callThrough();
    spyOn(component, 'redirectToQuestionTab').and.callFake(() => {});
    const event = {
      button: 'reviewContent'
    };
    component.toolbarEventListener(event);
    expect(component.redirectToQuestionTab).toHaveBeenCalled();
  });

  it('#toolbarEventListener() should set pagination ', () => {
    spyOn(component, 'toolbarEventListener').and.callThrough();
    const event = {
      button: 'pagination'
    };
    component.pageId = 'pagination';
    component.toolbarEventListener(event);
    expect(component.pageId).toEqual('pagination');
  });

  it('#redirectToChapterListTab() should emit #editorEmitter event', () => {
    component.actionType = 'dummyCase';
    component.collectionId = 'do_12345';
    spyOn(component.editorEmitter, 'emit');
    component.redirectToChapterListTab({ data: 'dummyData' });
    expect(component.editorEmitter.emit).toHaveBeenCalledWith({
      close: true, library: 'questionset_editor', action: 'dummyCase', identifier: 'do_12345',
      data: 'dummyData'
    });
  });

  it('#redirectToChapterListTab() should emit #editorEmitter event', () => {
    component.actionType = 'dummyCase';
    component.collectionId = 'do_12345';
    spyOn(component.editorEmitter, 'emit');
    component.redirectToChapterListTab();
    expect(component.editorEmitter.emit).toHaveBeenCalledWith({
      close: true, library: 'questionset_editor', action: 'dummyCase', identifier: 'do_12345'
    });
  });

  it('#updateToolbarTitle() should call #getActiveNode() method and set title name as test', () => {
    const treeService = TestBed.inject(TreeService);
    component.toolbarConfig = { title: '' };
    spyOn(treeService, 'getActiveNode').and.callFake(() => {
      return { data: { root: true } };
    });
    component.updateToolbarTitle({ data: { name: 'test' } });
    expect(treeService.getActiveNode).toHaveBeenCalled();
    expect(component.toolbarConfig.title).toEqual('test');
  });

  it('#updateToolbarTitle() should call #getActiveNode() method and set title name as Untitled', () => {
    const treeService = TestBed.inject(TreeService);
    component.toolbarConfig = { title: '' };
    spyOn(treeService, 'getActiveNode').and.callFake(() => {
      return { data: { root: true } };
    });
    component.updateToolbarTitle({ event: { name: '' } });
    expect(treeService.getActiveNode).toHaveBeenCalled();
    expect(component.toolbarConfig.title).toEqual('Untitled');
  });

  it('#showQuestionLibraryComponentPage() should set #addQuestionFromLibraryButtonLoader to false and call #saveContent()',
  () => {
    const editorService = TestBed.inject(EditorService);
    const treeService = TestBed.inject(TreeService);
    editorService.templateList = ['Subjective Question'];
    component.collectionId = 'do_12345';
    component.organisationFramework = 'nit_k12';
    component.editorConfig = editorConfig_question;
    component.questionlibraryInput.searchFormConfig = categoryDefinition.result.objectCategoryDefinition.forms.searchConfig;
    component.questionComponentInput.metadataFormConfig = categoryDefinition.result.objectCategoryDefinition.forms.childMetadata;
    spyOn(treeService, 'getActiveNode').and.returnValue({data: {metadata: {}}});
    spyOn(editorService, 'getContentChildrens').and.returnValue([{}, {}]);
    spyOn(editorService, 'checkIfContentsCanbeAdded').and.returnValue(true);
    spyOn(component, 'saveContent').and.callFake(() => {
      return Promise.resolve('success');
    });
    spyOn(component, 'showQuestionLibraryComponentPage').and.callThrough();
    component.showQuestionLibraryComponentPage();
    component.saveContent().then(response => {
      expect(treeService.getActiveNode).toHaveBeenCalled();
      expect(component.buttonLoaders.addQuestionFromLibraryButtonLoader).toBeFalsy();
      expect(component.questionlibraryInput).toBeDefined();
      expect(component.pageId).toEqual('question_library');
    });
  });

  it('#showQuestionLibraryComponentPage should not call saveContent', () => {
    const editorService = TestBed.inject(EditorService);
    spyOn(editorService, 'checkIfContentsCanbeAdded').and.returnValue(false);
    spyOn(component, 'saveContent');
    component.showQuestionLibraryComponentPage();
    expect(component.saveContent).not.toHaveBeenCalled();
  });

  it('#libraryEventListener() should set pageId to questionset_editor', async () => {
    const res = {};
    spyOn(component, 'mergeCollectionExternalProperties').and.returnValue(of(res));
    spyOn(component, 'libraryEventListener').and.callThrough();
    component.libraryEventListener({});
    expect(component.pageId).toEqual('questionset_editor');
  });

  it('#onQuestionLibraryChange() should call #addResourceToQuestionset()', () => {
    spyOn(component, 'addResourceToQuestionset').and.callFake(() => {});
    spyOn(component, 'onQuestionLibraryChange').and.callThrough();
    component.onQuestionLibraryChange(
      {action: 'addBulk',
      collectionIds: 'do_12345',
      resourceType: 'Question'
    });
    expect(component.addResourceToQuestionset).toHaveBeenCalled();
  });

  it('#onQuestionLibraryChange() should call #libraryEventListener()', () => {
    spyOn(component, 'libraryEventListener').and.callFake(() => {});
    spyOn(component, 'onQuestionLibraryChange').and.callThrough();
    component.onQuestionLibraryChange({action: 'back'});
    expect(component.libraryEventListener).toHaveBeenCalled();
  });

  it('#addResourceToQuestionset() should call #libraryEventListener()', () => {
    const treeService = TestBed.inject(TreeService);
    const editorService = TestBed.inject(EditorService);
    spyOn(treeService, 'getActiveNode').and.returnValue({data: {id: 'do_123456'}});
    spyOn(editorService, 'addResourceToQuestionset').and.returnValue(of(serverResponse));
    spyOn(component, 'libraryEventListener').and.callFake(() => {});
    spyOn(component, 'addResourceToQuestionset').and.callThrough();
    component.addResourceToQuestionset('do_12345', 'Question');
    expect(component.libraryEventListener).toHaveBeenCalled();
  });

  it('#addResourceToQuestionset() should call editorService.apiErrorHandling()', () => {
    const treeService = TestBed.inject(TreeService);
    const editorService = TestBed.inject(EditorService);
    spyOn(treeService, 'getActiveNode').and.returnValue({data: {id: 'do_123456'}});
    spyOn(editorService, 'apiErrorHandling').and.callFake(() => {});
    spyOn(editorService, 'addResourceToQuestionset').and.returnValue(throwError('error'));
    spyOn(component, 'addResourceToQuestionset').and.callThrough();
    component.addResourceToQuestionset('do_12345', 'Question');
    expect(editorService.apiErrorHandling).toHaveBeenCalled();
  });

  it('#saveContent() should call #validateFormStatus()', () => {
    component.objectType = 'questionset';
    const editorService = TestBed.inject(EditorService);
    const treeService = TestBed.inject(TreeService);
    spyOn(editorService, 'getCollectionHierarchy').and.returnValue({nodesModified: nodesModifiedData, hierarchy: {}});
    spyOn(editorService, 'getMaxScore').and.callFake(() => { return Promise.resolve(5)});
    spyOn(treeService, 'updateMetaDataProperty').and.callFake(() => {});
    spyOn(component, 'validateFormStatus').and.callFake(() => { return true });
    spyOn(editorService, 'updateHierarchy').and.returnValue(of(serverResponse));
    spyOn(component, 'saveContent').and.callThrough();
    component.saveContent();
    expect(component.validateFormStatus).toHaveBeenCalled();
  });

  it('#submitHandler() should call #validateFormStatus()', () => {
    spyOn(component, 'validateFormStatus');
    component.submitHandler();
    expect(component.validateFormStatus).toHaveBeenCalled();
  });

  it('#submitHandler() should return true', () => {
    spyOn(component, 'validateFormStatus').and.callFake(() => {
      return true;
    });
    component.submitHandler();
    expect(component.showConfirmPopup).toEqual(true);
  });

  it('#validateFormStatus() should return true', () => {
    const result = component.validateFormStatus();
    expect(result).toEqual(true);
  });

  it('#previewContent() should call #saveContent()', () => {
    spyOn(component, 'saveContent').and.callFake(() => {
      return Promise.resolve();
    });
    component.previewContent();
    expect(component.saveContent).toHaveBeenCalled();
    expect(component.buttonLoaders.previewButtonLoader).toBeTruthy();
  });

  it('#sendForReview() should call #saveContent()', () => {
    spyOn(component, 'saveContent').and.callFake(() => {
      return Promise.resolve();
    });
    component.sendForReview();
    expect(component.saveContent).toHaveBeenCalled();
  });

  it('#rejectContent() should call #submitRequestChanges() and #redirectToChapterListTab()', async () => {
    component.collectionId = 'do_1234';
    const editorService = TestBed.inject(EditorService);
    spyOn(editorService, 'submitRequestChanges').and.returnValue(of(serverResponse));
    spyOn(component, 'redirectToChapterListTab');
    component.editorConfig = editorConfig;
    component.rejectContent('test');
    expect(editorService.submitRequestChanges).toHaveBeenCalled();
    expect(component.redirectToChapterListTab).toHaveBeenCalled();
  });

  it('#rejectContent() should call #submitRequestChanges() and #redirectToChapterListTab() api error', async () => {
    component.collectionId = 'do_1234';
    const editorService = TestBed.inject(EditorService);
    spyOn(editorService, 'submitRequestChanges').and.returnValue(throwError({}));
    component.editorConfig = editorConfig;
    component.rejectContent('test');
    expect(editorService.submitRequestChanges).toHaveBeenCalled();
  });

  it('#publishContent should call #publishContent() and #redirectToChapterListTab()', () => {
    const editorService = TestBed.inject(EditorService);
    spyOn(editorService, 'publishContent').and.returnValue(of(serverResponse));
    spyOn(component, 'redirectToChapterListTab').and.callFake(() => {});
    component.editorConfig = editorConfig;
    component.publishchecklist = [];
    component.publishContent({});
    expect(editorService.publishContent).toHaveBeenCalled();
    expect(component.redirectToChapterListTab).toHaveBeenCalled();
  });

  it('#publishContent should call #publishContent() and #redirectToChapterListTab() api error', () => {
    const editorService = TestBed.inject(EditorService);
    spyOn(editorService, 'publishContent').and.returnValue(throwError({}));
    spyOn(component, 'redirectToChapterListTab');
    component.editorConfig = editorConfig;
    component.publishchecklist = [];
    component.publishContent({});
    expect(editorService.publishContent).toHaveBeenCalled();
    expect(component.redirectToChapterListTab).not.toHaveBeenCalled();
  });

  it('#sourcingApproveContent() should call #redirectToChapterListTab() if event is sourcingApprove', () => {
    const editorService = TestBed.inject(EditorService);
    spyOn(component, 'redirectToChapterListTab').and.callFake(() => {});
    spyOn(component, 'validateFormStatus').and.returnValue(true);
    spyOn(editorService, 'updateCollection').and.returnValue(of(serverResponse));
    spyOn(component, 'sourcingApproveContent').and.callThrough();
    component.editorConfig = editorConfig;
    component.sourcingApproveContent([]);
    expect(component.redirectToChapterListTab).toHaveBeenCalled();
  });

  it('#sourcingApproveContent() should not call #redirectToChapterListTab() and call toasterService.error case1', () => {
    component.editorMode = 'sourcingreview';
    component.editorConfig = editorConfig;
    component.publishchecklist = {data: {}};
    const editorService = TestBed.inject(EditorService);
    spyOn(toasterService, 'error').and.callFake(() => {});
    spyOn(component, 'redirectToChapterListTab').and.callFake(() => {});
    spyOn(component, 'validateFormStatus').and.returnValue(true);
    spyOn(editorService, 'updateCollection').and.returnValue(throwError('error'));
    spyOn(component, 'sourcingApproveContent').and.callThrough();
    component.sourcingApproveContent([]);
    expect(toasterService.error).toHaveBeenCalled();
    expect(component.redirectToChapterListTab).not.toHaveBeenCalled();
  });

  it('#sourcingApproveContent() should not call #redirectToChapterListTab() and call toasterService.error case2', () => {
    component.editorMode = 'sourcingreview';
    component.editorConfig = editorConfig;
    component.publishchecklist = {data: {}};
    const editorService = TestBed.inject(EditorService);
    spyOn(toasterService, 'error').and.callFake(() => {});
    spyOn(component, 'validateFormStatus').and.returnValue(false);
    spyOn(component, 'sourcingApproveContent').and.callThrough();
    component.sourcingApproveContent([]);
    expect(toasterService.error).toHaveBeenCalled();
  });

  it('#sourcingApproveContent() should call #redirectToChapterListTab() and not call toasterService.error', () => {
    component.editorMode = 'review';
    component.editorConfig = editorConfig;
    component.publishchecklist = {data: {}};
    const editorService = TestBed.inject(EditorService);
    spyOn(toasterService, 'error').and.callFake(() => {});
    spyOn(component, 'redirectToChapterListTab').and.callFake(() => {});
    component.sourcingApproveContent([]);
    expect(toasterService.error).not.toHaveBeenCalled();
    expect(component.redirectToChapterListTab).toHaveBeenCalled();
  });


  it('#sourcingRejectContent() should call #redirectToChapterListTab() if event is sourcingApprove', () => {
    const editorService = TestBed.inject(EditorService);
    spyOn(component, 'redirectToChapterListTab').and.callFake(() => {});
    spyOn(component, 'validateFormStatus').and.returnValue(true);
    spyOn(editorService, 'updateCollection').and.returnValue(of(serverResponse));
    spyOn(component, 'sourcingRejectContent').and.callThrough();
    component.editorConfig = editorConfig;
    component.sourcingRejectContent([]);
    expect(component.redirectToChapterListTab).toHaveBeenCalled();
  });

  it('#sourcingRejectContent() should not call #redirectToChapterListTab() and call toasterService.error case1', () => {
    component.editorMode = 'sourcingreview';
    component.editorConfig = editorConfig;
    component.editorConfig.config.editableFields = {
      sourcingreview: ['instructions']
    };
    component.publishchecklist = {data: {}};
    const editorService = TestBed.inject(EditorService);
    spyOn(toasterService, 'error').and.callFake(() => {});
    spyOn(component, 'redirectToChapterListTab').and.callFake(() => {});
    spyOn(component, 'validateFormStatus').and.returnValue(true);
    spyOn(editorService, 'updateCollection').and.returnValue(throwError('error'));
    spyOn(component, 'sourcingRejectContent').and.callThrough();
    component.sourcingRejectContent([]);
    expect(toasterService.error).toHaveBeenCalled();
    expect(component.redirectToChapterListTab).not.toHaveBeenCalled();
  });

  it('#sourcingRejectContent() should not call #redirectToChapterListTab() and call toasterService.error case2', () => {
    component.editorMode = 'sourcingreview';
    component.editorConfig = editorConfig;
    component.publishchecklist = {data: {}};
    const editorService = TestBed.inject(EditorService);
    spyOn(toasterService, 'error').and.callFake(() => {});
    spyOn(component, 'validateFormStatus').and.returnValue(false);
    spyOn(component, 'sourcingRejectContent').and.callThrough();
    component.sourcingRejectContent([]);
    expect(toasterService.error).toHaveBeenCalled();
  });

  it('#sourcingRejectContent() should call #redirectToChapterListTab() and not call toasterService.error', () => {
    component.editorMode = 'review';
    component.editorConfig = editorConfig;
    component.publishchecklist = {data: {}};
    const editorService = TestBed.inject(EditorService);
    spyOn(toasterService, 'error').and.callFake(() => {});
    spyOn(component, 'redirectToChapterListTab').and.callFake(() => {});
    component.sourcingRejectContent([]);
    expect(toasterService.error).not.toHaveBeenCalled();
    expect(component.redirectToChapterListTab).toHaveBeenCalled();
  });

  it('#setUpdatedTreeNodeData() should call updateTreeNodeData() when success', () => {
    component.buttonLoaders.previewButtonLoader = true;
    component.showPreview = false;
    const editorService = TestBed.inject(EditorService);
    spyOn(editorService, 'fetchCollectionHierarchy').and.returnValue(of(questionsetHierarchyRead));
    component.collectionTreeNodes = undefined;
    spyOn(component, 'setUpdatedTreeNodeData').and.callThrough();
    spyOn(component, 'updateTreeNodeData').and.callFake(() => {});
    component.setUpdatedTreeNodeData();
    expect(editorService.fetchCollectionHierarchy).toHaveBeenCalled();
    expect(component.updateTreeNodeData).toHaveBeenCalled();
    expect(component.buttonLoaders.previewButtonLoader).toBeFalsy();
    expect(component.showPreview).toBeTruthy();
  });

  it('#setUpdatedTreeNodeData() should not call updateTreeNodeData() when error', () => {
    component.buttonLoaders.previewButtonLoader = true;
    const editorService = TestBed.inject(EditorService);
    spyOn(toasterService, 'error').and.callFake(() => {});
    spyOn(editorService, 'fetchCollectionHierarchy').and.returnValue(throwError('error'));
    spyOn(component, 'setUpdatedTreeNodeData').and.callThrough();
    spyOn(component, 'updateTreeNodeData').and.callFake(() => {});
    component.setUpdatedTreeNodeData();
    expect(editorService.fetchCollectionHierarchy).toHaveBeenCalled();
    expect(component.updateTreeNodeData).not.toHaveBeenCalled();
    expect(toasterService.error).toHaveBeenCalled();
    expect(component.buttonLoaders.previewButtonLoader).toBeFalsy();
  });

  it('#updateTreeNodeData() should call treeService.getFirstChild()', () => {
    component.collectionTreeNodes = {data: undefined};
    const helperService = TestBed.inject(HelperService);
    spyOn(helperService, 'hmsToSeconds').and.returnValue('300');
    const treeNodeMockData = treeNodeData;
    // tslint:disable-next-line:no-string-literal
    treeNodeMockData.data.metadata['timeLimits'] = {
      questionSet: {
        min: 0,
        max: 300
      }
    };
    // tslint:disable-next-line:no-string-literal
    treeNodeMockData.data.metadata['maxTime'] = '00:05';
    const treeService = TestBed.inject(TreeService);
    spyOn(treeService, 'getFirstChild').and.returnValue(treeNodeData);
    spyOn(component, 'updateTreeNodeData').and.callThrough();
    component.updateTreeNodeData();
    expect(treeService.getFirstChild).toHaveBeenCalled();
    expect(component.collectionTreeNodes.data).toBeDefined();
  });

  it('#treeEventListener() should call #updateTreeNodeData()', () => {
    const event = { type: 'test' };
    spyOn(component, 'updateTreeNodeData').and.callFake(() => { });
    component.treeEventListener(event);
    expect(component.updateTreeNodeData).toHaveBeenCalled();
  });

  it('#treeEventListener() should call #updateSubmitBtnVisibility() if event type is nodeSelect', () => {
    const event = {
      type: 'nodeSelect',
      data: {
        getLevel() {
          return 2;
        }
      }
    };
    const treeService: any = TestBed.inject(TreeService);
    treeService.nativeElement = nativeElement;
    spyOn(treeService, 'setTreeElement').and.callFake((el) => {
      treeService.nativeElement = nativeElement;
    });
    spyOn(treeService, 'getFirstChild').and.callFake(() => {
      return { data: { metadata: treeData } };
    });
    component.collectionTreeNodes = { data: {} };
    spyOn(component, 'updateSubmitBtnVisibility').and.callFake(() => { });
    spyOn(component, 'setTemplateList').and.callFake(() => { });
    spyOn(component, 'updateTreeNodeData').and.callFake(() => { });
    component.treeEventListener(event);
    expect(component.updateSubmitBtnVisibility).toHaveBeenCalled();
    expect(component.setTemplateList).toHaveBeenCalled();
  });

  it('#treeEventListener() should set #showDeleteConfirmationPopUp=true if event.type is deleteNode', () => {
    const event = {
      type: 'deleteNode',
      data: {
        getLevel() {
          return 2;
        }
      }
    };
    component.editorConfig = editorConfig;
    spyOn(component, 'updateTreeNodeData').and.callFake(() => {
      return true;
    });
    component.treeEventListener(event);
    expect(component.showDeleteConfirmationPopUp).toEqual(true);
  });

  it('#treeEventListener() should call saveContent', () => {
    const event = {
      type: 'createNewContent'
    };
    component.buttonLoaders.addFromLibraryButtonLoader = false;
    spyOn(component, 'updateTreeNodeData').and.callFake(() => { });
    const editorService = TestBed.inject(EditorService);
    spyOn(editorService, 'checkIfContentsCanbeAdded').and.returnValue(true);
    spyOn(component, 'saveContent').and.callFake(() => {
      return Promise.resolve();
    });
    component.treeEventListener(event);
    expect(component.saveContent).toHaveBeenCalled();
    expect(component.buttonLoaders.addFromLibraryButtonLoader).toBeTruthy();
    expect(component.showQuestionTemplatePopup).toBeFalsy();
  });

  it('#setTemplateList() should set children for rootNode', () => {
    component.templateList = undefined;
    component.editorConfig = questionSetEditorConfig;
    component.isCurrentNodeRoot = true;
    spyOn(component, 'setTemplateList').and.callThrough();
    component.setTemplateList();
    expect(component.templateList).toEqual([]);
  });

  it('#setTemplateList() should set children for level1', () => {
    // tslint:disable-next-line:no-string-literal
    component['editorService']['_editorConfig'] = questionSetEditorConfig;
    component.selectedNodeData = {
      getLevel() {return 2; }
    };
    component.templateList = undefined;
    component.editorConfig = questionSetEditorConfig;
    component.isCurrentNodeRoot = false;
    spyOn(component, 'setTemplateList').and.callThrough();
    component.setTemplateList();
    expect(component.templateList).not.toEqual([]);
  });

  it('#deleteNode() should set #showDeleteConfirmationPopUp false', () => {
    component.collectionTreeNodes = {
      data: {
        childNodes: []
      }
    };
    const treeService = TestBed.inject(TreeService);
    spyOn(treeService, 'getActiveNode').and.callFake(() => {
      return {
        data: {
          id: 'do_113264100861919232115'
        }
      };
    });
    spyOn(treeService, 'getChildren').and.callFake(() => {
      return [];
    });
    spyOn(treeService, 'removeNode').and.callFake(() => {
      return true;
    });
    spyOn(treeService, 'getFirstChild').and.callFake(() => {
      return { data: { metadata: treeData } };
    });
    spyOn(component, 'updateSubmitBtnVisibility').and.callFake(() => {});
    component.deleteNode();
    expect(treeService.removeNode).toHaveBeenCalled();
    expect(component.updateSubmitBtnVisibility).toHaveBeenCalled();
    expect(component.showDeleteConfirmationPopUp).toEqual(false);
  });

  it('#updateSubmitBtnVisibility() should set toolbarConfig.hasChildren to true', () => {
    component.toolbarConfig = { hasChildren: false };
    const treeService = TestBed.inject(TreeService);
    spyOn(treeService, 'getFirstChild').and.returnValue({children: ['Subjective']});
    spyOn(component, 'updateSubmitBtnVisibility').and.callThrough();
    component.updateSubmitBtnVisibility();
    expect(treeService.getFirstChild).toHaveBeenCalled();
    expect( component.toolbarConfig.hasChildren).toBeTruthy();
  });

  it('#updateSubmitBtnVisibility() should set toolbarConfig.hasChildren to false', () => {
    component.toolbarConfig = { hasChildren: true };
    const treeService = TestBed.inject(TreeService);
    spyOn(treeService, 'getFirstChild').and.returnValue({});
    spyOn(component, 'updateSubmitBtnVisibility').and.callThrough();
    component.updateSubmitBtnVisibility();
    expect(treeService.getFirstChild).toHaveBeenCalled();
    expect( component.toolbarConfig.hasChildren).toBeFalsy();
  });

  it('generateTelemetryEndEvent() ', () => {
    component.editorMode = 'edit';
    component.pageStartTime = '1654413557409';
    const telemetryService = TestBed.inject(EditorTelemetryService);
    telemetryService.telemetryPageId = 'questionset_editor';
    spyOn(telemetryService, 'end').and.callFake(() => {});
    spyOn(component, 'generateTelemetryEndEvent').and.callThrough();
    component.generateTelemetryEndEvent();
    expect(telemetryService.end).toHaveBeenCalled();
  });

  it('#handleTemplateSelection should return false', () => {
    const event = { type: 'close' };
    const result = component.handleTemplateSelection(event);
    expect(result).toEqual(false);
  });

  it('#handleTemplateSelection should call editorService.apiErrorHandling', () => {
    const event = 'Multiple Choice Question';
    const editorService = TestBed.inject(EditorService);
    component.editorConfig = editorConfig;
    spyOn(editorService, 'apiErrorHandling').and.callFake(() => {});
    spyOn(editorService, 'getCategoryDefinition').and.returnValue(throwError('error'));
    spyOn(component, 'handleTemplateSelection').and.callThrough();
    component.handleTemplateSelection(event);
    expect(editorService.apiErrorHandling).toHaveBeenCalled();
  });

  it('#handleTemplateSelection should call #redirectToQuestionTab() when renderTaxonomy is true', async () => {
    const event = 'Multiple Choice Question';
    const editorService = TestBed.inject(EditorService);
    component.editorConfig = editorConfig;
    component.editorConfig.config.renderTaxonomy = true;
    component.editorConfig.config.showSourcingStatus = false;
    spyOn(component, 'redirectToQuestionTab').and.callFake(() => {});
    spyOn(component, 'setLeafFormConfig').and.callFake(() => {});
    spyOn(component, 'setEnforceCorrectAnswer').and.callFake(() => {});
    spyOn(editorService, 'getCategoryDefinition').and.returnValue(of(getCategoryDefinitionResponse));
    component.handleTemplateSelection(event);
    expect(component.redirectToQuestionTab).toHaveBeenCalled();
  });

  it('#handleTemplateSelection should call #redirectToQuestionTab() when renderTaxonomy is false', async () => {
    const event = 'Multiple Choice Question';
    const editorService = TestBed.inject(EditorService);
    component.editorConfig = editorConfig;
    component.editorConfig.config.renderTaxonomy = false;
    component.editorConfig.config.showSourcingStatus = false;
    spyOn(component, 'setLeafFormConfig').and.callFake(() => {});
    spyOn(component, 'setEnforceCorrectAnswer').and.callFake(() => {});
    spyOn(component, 'redirectToQuestionTab').and.callFake(() => {});
    spyOn(editorService, 'getCategoryDefinition').and.returnValue(of(getCategoryDefinitionResponse));
    component.handleTemplateSelection(event);
    expect(component.questionComponentInput.config).toEqual({});
    expect(component.redirectToQuestionTab).toHaveBeenCalled();
  });

  it('setEnforceCorrectAnswer should set enforceCorrectAnswer', () => {
    component.sourcingSettings = undefined;
    spyOn(component, 'setEnforceCorrectAnswer').and.callThrough();
    component.setEnforceCorrectAnswer({config: {sourcingSettings: {enforceCorrectAnswer: true}}});
    expect(component.sourcingSettings.enforceCorrectAnswer).toBeTruthy();
  })

  it('setLeafFormConfig should set leafFormConfig', () => {
    component.leafFormConfig = undefined;
    const leafFormConfig = [{
      "name": "form config",
      "fields": [
          {
              "code": "evidenceMimeType",
              "dataType": "list",
              "inputType": "select",
              "range": []
          }
      ]
    }];
    spyOn(component, 'setEvidence').and.returnValue(of(null));
    spyOn(component, 'setLeafFormConfig').and.callThrough();
    component.setLeafFormConfig(leafFormConfig);
  })

  it('#redirectToQuestionTab() should set pageId as question', () => {
    component.pageId = '';
    component.editorConfig = editorConfig_question;
    component.questionComponentInput = {};
    component.selectedNodeData = SelectedNodeMockData;
    component.collectionId = 'do_113431883451195392169';
    spyOn(component, 'redirectToQuestionTab').and.callThrough();
    component.redirectToQuestionTab('edit');
    expect(component.pageId).toEqual('question');
  });

  it('#redirectToQuestionTab() should set pageId as question when objectType is questionset', () => {
    component.pageId = '';
    component.editorConfig = questionSetEditorConfig;
    component.questionComponentInput = {};
    component.selectedNodeData = SelectedNodeMockData;
    component.objectType = 'questionSet';
    component.collectionId = 'do_113431883451195392169';
    spyOn(component, 'redirectToQuestionTab').and.callThrough();
    component.redirectToQuestionTab('edit', 'choice');
    expect(component.pageId).toEqual('question');
  });

  it('#redirectToQuestionTab() should call getCategoryDefinition', () => {
    component.leafFormConfig = undefined;
    const editorService = TestBed.inject(EditorService);
    component.contentComment = 'test';
    component.pageId = '';
    component.editorConfig = questionSetEditorConfig;
    component.editorConfig.config.renderTaxonomy = true;
    component.questionComponentInput = {};
    component.selectedNodeData = SelectedNodeMockData;
    component.objectType = 'questionSet';
    component.collectionId = 'do_113431883451195392169';
    spyOn(component, 'redirectToQuestionTab').and.callThrough();
    const response = serverResponse;
    response.result = categoryDefinition.result;
    spyOn(editorService, 'getCategoryDefinition').and.returnValue(of(response));
    component.redirectToQuestionTab('edit', 'choice');
    expect(editorService.getCategoryDefinition).toHaveBeenCalled();
    expect(component.leafFormConfig).toBeDefined();
    expect(component.pageId).toEqual('question');
  });

  it('#questionEventListener() should set #pageId to questionset_editor', () => {
    component.telemetryService.telemetryPageId = '';
    component.objectType = 'questionSet';
    spyOn(component, 'mergeCollectionExternalProperties').and.returnValue(of({}));
    spyOn(component, 'treeEventListener').and.callFake(() => {});
    component.questionEventListener({type: 'createNewContent'});
    expect(component.pageId).toEqual('questionset_editor');
    expect(component.telemetryService.telemetryPageId).toEqual('questionset_editor');
  });

  it('#questionEventListener() should emit event for objectType question', () => {
    const event = { actionType: 'test', identifier: 'test' };
    component.objectType = 'question';
    const expectedParams = {close: true, library: 'questionset_editor', action: event.actionType, identifier: event.identifier};
    spyOn(component.editorEmitter, 'emit').and.callFake(() => {});
    component.questionEventListener(event);
    expect(component.editorEmitter.emit).toHaveBeenCalledWith(expectedParams);
  });

  it('#contentPolicyUrl return content policy url', () => {
    const editorService = TestBed.inject(EditorService);
    spyOnProperty(editorService, 'contentPolicyUrl').and.returnValue('/term-of-use.html');
    spyOn(component, 'contentPolicyUrl').and.callThrough();
    const policyUrl = component.contentPolicyUrl;
    expect(policyUrl).toEqual('/term-of-use.html');
  });

  it('#commonFrameworkLicenseUrl return license url', () => {
    const editorService = TestBed.inject(EditorService);
    spyOnProperty(editorService, 'commonFrameworkLicenseUrl').and.returnValue('https://creativecommons.org/licenses');
    spyOn(component, 'commonFrameworkLicenseUrl').and.callThrough();
    const licenseUrl = component.commonFrameworkLicenseUrl;
    expect(licenseUrl).toEqual('https://creativecommons.org/licenses');
  });

  it('#showCommentAddedAgainstContent should return false', () => {
    component.editorConfig = editorConfig_question;
    component.collectionTreeNodes = { data:
      {
        status: 'Live',
        rejectComment: 'test'
      }
    };
    spyOn(component, 'showCommentAddedAgainstContent').and.callThrough();
    const result = component.showCommentAddedAgainstContent();
    expect(result).toBeFalsy();
  });

  it('#showCommentAddedAgainstContent should return true', () => {
    component.editorConfig = editorConfig_question;
    component.collectionTreeNodes = {
      data: {
        status: 'Draft',
        prevStatus: 'Review',
        rejectComment: 'test'
      }
    };
    spyOn(component, 'showCommentAddedAgainstContent').and.callThrough();
    const result = component.showCommentAddedAgainstContent();
    expect(component.contentComment).toEqual('test');
    expect(result).toBeTruthy();
  });

  it('#isReviewMode should return editor mode status', () => {
    spyOn(component, 'isReviewMode').and.returnValue(true);
    const value = component.isReviewMode();
    expect(value).toBeTruthy();
  });

  it('#onFormStatusChange() should store form status when form state changed', () => {
    const formStatus = {isValid: true};
    const expectedResult = { do_12345 : true };
    const treeService = TestBed.inject(TreeService);
    spyOn(treeService, 'getActiveNode').and.callFake(() => {
      return { data: { id: 'do_12345' } };
    });
    component.onFormStatusChange(formStatus);
    // tslint:disable-next-line:no-string-literal
    expect(component['formStatusMapper']).toEqual(expectedResult);
  });

  it('#assignPageEmitterListener should call', () => {
    spyOn(component, 'assignPageEmitterListener').and.callThrough();
    component.assignPageEmitterListener({});
    expect(component.pageId).toEqual('questionset_editor');
  });

  it('#ngOnDestroy should call modal.deny()', () => {
    component.telemetryService = undefined;
    component.treeService = undefined;
    component.unSubscribeshowQuestionLibraryPageEmitter = undefined;
    const treeService = TestBed.inject(TreeService);
    // tslint:disable-next-line:no-string-literal
    component['modal'] = {
      deny: jasmine.createSpy('deny')
    };
    spyOn(treeService, 'clearTreeCache').and.callFake(() => {});
    spyOn(component, 'generateTelemetryEndEvent');
    component.ngOnDestroy();
    expect(component.generateTelemetryEndEvent).not.toHaveBeenCalled();
    expect(treeService.clearTreeCache).not.toHaveBeenCalled();
    // tslint:disable-next-line:no-string-literal
    expect(component['modal'].deny).toHaveBeenCalled();
  });

  it('#setAllowEcm should call for obs with rubrics', () => {
    spyOn(component, 'setAllowEcm').and.callThrough();
    const control = {
      isVisible: 'no',
    };
    component.setAllowEcm(control, []);
  });

  it('fetchFrameWorkDetails should set collectionTreeNodes', () => {
    component.collectionTreeNodes = {
        data: {
            children: undefined
        }
    };
    component.editorConfig = editorConfig;
    const frameworkService: any = TestBed.inject(FrameworkService);
    frameworkService.organisationFramework = 'tpd';
    // tslint:disable-next-line:max-line-length
    frameworkService.frameworkData$ = of({frameworkdata: {tpd: of({'frameworkdata' : frameworkData})}});
    spyOn(component, 'fetchFrameWorkDetails').and.callThrough();
    component.fetchFrameWorkDetails();
  });

  it('getHierarchyChildrenConfig should return question children data', () => {
    const categoryData = [
      {
          "identifier": "obj-cat:multiple-choice-question_question_all",
          "name": "Multiple Choice Question",
          "targetObjectType": "Question"
      },
      {
          "identifier": "obj-cat:subjective-question_question_all",
          "name": "Subjective Question",
          "targetObjectType": "Question"
      }
    ];
    const helperService = TestBed.inject(HelperService);
    spyOn(helperService, 'questionPrimaryCategories').and.returnValue(categoryData)
    const childrenData = {
      "Question": []
    };
    spyOn(component, 'getHierarchyChildrenConfig').and.callThrough();
    const returnChildrenData = component.getHierarchyChildrenConfig(childrenData);
    expect(returnChildrenData).toBeDefined();
  });

  it('getHierarchyChildrenConfig should return question children data from editorConfig', () => {
    component.editorConfig = editorConfig_question;
    const helperService = TestBed.inject(HelperService);
    spyOn(helperService, 'questionPrimaryCategories').and.returnValue(undefined);
    const childrenData = {
      "Question": []
    };
    spyOn(component, 'getHierarchyChildrenConfig').and.callThrough();
    const returnChildrenData = component.getHierarchyChildrenConfig(childrenData);
    expect(returnChildrenData).toBeDefined();
  });

  it('getHierarchyChildrenConfig should return content children data', () => {
    const categoryData = [{ "name": "eTextbook"}];
    const helperService = TestBed.inject(HelperService);
    spyOn(helperService, 'contentPrimaryCategories').and.returnValue(categoryData)
    let childrenData = {
      "Content": []
    };
    spyOn(component, 'getHierarchyChildrenConfig').and.callThrough();
    const returnChildrenData = component.getHierarchyChildrenConfig(childrenData);
    expect(returnChildrenData).toBeDefined();
  });

  it('getHierarchyChildrenConfig should return collection children data', () => {
    const categoryData = [{ "name": "Course"}];
    const helperService = TestBed.inject(HelperService);
    spyOn(helperService, 'collectionPrimaryCategories').and.returnValue(categoryData)
    let childrenData = {
      "Collection": []
    };
    spyOn(component, 'getHierarchyChildrenConfig').and.callThrough();
    const returnChildrenData = component.getHierarchyChildrenConfig(childrenData);
    expect(returnChildrenData).toBeDefined();
  });

  it('getHierarchyChildrenConfig should return questionset children data', () => {
    const categoryData = [{ "name": "Practise Question Set"}];
    const helperService = TestBed.inject(HelperService);
    spyOn(helperService, 'questionsetPrimaryCategories').and.returnValue(categoryData)
    let childrenData = {
      "QuestionSet": []
    };
    spyOn(component, 'getHierarchyChildrenConfig').and.callThrough();
    const returnChildrenData = component.getHierarchyChildrenConfig(childrenData);
    expect(returnChildrenData).toBeDefined();
  });

  it('should save draft comments successfully', () => {
    const comment = { id: 1, text: 'Valid comment' };
    const editorService = TestBed.inject(EditorService);
    spyOn(editorService, 'updateComment')
    component.saveDraftComments(comment);
    expect(editorService.updateComment).toHaveBeenCalled();
  });
});

