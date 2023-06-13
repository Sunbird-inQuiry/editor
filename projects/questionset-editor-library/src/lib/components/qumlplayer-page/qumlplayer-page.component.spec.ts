import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { QumlplayerPageComponent } from './qumlplayer-page.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TelemetryInteractDirective } from '../../directives/telemetry-interact/telemetry-interact.directive';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EditorTelemetryService } from '../../services/telemetry/telemetry.service';
import { EditorService } from '../../services/editor/editor.service';
import { mockData } from './qumlplayer-page.component.spec.data';
import { TreeService } from '../../services/tree/tree.service';
import { FrameworkService } from '../../services/framework/framework.service';
import { BehaviorSubject, of } from 'rxjs';
describe('QumlplayerPageComponent', () => {
  let component: QumlplayerPageComponent;
  let fixture: ComponentFixture<QumlplayerPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      declarations: [ QumlplayerPageComponent, TelemetryInteractDirective ],
      providers: [EditorTelemetryService, EditorService],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QumlplayerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('#ngOnChanges() should call initQumlPlayer and fetchFrameWorkDetails', () => {
    component.questionMetaData = {data: {metadata: {}}};
    component.questionSetHierarchy = {framework: 'inQuiry-k12'}
    spyOn(component, 'initQumlPlayer').and.callFake(() => {});
    spyOn(component, 'fetchFrameWorkDetails').and.callFake(() => {});
    component.ngOnChanges();
    expect(component.initQumlPlayer).toHaveBeenCalled();
    expect(component.fetchFrameWorkDetails).toHaveBeenCalled();
  });

  it('#ngOnChanges() should call initQumlPlayer and setFormDefaultValues', () => {
    component.questionMetaData = {data: {metadata: {}}};
    component.questionSetHierarchy = {framework: undefined};
    const editorService = TestBed.inject(EditorService);
    spyOnProperty(editorService, 'editorConfig', 'get').and.returnValue({});
    spyOn(component, 'initQumlPlayer').and.callFake(() => {});
    spyOn(component, 'fetchFrameWorkDetails').and.callFake(() => {});
    spyOn(component, 'setFormDefaultValues').and.callFake(() => {});
    component.ngOnChanges();
    expect(component.initQumlPlayer).toHaveBeenCalled();
    expect(component.fetchFrameWorkDetails).not.toHaveBeenCalled();
    expect(component.setFormDefaultValues).toHaveBeenCalled();
  });

  it('#ngOnChanges() should not call initQumlPlayer', () => {
    component.questionMetaData = {};
    spyOn(component, 'initQumlPlayer').and.callFake(() => {});
    component.ngOnChanges();
    expect(component.initQumlPlayer).not.toHaveBeenCalled();
  });

  it('#fetchFrameWorkDetails() should fetch frameworkDetails', () => {
    let frameworkService = TestBed.inject(FrameworkService);
    const frameworkdata = {
      'inquiry_k-12': mockData.frameworkdata
    }
    frameworkService['_frameworkData$'] = new BehaviorSubject<any>(undefined);
    frameworkService['_frameworkData$'].next({ err: null, frameworkdata: frameworkdata })
    // spyOnProperty(frameworkService, '_frameworkData$').and.returnValue(queryParamsMock)
    spyOn(component, 'fetchFrameWorkDetails').and.callThrough();
    spyOn(component, 'setFieldsTerms').and.callFake(() => {});
    component.fetchFrameWorkDetails('inquiry_k-12');
  });

  it('#setFieldsTerms() should set fields terms', () => {
    component.frameworkDetails = {frameworkData: mockData.frameworkdata.categories} ;
    component.questionFormConfig = mockData.questionFormConfig;
    spyOn(component, 'setFieldsTerms').and.callThrough();
    spyOn(component, 'setFormDefaultValues').and.callFake(() => {});
    component.setFieldsTerms();
    expect(component.setFieldsTerms).toHaveBeenCalled();
    expect(component.setFormDefaultValues).toHaveBeenCalled();
  });

  it('#setFormDefaultValues() should set fields default value', () => {
    component.showForm = false;
    component.questionFormConfig = mockData.questionFormConfig;
    component.questionMetaData = mockData.questionMetaData;
    spyOn(component, 'setFormDefaultValues').and.callThrough();
    component.setFormDefaultValues();
    expect(component.setFormDefaultValues).toHaveBeenCalled();
    expect(component.showForm).toBeTruthy();
  });

  it('#initQumlPlayer() should set prevQuestionId', () => {
    component.showPlayerPreview = false;
    component.prevQuestionId = 'do_11326368076523929623';
    component.initQumlPlayer();
    expect(component.prevQuestionId).not.toBe(mockData.questionMetaData.identifier);
  });

  it('initQumlPlayer() should set hierarchy.maxScore', () => {
    component.hierarchy = {children: [], childNodes: [], maxScore: undefined};
    component.questionMetaData = { data: { metadata: mockData.questionMetaData}};
    component.prevQuestionId = 'do_12345';
    component.questionSetHierarchy = mockData.questionSetHierarchy;
    const treeService = TestBed.inject(TreeService);
    spyOn(treeService, 'getNodeById').and.returnValue({
      data: { metadata: {} },
      parent: { data: { metadata: { shuffle: false } } }
    });
    spyOn(treeService, 'getParent').and.returnValue({ data: { metadata: { showSolutions: 'Yes', showFeedback: 'Yes' } } });
    component.initQumlPlayer();
    expect(component.hierarchy.showSolutions).toEqual('Yes');
    expect(component.hierarchy.showFeedback).toEqual('Yes');
  });
  it('#switchToPotraitMode() should set  showPotrait to true', () => {
    component.showPotrait = false;
    component.switchToPotraitMode();
    expect(component.showPotrait).toBeTruthy();
  });
  it('#switchToLandscapeMode() should set showPotrait to false', () => {
    component.showPotrait = true;
    component.switchToLandscapeMode();
    expect(component.showPotrait).toBeFalsy();
  });
  it('#removeQuestion() should emit  toolbarEmitter with removeContent', () => {
    spyOn(component.toolbarEmitter, 'emit');
    component.removeQuestion();
    expect(component.toolbarEmitter.emit).toHaveBeenCalledWith({button: 'removeContent'});
  });
  it('#editQuestion() should emit  toolbarEmitter with editContent', () => {
    spyOn(component.toolbarEmitter, 'emit');
    component.editQuestion();
    expect(component.toolbarEmitter.emit).toHaveBeenCalledWith({button: 'editContent'});
  });
});
