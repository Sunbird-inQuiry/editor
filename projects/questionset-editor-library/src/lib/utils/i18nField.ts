export type I18nMap   = Record<string, string>;
export type I18nValue = string | I18nMap;

const DEFAULT = 'en';

export function readI18n(field: I18nValue | undefined, lang: string): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  const first = Object.keys(field)[0];
  return field[lang] !== undefined ? field[lang]
       : field[DEFAULT] !== undefined ? field[DEFAULT]
       : first ? field[first] : '';
}

// For editor inputs: no fallback — return '' if lang slot doesn't exist yet
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
  // Store empty string rather than deleting — prevents accidental data loss when author clears a field.
  // normalizeI18n will exclude empty entries from the serialized map.
  map[lang] = value;
  return normalizeI18n(map);
}

/** Always return an I18nMap object — never collapses to a plain string. */
export function asI18nMap(field: I18nValue | undefined): I18nMap {
  if (!field) return {};
  if (typeof field === 'string') return { [DEFAULT]: field };
  return { ...(field as I18nMap) };
}

export function normalizeI18n(map: I18nMap): I18nValue {
  const filled: I18nMap = {};
  Object.keys(map).forEach(k => { if (map[k]) { filled[k] = map[k]; } });
  const keys = Object.keys(filled);
  if (keys.length === 0)                        return '';
  if (keys.length === 1 && keys[0] === DEFAULT) return filled[DEFAULT];
  return filled;
}
