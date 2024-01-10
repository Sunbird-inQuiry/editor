import { DoBootstrap, NgModule, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { createCustomElement } from '@angular/elements';
import { QuestionsetEditorLibraryModule, EditorComponent, EditorCursor} from 'questionset-editor-library';
import { QuestionCursor } from '@project-sunbird/sunbird-quml-player';
import { EditorCursorImplementationService } from '../../../../src/app/editor-cursor-implementation.service';
@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    QuestionsetEditorLibraryModule,
    RouterModule.forRoot([], {}),
    BrowserAnimationsModule
  ],
  providers: [
    { provide: QuestionCursor, useExisting: EditorCursorImplementationService },
    { provide: EditorCursor, useExisting: EditorCursorImplementationService }
  ]
})
export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) { }
  ngDoBootstrap() {
    const customElement = createCustomElement(EditorComponent, { injector: this.injector });
    customElements.define('lib-questionset-editor', customElement);
  }
}
