import { Component } from '@angular/core';
import { ActiveLanguageService } from '../../services/language/active-language.service';
import { ConfigService } from '../../services/config/config.service';

@Component({
  standalone: false,
  selector: 'lib-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
})
export class LanguageSelectorComponent {
  languages = ActiveLanguageService.LANGS;

  get globalIsRTL(): boolean { return localStorage.getItem('app-language') === 'ar'; }

  constructor(public activeLang: ActiveLanguageService, public configService: ConfigService) {}
}
