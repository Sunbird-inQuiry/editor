import { TelemetryInteractDirective } from '../../directives/telemetry-interact/telemetry-interact.directive';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatchComponent } from './match.component';
import { mockOptionData } from './match.component.spec.data';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import { ConfigService } from '../../services/config/config.service';
import { EditorTelemetryService } from '../../services/telemetry/telemetry.service';


describe('MatchComponent', () => {
  let component: MatchComponent;
  let fixture: ComponentFixture<MatchComponent>;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [MatchComponent, TelemetryInteractDirective],
      providers: [ConfigService, EditorTelemetryService,],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchComponent);
    component = fixture.componentInstance;
    component.editorState = mockOptionData.editorOptionData;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("#ngOnInit() should call editorDataHandler on ngOnInit", () => {
    component.editorState = mockOptionData.editorOptionData;
    spyOn(component, "editorDataHandler");
    component.ngOnInit();
    expect(component.editorDataHandler).toHaveBeenCalled();
  });

  it("should not set #templateType when creating new question", () => {
    component.editorState = {};
    spyOn(component, "editorDataHandler");
    component.ngOnInit();
    expect(component.templateType).toEqual("mtf-horizontal");
  });

  it("should set #templateType when updating an existing question", () => {
    component.editorState = mockOptionData.editorOptionData;
    spyOn(component, "editorDataHandler");
    component.ngOnInit();
    expect(component.templateType).toEqual("mtf-vertical");
  });

  it("ngOnChanges should not call editorDataHandler", () => {
    spyOn(component, "editorDataHandler").and.callFake(() => {});
    spyOn(component, "ngOnChanges").and.callThrough();
    component.ngOnChanges({
      maxScore: new SimpleChange(undefined, 4, true),
    });
    expect(component.editorDataHandler).not.toHaveBeenCalled();
  });

  it("ngOnChanges should call editorDataHandler", () => {
    spyOn(component, "editorDataHandler").and.callFake(() => {});
    spyOn(component, "ngOnChanges").and.callThrough();
    component.ngOnChanges({
      maxScore: new SimpleChange(1, 2, false),
    });
    expect(component.editorDataHandler).toHaveBeenCalled();
  });

  it('#editorDataHandler() should emit option data', () => {
    spyOn(component, 'prepareMtfBody').and.callThrough();
    spyOn(component.editorDataOutput, 'emit').and.callThrough();
    component.editorState = mockOptionData.editorOptionData;
    component.editorState.correctMatchPair = [{ "0": 0 }, { "1": 1 }];
    component.editorDataHandler();
    expect(component.prepareMtfBody).toHaveBeenCalledWith(mockOptionData.editorOptionData);
    expect(component.editorDataOutput.emit).toHaveBeenCalled();
  });

  it("#prepareMtfBody() should return expected mtf option data for MTF", () => {
    component.maxScore = 4;
    spyOn(component, 'setMapping').and.callThrough();
    spyOn(component, "getResponseDeclaration").and.callThrough();
    spyOn(component, "getInteractions").and.callThrough();
    component.prepareMtfBody(mockOptionData.editorOptionData);
    expect(component.getResponseDeclaration).toHaveBeenCalledWith(
      mockOptionData.editorOptionData
    );
    expect(component.getInteractions).toHaveBeenCalledWith(
      mockOptionData.editorOptionData.options
    );
  });

  it('#getInteractions should return expected interactions', () => {
    spyOn(component, 'getInteractions').and.callThrough();
    const result = component.getInteractions(mockOptionData.editorOptionData.options);
    expect(result).toEqual(mockOptionData.prepareMtfBody.interactions);
  })

  it('#setMapping should set mapping', () => { 
    spyOn(component, 'setMapping').and.callThrough();
    component.editorState = mockOptionData.editorOptionData;
    component.editorState.correctMatchPair = mockOptionData.editorOptionData.correctMatchPair;
    component.maxScore = 4;
    component.setMapping();
    expect(component.mapping).toEqual(mockOptionData.prepareMtfBody.responseDeclaration.response1.mapping);
  })

  it('#setMapping should set mapping with empty array when correctMatchPair is empty', () => { 
    spyOn(component, 'setMapping').and.callThrough();
    component.editorState.correctMatchPair = [];
    component.setMapping();
    expect(component.mapping).toEqual([]);
  });

  it('#getOutcomeDeclaration should return expected outcomeDeclaration', () => { 
    component.maxScore = 4;
    spyOn(component, 'getOutcomeDeclaration').and.callThrough();
    const outcomeDeclaration = component.getOutcomeDeclaration();
    expect(outcomeDeclaration.maxScore.cardinality).toEqual('multiple');
    expect(outcomeDeclaration.maxScore.defaultValue).toEqual(4);
  })

  it('#getResponseDeclaration should return expected responseDeclaration', () => {
    component.mapping = [
      {
        value: {
          "0": 0,
        },
        score: 2,
      },
      {
        value: {
          "1": 1,
        },
        score: 2,
      },
    ];
    spyOn(component, "getResponseDeclaration").and.callThrough();
    const responseDeclaration = component.getResponseDeclaration(mockOptionData.editorOptionData);
    expect(responseDeclaration.response1.cardinality).toEqual('multiple');
  })

  it('#setTemplate() should set #templateType to "mtf-vertical"', () => {
    spyOn(component, "editorDataHandler").and.callThrough();
    const templateType = "mtf-vertical";
    component.editorState = mockOptionData.editorOptionData;
    component.setTemplate(templateType);
    expect(component.templateType).toEqual(templateType);
    expect(component.editorDataHandler).toHaveBeenCalled();
  });
});