import { TestBed } from '@angular/core/testing';
import { QuestionsetEditorLibraryService } from './questionset-editor-library.service';

describe('CourseEditorLibraryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: QuestionsetEditorLibraryService = TestBed.inject(QuestionsetEditorLibraryService);
    expect(service).toBeTruthy();
  });
});
