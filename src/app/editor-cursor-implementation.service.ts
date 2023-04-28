
import { Inject, Injectable } from '@angular/core';
import { Observable, of, throwError} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, mergeMap } from 'rxjs/operators';
import { QuestionCursor } from '@project-sunbird/sunbird-quml-player';
import { EditorCursor } from 'upsmf-collection-editor';
import * as _ from 'lodash-es';

@Injectable({
  providedIn: 'root'
})

export class EditorCursorImplementationService implements QuestionCursor, EditorCursor {
  public questionMap =  new Map();
  constructor(private http: HttpClient) {} // @Inject(HttpClient)

  getQuestion(questionId: string): Observable<any> {
    if (_.isEmpty(questionId)) { return of({}); }
    const question = this.getQuestionData(questionId);
    if (question) {
        return of({questions : _.castArray(question)});
    } else {
      return this.post(_.castArray(questionId)).pipe(map((data) => {
        return data.result;
      }));
    }
  }

  getQuestions(questionIds: string[]): Observable<any> {
    return this.post(questionIds).pipe(map((data) => {
      return data.result;
    }));
  }

  getQuestionSet(identifier: string): Observable<any> {
    return of({});
  }

  getQuestionData(questionId) {
    return this.questionMap.get(_.first(_.castArray(questionId))) || undefined;
  }

  setQuestionMap(key, value) {
    this.questionMap.set(key, value);
  }

  clearQuestionMap() {
    this.questionMap.clear();
  }

  getAllQuestionSet(identifiers: string[]): Observable<any>  {
    return of({});
  }

  private post(questionIds): Observable<any> {
    const httpOptions = {
        headers: { 'Content-Type': 'application/json' }
    };
    const requestParam = {
      url: 'api/question/v1/list',
      data: {
        request: {
          search: {
            identifier: questionIds
          }
        }
      }
    };
    return this.http.post(requestParam.url, requestParam.data, httpOptions).pipe(
        mergeMap((data: any) => {
            if (data.responseCode !== 'OK') {
                return throwError(data);
            }
            return of(data);
        }));
  }

}
