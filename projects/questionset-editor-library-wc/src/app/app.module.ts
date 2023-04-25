import { DoBootstrap, NgModule, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonFormElementsModule } from 'common-form-elements-web-v9';
import { SuiModule } from 'ng2-semantic-ui-v9';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { HttpClientModule } from '@angular/common/http';
import { SanitizeHtmlPipe } from '../../../questionset-editor-library/src/lib/pipes/sanitize-html.pipe';
import { InterpolatePipe } from '../../../questionset-editor-library/src/lib/pipes/interpolate.pipe';
import { QuestionsetEditorLibraryComponent } from '../../../questionset-editor-library/src/lib/questionset-editor-library.component';
import { EditorComponent } from '../../../questionset-editor-library/src/lib/components/editor/editor.component';
import { HeaderComponent } from '../../../questionset-editor-library/src/lib/components/header/header.component';
import { FancyTreeComponent } from '../../../questionset-editor-library/src/lib/components/fancy-tree/fancy-tree.component';
import { MetaFormComponent } from '../../../questionset-editor-library/src/lib/components/meta-form/meta-form.component';
import { TemplateComponent } from '../../../questionset-editor-library/src/lib/components/template/template.component';
import { QumlplayerPageComponent } from '../../../questionset-editor-library/src/lib/components/qumlplayer-page/qumlplayer-page.component';
import { OptionsComponent } from '../../../questionset-editor-library/src/lib/components/options/options.component';
import { AnswerComponent } from '../../../questionset-editor-library/src/lib/components/answer/answer.component';
import { CkeditorToolComponent } from '../../../questionset-editor-library/src/lib/components/ckeditor-tool/ckeditor-tool.component';
import { QuestionComponent } from '../../../questionset-editor-library/src/lib/components/question/question.component';
import {SunbirdPdfPlayerModule} from '@project-sunbird/sunbird-pdf-player-v9';
import { SunbirdEpubPlayerModule } from '@project-sunbird/sunbird-epub-player-v9';
import { SunbirdVideoPlayerModule } from '@project-sunbird/sunbird-video-player-v9';
import { QumlLibraryModule } from '@project-sunbird/sunbird-quml-player';
import {CarouselModule} from 'ngx-bootstrap/carousel';
import { TelemetryInteractDirective } from '../../../questionset-editor-library/src/lib/directives/telemetry-interact/telemetry-interact.directive';
import { DateFormatPipe } from '../../../questionset-editor-library/src/lib/directives/date-format/date-format.pipe';
import { AssetBrowserComponent } from '../../../questionset-editor-library/src/lib/components/asset-browser/asset-browser.component';
import { CollectionIconComponent } from '../../../questionset-editor-library/src/lib/components/collection-icon/collection-icon.component';
import { QumlPlayerComponent } from '../../../questionset-editor-library/src/lib/components/quml-player/quml-player.component';
import { QuestionOptionSubMenuComponent } from '../../../questionset-editor-library/src/lib/components/question-option-sub-menu/question-option-sub-menu.component';
import { SliderComponent } from '../../../questionset-editor-library/src/lib/components/slider/slider.component';
import { TranslationsComponent } from '../../../questionset-editor-library/src/lib/components/translations/translations.component';
import { PublishChecklistComponent } from '../../../questionset-editor-library/src/lib/components/publish-checklist/publish-checklist.component';
import { RelationalMetadataComponent } from '../../../questionset-editor-library/src/lib/components/relational-metadata/relational-metadata.component';
import { ResourceLibraryModule } from '@project-sunbird/sunbird-resource-library';
import { AppLoaderComponent } from '../../../questionset-editor-library/src/lib/components/app-loader/app-loader.component';
import { AssignPageNumberComponent } from '../../../questionset-editor-library/src/lib/components/assign-page-number/assign-page-number.component';
import { PlainTreeComponent } from '../../../questionset-editor-library/src/lib/components/plain-tree/plain-tree.component';
import { A11yModule } from '@angular/cdk/a11y';
import { ProgressStatusComponent } from '../../../questionset-editor-library/src/lib/components/progress-status/progress-status.component';
import {TermAndConditionComponent} from '../../../questionset-editor-library/src/lib/components/term-and-condition/term-and-condition.component';
import { QualityParamsModalComponent } from '../../../questionset-editor-library/src/lib/components/quality-params-modal/quality-params-modal.component';
@NgModule({
  declarations: [
    QuestionsetEditorLibraryComponent,
    InterpolatePipe,
    SanitizeHtmlPipe,
    EditorComponent,
    QumlplayerPageComponent,
    HeaderComponent,
    FancyTreeComponent,
    MetaFormComponent,
    QuestionComponent,
    OptionsComponent,
    AnswerComponent,
    CkeditorToolComponent,
    TemplateComponent,
    DateFormatPipe,
    TelemetryInteractDirective,
    AssetBrowserComponent,
    CollectionIconComponent,
    QumlPlayerComponent,
    PublishChecklistComponent,
    QuestionOptionSubMenuComponent,
    SliderComponent,
    TranslationsComponent,
    AppLoaderComponent,
    RelationalMetadataComponent,
    AssignPageNumberComponent,
    PlainTreeComponent,
    ProgressStatusComponent,
    TermAndConditionComponent,
    QualityParamsModalComponent
  ],
  imports: [
    BrowserModule, CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild([]), SuiModule,
    CommonFormElementsModule, InfiniteScrollModule, HttpClientModule, QumlLibraryModule,  SunbirdPdfPlayerModule, SunbirdVideoPlayerModule,
    CarouselModule, SunbirdEpubPlayerModule, ResourceLibraryModule, A11yModule
  ],
  providers: [],
  entryComponents: [EditorComponent]
})
export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) { }
  ngDoBootstrap() {
    const customElement = createCustomElement(EditorComponent, { injector: this.injector });
    customElements.define('sunbird-questionset-editor', customElement);
  }
}
