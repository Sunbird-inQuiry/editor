import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TelemetryInteractDirective } from '../../directives/telemetry-interact/telemetry-interact.directive';
import { EditorService } from '../../services/editor/editor.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule],
      providers: [EditorService],
      declarations: [HeaderComponent, TelemetryInteractDirective],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('#ngOnInit() should call handleActionButtons on ngoninit', () => {
    spyOn(component, 'handleActionButtons');
    spyOn(component, 'getSourcingData').and.callFake(() => {});
    component.ngOnInit();
    expect(component).toBeTruthy();
    expect(component.ngOnInit).toHaveBeenCalled();
  });

  xit('should call handleActionButtons method', () => {
    spyOn(component, 'handleActionButtons');
    component.handleActionButtons();
    expect(component.handleActionButtons).toHaveBeenCalled();
    expect(component.getSourcingData).toHaveBeenCalled();
  });

  it('Should call the getSourcingData method', () => {
    spyOn(component, 'getSourcingData');
    component.getSourcingData();
    expect(component.getSourcingData).toHaveBeenCalled();
  });

  it('#handleActionButtons() visibility should be defined ', () => {
    const editorservice = TestBed.inject(EditorService);
    spyOnProperty(editorservice, 'editorMode', 'get').and.returnValue('edit');
    component.handleActionButtons();
    expect(component.visibility).toBeDefined();
  });
  it('#openRequestChangePopup() should actionType defined', () => {
    component.openRequestChangePopup('sendForCorrections');
    expect(component.showRequestChangesPopup).toBeTruthy();
    expect(component.actionType).toBe('sendForCorrections');
  });
  it('#buttonEmitter() should call buttonEmitter', () => {
    const data = { type: 'previewContent' };
    spyOn(component.toolbarEmitter, 'emit');
    spyOn(component, 'buttonEmitter').and.callFake(() => {});
    component.buttonEmitter(data);
    expect(component.buttonEmitter).toHaveBeenCalledWith(data);
  });
  it('#ngOnDestroy() should call modal deny method', () => {
    component.modal = {
      deny: jasmine.createSpy('deny')
    };
    component.ngOnDestroy();
    expect(component.modal.deny).toHaveBeenCalled();
  });
  it('#publishEmitter() should call publishEmitter for close modal', () => {
    const data = { button: 'closeModal' };
    component.showPublishCollectionPopup = true;
    spyOn(component.toolbarEmitter, 'emit');
    component.publishEmitter(data);
    expect(component.showPublishCollectionPopup).toBeFalsy();
  });
  it('#publishEmitter() should call publishEmitter for publish event', () => {
    const data = { button: 'publishContent', publishCheckList: [] };
    component.showPublishCollectionPopup = true;
    spyOn(component.toolbarEmitter, 'emit');
    component.publishEmitter(data);
    expect(component.showPublishCollectionPopup).toBeFalsy();
    expect(component.toolbarEmitter.emit).toHaveBeenCalledWith(data);
  });
  it('#openPublishCheckListPopup() should open showPublishCollectionPopup', () => {
    component.showPublishCollectionPopup = false;
    component.openPublishCheckListPopup('publishContent');
    expect(component.showPublishCollectionPopup).toBeTruthy();
    expect(component.actionType).toBeDefined();
  });
  it('#bulkUploadListener() should call #bulkUploadEmitter.emit()', () => {
    const data = { status: true, type: 'updateHierarchy' };
    component.bulkUploadEmitter = new EventEmitter<any>();
    spyOn(component.bulkUploadEmitter, 'emit');
    component.bulkUploadListener(data);
    expect(component.bulkUploadEmitter.emit).toHaveBeenCalledWith(data)
  });
});
