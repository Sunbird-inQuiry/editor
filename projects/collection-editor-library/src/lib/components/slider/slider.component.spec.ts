import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { mockConfigService, mockData } from "./slider.component.spec.data";
import { SliderComponent } from "./slider.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ConfigService } from '../../services/config/config.service';
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("SliderComponent", () => {
  let component: SliderComponent;
  let fixture: ComponentFixture<SliderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientTestingModule],
      declarations: [SliderComponent],
      providers:[
        { provide: ConfigService, useValue: mockConfigService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SliderComponent);
    component = fixture.componentInstance;
    component.sliderValue = {};
    component.editorDataInput = mockData.editorDataInput;
    // fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should call the ngOnInit", () => {
    component.editorDataInput = mockData.editorDataInput;
    spyOn(component, "ngOnInit").and.callThrough();
    component.ngOnInit();
    expect(component.ngOnInit).toHaveBeenCalled();
  });

  it("should call the ngOnInit when editorDataInput is undefined", () => {
    component.sliderValue = {};
    component.editorDataInput = {};
    spyOn(component, "ngOnInit").and.callThrough();
    component.ngOnInit();
    expect(component.ngOnInit).toHaveBeenCalled();
  });

  it("#onValueChange() should emit  onChange with data for rightAnchor", () => {
    component.sliderValue['rightAnchor'] = {};
    spyOn(component,'onValueChange').and.callThrough();
    spyOn(component.onChange, "emit").and.callFake(() => {});
    component.onValueChange(mockData.changeEvent.event, "rightAnchor");
    expect(component.onValueChange).toHaveBeenCalled();
    expect(component.onChange.emit).toHaveBeenCalled();
    expect(component.sliderValue.rightAnchor).toBe(10);
  });

});
