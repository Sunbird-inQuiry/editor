import { Injectable } from '@angular/core';
import * as _ from 'lodash-es';
import { EditorService } from '../../services/editor/editor.service';

interface PlayerConfig {
  config: any;
  context: any;
  data: any;
  metadata: any;
}

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  qumlPlayerSideMenuConfig = {
    enable: false,
    showShare: false,
    showDownload: false,
    showReplay: true,
    showExit: false,
  };
  constructor(private editorService: EditorService) { }

  /**
   * returns QUML player config details.
   */
  getQumlPlayerConfig() {
    const configuration: any = _.cloneDeep(this.editorService.editorConfig);
    configuration.context.userData = { firstName: configuration.context.user.firstName, lastName: configuration.context.user.lastName };
    configuration.config = {...configuration.config, sideMenu : this.qumlPlayerSideMenuConfig };
    configuration.context.mode = 'play';
    configuration.metadata = {};
    configuration.data = {};
    return configuration;
  }
}
