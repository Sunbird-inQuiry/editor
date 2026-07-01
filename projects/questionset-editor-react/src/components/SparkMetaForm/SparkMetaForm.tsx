import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Icon } from '../shared/Icon';
import type { ICategoryField } from '../../api/categoryDefinition';
import styles from './SparkMetaForm.module.scss';
import ImagePickerModal from '../shared/ImagePickerModal';
import ContentEditable from '../shared/ContentEditable';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Shape of a single framework term entry. */
export interface FrameworkTerm {
  name: string;
  identifier: string;
  code: string;
}

export interface SparkMetaFormProps {
  /** Field configuration array from category-definition API. */
  fields: ICategoryField[];
  /** Current field values (from activeNodeMeta or node metadata). */
  values: Record<string, unknown>;
  /** Called when a field value changes — (fieldCode, newValue). */
  onChange: (code: string, value: unknown) => void;
  /** Called when overall form validity changes. */
  onValidityChange?: (isValid: boolean) => void;
  /** When true, all inputs are disabled/read-only. */
  readOnly?: boolean;
  /**
   * When set, only fields whose `section` property matches this value are
   * rendered.  Fields with no `section` are shown when `section` is
   * undefined (i.e. the "Details" tab).
   */
  section?: string;
  /**
   * Framework terms keyed by sourceCategory (e.g. "board", "medium",
   * "gradeLevel", "subject").  When provided, fields whose `sourceCategory`
   * matches a key will be populated from this map instead of falling back to
   * `field.range` / `field.enum`.
   *
   * Each term has shape: { name, identifier, code }
   * — `identifier` is used as the option value, `name` as the visible label.
   */
  frameworkTerms?: Map<string, FrameworkTerm[]>;
}

// ---------------------------------------------------------------------------
// Timer helpers — convert seconds ↔ HH:mm:ss
// ---------------------------------------------------------------------------

function secondsToHms(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

function hmsToSeconds(hms: string): number {
  const parts = hms.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return Number(hms) || 0;
}

// ---------------------------------------------------------------------------
// Types for range items (framework-driven options)
// ---------------------------------------------------------------------------

interface RangeItem {
  name: string;
  identifier: string;
}

function isRangeItem(v: unknown): v is RangeItem {
  return typeof v === 'object' && v !== null && 'name' in v && 'identifier' in v;
}

// ---------------------------------------------------------------------------
// Field section matching logic
// ---------------------------------------------------------------------------

/**
 * A field is shown in a tab when:
 *  - `section` prop is undefined  →  show fields that have no section, or
 *    whose section is not one of the named tabs (they fall into "Details").
 *  - `section` prop is defined    →  show only fields whose `field.section`
 *    exactly matches the prop.
 */
const NAMED_SECTIONS = ['Audience & Curriculum', 'Licensing'];

function fieldMatchesSection(field: ICategoryField, section?: string): boolean {
  if (section === undefined) {
    // Details tab: include fields with no section or unknown section
    return !field.section || !NAMED_SECTIONS.includes(field.section);
  }
  return field.section === section;
}

// ---------------------------------------------------------------------------
// Build per-field Zod validator (returns error message string | undefined)
// ---------------------------------------------------------------------------

function makeFieldValidator(field: ICategoryField) {
  return (value: unknown): string | true => {
    const inputType = field.inputType ?? 'text';

    if (inputType === 'multiselect' || inputType === 'keywords') {
      const arr = Array.isArray(value) ? value : [];
      if (field.required && arr.length === 0) {
        return `${field.label} is required`;
      }
      return true;
    }

    if (inputType === 'checkbox') {
      // checkboxes are never "required" in the traditional sense
      return true;
    }

    const str = value !== undefined && value !== null ? String(value).trim() : '';

    if (field.required && str.length === 0) {
      return `${field.label} is required`;
    }

    if (field.maxLength && str.length > field.maxLength) {
      return `${field.label} must be at most ${field.maxLength} characters`;
    }

    return true;
  };
}

// ---------------------------------------------------------------------------
// Helpers — build select/multiselect options
// ---------------------------------------------------------------------------

interface SelectOption {
  value: string;
  label: string;
}

function buildOptions(
  field: ICategoryField,
  frameworkTerms?: Map<string, FrameworkTerm[]>,
): SelectOption[] {
  // 1. Framework terms map — highest priority when sourceCategory is set
  if (field.sourceCategory && frameworkTerms) {
    const terms = frameworkTerms.get(field.sourceCategory);
    if (terms && terms.length > 0) {
      return terms.map((t) => ({ value: t.identifier, label: t.name }));
    }
  }

  // 2. Inline range (framework-driven, array of { name, identifier })
  if (Array.isArray(field.range)) {
    return (field.range as unknown[])
      .filter(isRangeItem)
      .map((item) => ({ value: item.identifier, label: item.name }));
  }

  // 3. Enum — plain string array
  if (Array.isArray(field.enum)) {
    return (field.enum as string[]).map((v) => ({ value: v, label: v }));
  }

  return [];
}

// ---------------------------------------------------------------------------
// Build default values for react-hook-form from external `values` prop
// ---------------------------------------------------------------------------

function buildDefaultValues(
  fields: ICategoryField[],
  values: Record<string, unknown>,
  section?: string,
): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const f of fields) {
    if (!f.visible || !fieldMatchesSection(f, section)) continue;
    const v = values[f.code];
    if (f.inputType === 'multiselect' || f.inputType === 'keywords') {
      defaults[f.code] = Array.isArray(v) ? v : v ? [v] : [];
    } else if (f.inputType === 'checkbox') {
      defaults[f.code] = Boolean(v);
    } else {
      defaults[f.code] = v !== undefined && v !== null ? String(v) : '';
    }
  }
  return defaults;
}

// ---------------------------------------------------------------------------
// Keyword chips sub-component
// ---------------------------------------------------------------------------

interface KeywordChipsProps {
  value: string[];
  onChange: (v: string[]) => void;
  readOnly?: boolean;
  placeholder?: string;
  fieldId: string;
}

const KeywordChips: React.FC<KeywordChipsProps> = ({
  value,
  onChange,
  readOnly = false,
  placeholder = 'Type and press Enter or comma…',
  fieldId,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const addChip = useCallback(
    (raw: string) => {
      const parts = raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length === 0) return;
      const next = [...new Set([...value, ...parts])];
      onChange(next);
    },
    [value, onChange],
  );

  const removeChip = useCallback(
    (chip: string) => {
      onChange(value.filter((v) => v !== chip));
    },
    [value, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const inputVal = inputRef.current?.value ?? '';
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addChip(inputVal);
        if (inputRef.current) inputRef.current.value = '';
      } else if (e.key === 'Backspace' && !inputVal && value.length > 0) {
        onChange(value.slice(0, -1));
      }
    },
    [addChip, value, onChange],
  );

  const handleBlur = useCallback(() => {
    const val = inputRef.current?.value ?? '';
    if (val.trim()) {
      addChip(val);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [addChip]);

  return (
    <div className={styles.chips} aria-label="Keywords">
      {value.map((chip) => (
        <span key={chip} className={styles.chip}>
          <span className={styles.chipLabel}>{chip}</span>
          {!readOnly && (
            <button
              type="button"
              className={styles.chipRemove}
              onClick={() => removeChip(chip)}
              aria-label={`Remove ${chip}`}
            >
              <Icon name="x" size={10} />
            </button>
          )}
        </span>
      ))}
      {!readOnly && (
        <input
          ref={inputRef}
          id={fieldId}
          type="text"
          className={styles.chipsInput}
          placeholder={value.length === 0 ? placeholder : ''}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          aria-label="Add keyword"
        />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// AppIconPicker — image thumbnail that opens ImagePickerModal on click
// ---------------------------------------------------------------------------

function AppIconPicker({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled: boolean;
  onChange: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => !disabled && setOpen(true)}
        title={disabled ? undefined : 'Click to change icon'}
        style={{
          width: 72, height: 72, borderRadius: 14, border: '1.5px dashed var(--sb-border)',
          background: 'var(--sb-bg)', cursor: disabled ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', padding: 0, flexShrink: 0,
          transition: 'border-color .14s',
        }}
      >
        {value ? (
          <img src={value} alt="icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Icon name="image" size={28} style={{ color: 'var(--sb-text-faint)' }} />
        )}
      </button>
      {open && (
        <ImagePickerModal
          onSelect={(url) => { onChange(url); setOpen(false); }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// SparkMetaForm
// ---------------------------------------------------------------------------

const SparkMetaForm: React.FC<SparkMetaFormProps> = ({
  fields,
  values,
  onChange,
  onValidityChange,
  readOnly = false,
  section,
  frameworkTerms,
}) => {
  // Filter to only visible fields for this section
  // appIcon is handled by the card-header thumbnail, not the form.
  const visibleFields = fields.filter(
    (f) => f.visible && f.inputType !== 'appIcon' && fieldMatchesSection(f, section),
  );

  const {
    control,
    formState: { errors, isValid },
    reset,
    trigger,
  } = useForm({
    defaultValues: buildDefaultValues(fields, values, section),
    mode: 'onChange',
  });

  // Sync form values when external `values` or `section` changes (e.g. node switch / tab change)
  useEffect(() => {
    reset(buildDefaultValues(fields, values, section));
    // Re-trigger validation after reset
    void trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values), section]);

  // Notify parent of validity changes
  useEffect(() => {
    onValidityChange?.(isValid);
  }, [isValid, onValidityChange]);

  if (visibleFields.length === 0) {
    return (
      <p className={styles.emptyMessage}>
        No fields available for this section.
      </p>
    );
  }

  return (
    <form
      className={styles.form}
      noValidate
      aria-label="Metadata form"
      onSubmit={(e) => e.preventDefault()}
    >
      {visibleFields.map((field) => {
        const fieldId = `smf-${field.code}`;
        const error = errors[field.code];
        const isDisabled = readOnly || !field.editable;
        const validator = makeFieldValidator(field);

        // Full-width: textarea, richtext, keywords/chips, multiselect, checkbox, time, appIcon
        const isFullWidth = ['textarea', 'richtext', 'keywords', 'checkbox', 'time', 'appIcon'].includes(field.inputType ?? '')
          || field.span === 'full';
        const fieldClass = [styles.field, isFullWidth ? styles.fieldFull : ''].filter(Boolean).join(' ');

        // showTimer: separator above + no separate label (label is inline with checkbox)
        const isShowTimer = field.code === 'showTimer';

        return (
          <div key={field.code} className={fieldClass}>
            {isShowTimer && (
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--sb-border)', margin: '8px 0 4px' }} />
            )}
            {/* Label — hidden for showTimer (text shown inside the checkbox row) */}
            {!isShowTimer && (
            <label className={styles.label} htmlFor={fieldId}>
              {field.label}
              {field.required && (
                <span className={styles.required} aria-label="required">
                  {' '}*
                </span>
              )}
            </label>
            )}

            {/* Field control */}
            <Controller
              name={field.code}
              control={control}
              rules={{ validate: validator }}
              render={({ field: rhfField }) => {
                const inputType = field.inputType ?? 'text';

                // ── richtext — renders HTML content via ContentEditable ───
                if (inputType === 'richtext') {
                  return (
                    <ContentEditable
                      value={String(rhfField.value ?? '')}
                      onChange={(html) => { rhfField.onChange(html); onChange(field.code, html); }}
                      placeholder={field.placeholder ?? ''}
                      disabled={isDisabled}
                      minHeight={90}
                      bodyClass="stem-field"
                    />
                  );
                }

                // ── textarea ──────────────────────────────────────────────
                if (inputType === 'textarea') {
                  return (
                    <textarea
                      id={fieldId}
                      className={`${styles.textarea} ${error ? styles.inputError : ''}`}
                      value={String(rhfField.value ?? '')}
                      onChange={(e) => {
                        rhfField.onChange(e.target.value);
                        onChange(field.code, e.target.value);
                      }}
                      onBlur={rhfField.onBlur}
                      disabled={isDisabled}
                      readOnly={readOnly}
                      placeholder={field.placeholder ?? ''}
                      maxLength={field.maxLength}
                      rows={4}
                      aria-invalid={!!error}
                      aria-describedby={error ? `${fieldId}-error` : undefined}
                    />
                  );
                }

                // ── select (single) ───────────────────────────────────────
                if (inputType === 'select') {
                  const options = buildOptions(field, frameworkTerms);
                  return (
                    <select
                      id={fieldId}
                      className={`${styles.select} ${error ? styles.inputError : ''}`}
                      value={String(rhfField.value ?? '')}
                      onChange={(e) => {
                        rhfField.onChange(e.target.value);
                        onChange(field.code, e.target.value);
                      }}
                      onBlur={rhfField.onBlur}
                      disabled={isDisabled}
                      aria-invalid={!!error}
                      aria-describedby={error ? `${fieldId}-error` : undefined}
                    >
                      <option value="">{field.placeholder ?? `Select ${field.label}`}</option>
                      {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  );
                }

                // ── multiselect — rendered as a single dropdown ───────────
                if (inputType === 'multiselect') {
                  const options = buildOptions(field, frameworkTerms);
                  const currentVal = Array.isArray(rhfField.value)
                    ? (rhfField.value as string[])[0] ?? ''
                    : String(rhfField.value ?? '');

                  return (
                    <select
                      id={fieldId}
                      className={`${styles.select} ${error ? styles.inputError : ''}`}
                      value={currentVal}
                      onChange={(e) => {
                        const val = e.target.value ? [e.target.value] : [];
                        rhfField.onChange(val);
                        onChange(field.code, val);
                      }}
                      onBlur={rhfField.onBlur}
                      disabled={isDisabled}
                      aria-invalid={!!error}
                      aria-describedby={error ? `${fieldId}-error` : undefined}
                    >
                      <option value="">Select…</option>
                      {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  );
                }

                // ── checkbox ──────────────────────────────────────────────
                if (inputType === 'checkbox') {
                  return (
                    <div className={styles.checkboxRow}>
                      <input
                        id={fieldId}
                        type="checkbox"
                        className={styles.checkbox}
                        checked={Boolean(rhfField.value)}
                        onChange={(e) => {
                          rhfField.onChange(e.target.checked);
                          onChange(field.code, e.target.checked);
                        }}
                        onBlur={rhfField.onBlur}
                        disabled={isDisabled}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${fieldId}-error` : undefined}
                      />
                      <span className={styles.checkboxLabel}
                        style={isShowTimer ? { fontWeight: 700, fontSize: 15 } : undefined}>
                        {field.label ?? field.placeholder ?? ''}
                      </span>
                    </div>
                  );
                }

                // ── date ──────────────────────────────────────────────────
                if (inputType === 'date') {
                  return (
                    <input
                      id={fieldId}
                      type="date"
                      className={`${styles.input} ${error ? styles.inputError : ''}`}
                      value={String(rhfField.value ?? '')}
                      onChange={(e) => {
                        rhfField.onChange(e.target.value);
                        onChange(field.code, e.target.value);
                      }}
                      onBlur={rhfField.onBlur}
                      disabled={isDisabled}
                      readOnly={readOnly}
                      aria-invalid={!!error}
                      aria-describedby={error ? `${fieldId}-error` : undefined}
                    />
                  );
                }

                // ── keywords (comma-separated with chips) ─────────────────
                if (inputType === 'keywords') {
                  const currentVal = Array.isArray(rhfField.value)
                    ? (rhfField.value as string[])
                    : [];
                  return (
                    <KeywordChips
                      fieldId={fieldId}
                      value={currentVal}
                      onChange={(next) => {
                        rhfField.onChange(next);
                        onChange(field.code, next);
                      }}
                      readOnly={isDisabled}
                      placeholder={field.placeholder}
                    />
                  );
                }

                // ── timer — HH : mm split inputs ─────────────────────────
                if (inputType === 'timepicker' || inputType === 'timer' || field.code === 'maxTime' || field.code === 'warningTime') {
                  const numVal = Number(rhfField.value) || 0;
                  const hms    = secondsToHms(numVal).split(':');
                  const hh = hms[0] ?? '00';
                  const mm = hms[1] ?? '00';
                  const update = (newHH: string, newMM: string) => {
                    const secs = hmsToSeconds(`${newHH.padStart(2,'0')}:${newMM.padStart(2,'0')}:00`);
                    rhfField.onChange(secs);
                    onChange(field.code, secs);
                  };
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="text" maxLength={2} placeholder="HH"
                        className={styles.input}
                        style={{ width: 72, textAlign: 'center' }}
                        value={hh === '00' ? '' : hh}
                        onChange={e => update(e.target.value.replace(/\D/g,''), mm)}
                        onBlur={rhfField.onBlur}
                        disabled={isDisabled}
                      />
                      <span style={{ fontWeight: 700, color: 'var(--sb-text-muted)', fontSize: 18 }}>:</span>
                      <input
                        type="text" maxLength={2} placeholder="mm"
                        className={styles.input}
                        style={{ width: 72, textAlign: 'center' }}
                        value={mm === '00' ? '' : mm}
                        onChange={e => update(hh, e.target.value.replace(/\D/g,''))}
                        onBlur={rhfField.onBlur}
                        disabled={isDisabled}
                      />
                    </div>
                  );
                }

                // ── appIcon — clickable image thumbnail picker ────────────
                if (inputType === 'appIcon') {
                  return (
                    <AppIconPicker
                      value={String(rhfField.value ?? '')}
                      disabled={isDisabled}
                      onChange={(url) => { rhfField.onChange(url); onChange(field.code, url); }}
                    />
                  );
                }

                // ── text (default / unknown inputType fallback) ────────────
                return (
                  <input
                    id={fieldId}
                    type="text"
                    className={`${styles.input} ${error ? styles.inputError : ''}`}
                    value={String(rhfField.value ?? '')}
                    onChange={(e) => {
                      rhfField.onChange(e.target.value);
                      onChange(field.code, e.target.value);
                    }}
                    onBlur={rhfField.onBlur}
                    disabled={isDisabled}
                    readOnly={readOnly}
                    placeholder={field.placeholder ?? ''}
                    maxLength={field.maxLength}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${fieldId}-error` : undefined}
                  />
                );
              }}
            />

            {/* Validation error message */}
            {error && (
              <span
                id={`${fieldId}-error`}
                className={styles.error}
                role="alert"
                aria-live="polite"
              >
                {String((error as { message?: string }).message ?? 'Invalid value')}
              </span>
            )}
          </div>
        );
      })}
    </form>
  );
};

export default SparkMetaForm;
