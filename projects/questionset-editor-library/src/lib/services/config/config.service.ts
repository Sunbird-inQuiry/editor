import { Injectable } from '@angular/core';
import * as urlConfig from './url.config.json';
import * as categoryConfig from './category.config.json';
import * as labelConfigEn from './label.config.json';
import * as labelConfigAr from './label.config.ar.json';
import * as labelConfigHi from './label.config.hi.json';
import * as labelConfigFr from './label.config.fr.json';
import * as labelConfigPt from './label.config.pt.json';
import * as playerConfig from './player.config.json';
import * as editorConfig from './editor.config.json';
import * as _ from 'lodash-es';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  urlConFig    = (urlConfig as any);
  categoryConfig = (categoryConfig as any);
  labelConfig  = (labelConfigEn as any);
  playerConfig = (playerConfig as any);
  editorConfig = (editorConfig as any);
  public sessionContext: Array<string> = ['topic', 'author', 'channel', 'framework', 'copyright', 'attributions', 'audience', 'license'];

  private readonly labelMap: Record<string, any> = {
    en: labelConfigEn,
    ar: labelConfigAr,
    hi: labelConfigHi,
    pt: labelConfigPt,
    fr: labelConfigFr,
  };

  setLanguage(lang: string): void {
    const base  = this.labelMap['en'] as any;
    const trans = this.labelMap[lang]  as any;
    if (!trans || lang === 'en') {
      this.labelConfig = base;
    } else {
      // Deep-merge: translated keys override English defaults
      this.labelConfig = _.merge({}, base, trans);
    }
  }
}
