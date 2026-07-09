import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ActiveLanguageService {
  static readonly LANGS = [
    { code: 'en', label: 'EN', dir: 'ltr' as const },
    { code: 'ar', label: 'AR', dir: 'rtl' as const },
    { code: 'fr', label: 'FR', dir: 'ltr' as const },
    { code: 'pt', label: 'PT', dir: 'ltr' as const },
  ];

  private _lang$ = new BehaviorSubject<string>('en');
  lang$ = this._lang$.asObservable();

  get current(): string { return this._lang$.value; }
  get isRTL(): boolean  { return this.current === 'ar'; }
  get dir(): string     { return this.isRTL ? 'rtl' : 'ltr'; }

  set(code: string): void {
    this._lang$.next(code);
  }
}
