/**
 * UI label i18n — replicates the old editor's ConfigService label handling:
 * label.config.json is the English base; label.config.<lang>.json overrides
 * are deep-merged on top (old setLanguage), and host-provided
 * context.labels win last (old getToolbarConfig merged them).
 *
 * UI language resolution (old editor): context.uiLanguage, else the
 * portal-set localStorage 'app-language', else 'en'.
 */
import en from '../locales/label.config.json';
import ar from '../locales/label.config.ar.json';
import fr from '../locales/label.config.fr.json';
import hi from '../locales/label.config.hi.json';
import pt from '../locales/label.config.pt.json';

// Some sections nest one level deeper (e.g. lbl.myAssets.{image,video,audio}).
export type LabelConfig = Record<string, Record<string, unknown>>;

const OVERRIDES: Record<string, unknown> = { ar, fr, hi, pt };

function deepMerge(base: LabelConfig, over: unknown): LabelConfig {
  const out: LabelConfig = { ...base };
  for (const [section, values] of Object.entries((over ?? {}) as Record<string, unknown>)) {
    if (values && typeof values === 'object') {
      out[section] = { ...(out[section] ?? {}), ...(values as Record<string, unknown>) };
    }
  }
  return out;
}

let current: LabelConfig = en as unknown as LabelConfig;

export function resolveUiLanguage(contextLang?: string): string {
  if (contextLang) return contextLang;
  try {
    return localStorage.getItem('app-language') ?? 'en';
  } catch {
    return 'en';
  }
}

/** Build the merged label config for a language (+ optional host overrides). */
export function setUiLanguage(lang: string, hostLabels?: Record<string, string>): LabelConfig {
  let merged = en as unknown as LabelConfig;
  if (lang !== 'en' && OVERRIDES[lang]) merged = deepMerge(merged, OVERRIDES[lang]);
  if (hostLabels && Object.keys(hostLabels).length) {
    merged = deepMerge(merged, { button_labels: hostLabels });
  }
  current = merged;
  return merged;
}

/** Look up "section.key" with a fallback (old configService.labelConfig). */
export function label(path: string, fallback = ''): string {
  const [section, key] = path.split('.');
  const value = section && key ? current[section]?.[key] : undefined;
  return typeof value === 'string' && value ? value : fallback;
}

/** Same lookup against an explicit config (for store-driven re-renders). */
export function labelFrom(config: LabelConfig, path: string, fallback = ''): string {
  const [section, key] = path.split('.');
  const value = section && key ? config[section]?.[key] : undefined;
  return typeof value === 'string' && value ? value : fallback;
}
