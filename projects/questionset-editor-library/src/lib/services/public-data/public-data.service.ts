import { DataService } from './../data/data.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EditorService } from '../editor/editor.service';

@Injectable({
  providedIn: 'root'
})
export class PublicDataService extends DataService {

  /**
   * base Url for public api
   */
  baseUrl: string;
  channelId: string;

  public http: HttpClient;
  constructor(http: HttpClient, public editorService: EditorService) {
    super(http);
    this.baseUrl = 'action/';
    this.channelId = this.editorService.editorConfig.context.channel
  }
}
