/**
 * i18n content-field helpers — ported verbatim from the old editor's
 * questionset-editor-library/src/lib/utils/i18nField.ts.
 *
 * An I18nValue is a plain string when only English is authored, otherwise a
 * {lang: text} map (empty entries dropped) — normalizeI18n enforces that
 * serialization rule so payloads match the old editor exactly.
 */
export type I18nMap = Record<string, string>;
export type I18nValue = string | I18nMap;

const DEFAULT = 'en';

/** Old editor's ActiveLanguageService.LANGS. */
export const CONTENT_LANGS = [
  { code: 'en', label: 'EN', dir: 'ltr' },
  { code: 'ar', label: 'AR', dir: 'rtl' },
  { code: 'fr', label: 'FR', dir: 'ltr' },
  { code: 'pt', label: 'PT', dir: 'ltr' },
] as const;

export type ContentLang = (typeof CONTENT_LANGS)[number]['code'];

export function readI18n(field: I18nValue | undefined, lang: string): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  const first = Object.keys(field)[0];
  return field[lang] !== undefined ? field[lang]!
    : field[DEFAULT] !== undefined ? field[DEFAULT]!
    : first ? field[first]! : '';
}

/** For editor inputs: no fallback — '' if the lang slot doesn't exist yet. */
export function readI18nForEditor(field: I18nValue | undefined, lang: string): string {
  if (!field) return '';
  if (typeof field === 'string') return lang === DEFAULT ? field : '';
  return field[lang] ?? '';
}

export function writeI18n(current: I18nValue | undefined, lang: string, value: string): I18nValue {
  if (lang === DEFAULT && !current) return value;
  const map: I18nMap = typeof current === 'object'
    ? { ...current }
    : (current ? { [DEFAULT]: current } : {});
  map[lang] = value;
  return normalizeI18n(map);
}

/** Always return an I18nMap object — never collapses to a plain string. */
export function asI18nMap(field: I18nValue | undefined): I18nMap {
  if (!field) return {};
  if (typeof field === 'string') return { [DEFAULT]: field };
  return { ...field };
}

export function normalizeI18n(map: I18nMap): I18nValue {
  const filled: I18nMap = {};
  Object.keys(map).forEach((k) => { if (map[k]) filled[k] = map[k]!; });
  const keys = Object.keys(filled);
  if (keys.length === 0) return '';
  if (keys.length === 1 && keys[0] === DEFAULT) return filled[DEFAULT]!;
  return filled;
}

/** Languages (other than en) that actually carry text in a map. */
export function filledLangs(map: I18nMap): string[] {
  return Object.keys(map).filter((k) => map[k]);
}
