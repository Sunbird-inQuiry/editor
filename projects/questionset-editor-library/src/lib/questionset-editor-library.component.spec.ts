import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { QuestionsetEditorLibraryComponent } from './questionset-editor-library.component';

describe('QuestionsetEditorLibraryComponent', () => {
  let component: QuestionsetEditorLibraryComponent;
  let fixture: ComponentFixture<QuestionsetEditorLibraryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionsetEditorLibraryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionsetEditorLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
