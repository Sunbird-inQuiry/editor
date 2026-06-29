import { TelemetryInteractDirective } from '../../directives/telemetry-interact/telemetry-interact.directive';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { BooleanComponent } from './boolean.component';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { ConfigService } from '../../services/config/config.service';
import { SuiModule } from '@project-sunbird/ng2-semantic-ui';
import { TreeService } from '../../services/tree/tree.service';
import { EditorTelemetryService } from '../../services/telemetry/telemetry.service';
import { EditorService } from "../../services/editor/editor.service";
import { McqOptions } from '../../interfaces/McqForm';

const mockEditorService = {
  editorConfig: {
    config: {
      renderTaxonomy: true,
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
  parentIdentifier: ""
};

describe('BooleanComponent', () => {
  let component: BooleanComponent;
  let fixture: ComponentFixture<BooleanComponent>;
  let treeService, telemetryService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, FormsModule, SuiModule ],
      declarations: [ BooleanComponent, TelemetryInteractDirective ],
      providers: [
        ConfigService,
        TreeService,
        EditorTelemetryService,
        { provide: EditorService, useValue: mockEditorService }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BooleanComponent);
    treeService = TestBed.inject(TreeService);
    telemetryService = TestBed.inject(EditorTelemetryService);
    component = fixture.componentInstance;
    component.sourcingSettings = { enforceCorrectAnswer: true, showAddScore: false };
    component.editorState = {
      question: '<p>Is this true?</p>',
      options: [
        new McqOptions('<p>True</p>'),
        new McqOptions('<p>False</p>')
      ],
      answer: 0
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#ngOnInit() should call addSelectedOptions and editorDataHandler', () => {
    spyOn(component, 'addSelectedOptions').and.callThrough();
    spyOn(component, 'editorDataHandler');
    component.ngOnInit();
    expect(component.addSelectedOptions).toHaveBeenCalled();
    expect(component.editorDataHandler).toHaveBeenCalled();
    expect(component.editorState.options.length).toBe(2);
  });

  it('#onOptionChange() should update selected option and emit data', () => {
    spyOn(component, 'editorDataHandler');
    spyOn(component, 'setMapping');
    const mockEvent = { target: { value: '1', checked: true } };
    component.onOptionChange(mockEvent);
    expect(component.editorState.answer).toBe(1);
    expect(component.selectedOptions).toEqual([1]);
    expect(component.editorState.options[0]['selected']).toBe(false);
    expect(component.editorState.options[1]['selected']).toBe(true);
    expect(component.setMapping).toHaveBeenCalled();
    expect(component.editorDataHandler).toHaveBeenCalled();
  });

  it('#prepareMcqBody() should return expected metadata with qType BOOL', () => {
    component.maxScore = 1;
    const body = component.prepareMcqBody(component.editorState);
    expect(body.qType).toEqual('BOOL');
    expect(body.primaryCategory).toEqual('Boolean Question');
    expect(body.templateId).toEqual('mcq-boolean');
    expect(body.responseDeclaration.response1.cardinality).toEqual('single');
  });
});
