import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TermAndConditionComponent } from './term-and-condition.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigService } from '../../services/config/config.service';
import { EditorService } from '../../services/editor/editor.service';


describe('TermAndConditionComponent', () => {
  let component: TermAndConditionComponent;
  let fixture: ComponentFixture<TermAndConditionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ TermAndConditionComponent ],
      providers: [ConfigService, EditorService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermAndConditionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
  
  it('onConsentChange for ALL', () => {
    component.termsConsent = false;
    component.editingConsent = false;
    spyOn(component, 'onConsentChange').and.callThrough();
    component.onConsentChange({target: {checked: true}} , 'ALL');
    expect(component.termsConsent).toBeTruthy();
    expect(component.editingConsent).toBeTruthy();
  });

  it('onConsentChange for TERM', () => {
    component.termsConsent = true;
    component.editingConsent = true;
    component.allConsent = false;
    spyOn(component, 'onConsentChange').and.callThrough();
    component.onConsentChange({target: {checked: true}} , 'TERM');
    expect(component.allConsent).toBeTruthy();
  });

  it('onConsentChange for EDITING', () => {
    component.termsConsent = true;
    component.editingConsent = true;
    component.allConsent = false;
    spyOn(component, 'onConsentChange').and.callThrough();
    component.onConsentChange({target: {checked: true}} , 'EDITING');
    expect(component.allConsent).toBeTruthy();
  });

  it('#sendForReview() should emit sendForReviewOutput  ', () => {
    component.termsConsent = true;
    component.editingConsent = true;
    spyOn(component, 'sendForReview').and.callThrough();
    spyOn(component.sendForReviewOutput, 'emit').and.callFake(() => {});
    spyOn(component, 'resetAll').and.callFake(() => {});
    component.sendForReview();
    expect(component.termsConsent).toBeTruthy();
    expect(component.editingConsent).toBeTruthy();
    expect(component.sendForReviewOutput.emit).toHaveBeenCalled();
    expect(component.resetAll).toHaveBeenCalled();
  });

  it('#onModalClose() should emit sendForReviewOutput  ', () => {
    spyOn(component, 'onModalClose').and.callThrough();
    spyOn(component.sendForReviewOutput, 'emit').and.callFake(() => {});
    spyOn(component, 'resetAll').and.callFake(() => {});
    component.onModalClose();
    expect(component.sendForReviewOutput.emit).toHaveBeenCalled();
    expect(component.resetAll).toHaveBeenCalled();
  });

  it('resetAll should set all property to false', () => {
    component.showSubmitConfirmPopup = true;
    component.termsConsent = true;
    component.editingConsent = true;
    component.allConsent = true;
    spyOn(component, 'resetAll').and.callThrough();
    component.resetAll();
    expect(component.showSubmitConfirmPopup).toBeFalsy();
    expect(component.termsConsent).toBeFalsy();
    expect(component.editingConsent).toBeFalsy();
    expect(component.allConsent).toBeFalsy();
  })

});
