import { Component } from '@angular/core';
import { observationEditorConfig, observationRubricsEditorConfig, questionSetEditorConfig,
  collectionEditorConfig, courseEditorConfig, questionEditorConfig,surveyEditorConfig } from './data';

const configMapper = {
  questionSet: questionSetEditorConfig,
  question: questionEditorConfig,
  collection : collectionEditorConfig,
  course: courseEditorConfig,
  survey: surveyEditorConfig,
  observation: observationEditorConfig,
  rubrics: observationRubricsEditorConfig
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Sunbird Collection Editor';
  editor: any = localStorage.getItem('editorType') || '';
  public editorConfig: any = configMapper[this.editor];

  editorEventListener(event) {
    this.editor = undefined;
    localStorage.removeItem('editorType');
    console.log(event);
  }

  setType(editorType) {
    if (editorType === 'questionSet') {
      localStorage.setItem('editorType', 'questionSet');
    } else if (editorType === 'question') {
      localStorage.setItem('editorType', 'question');
    } else if (editorType === 'course') {
      localStorage.setItem('editorType', 'course');
    }  else if (editorType === 'collection') {
      localStorage.setItem('editorType', 'collection');
    } else if (editorType === 'observation') {
      localStorage.setItem('editorType', 'observation');
    } else if (editorType === 'survey') {
      localStorage.setItem('editorType', 'survey');
    } else if (editorType === 'rubrics') {
      localStorage.setItem('editorType', 'rubrics');
    }
    window.location.reload();
  }
}