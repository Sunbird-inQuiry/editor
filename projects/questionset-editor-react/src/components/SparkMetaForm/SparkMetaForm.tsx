import React, { useEffect, useCallback, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X } from 'lucide-react';
import type { ICategoryField } from '../../api/categoryDefinition';
import styles from './SparkMetaForm.module.scss';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

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

function buildOptions(field: ICategoryField): SelectOption[] {
  // range takes precedence (framework-driven, array of { name, identifier })
  if (Array.isArray(field.range)) {
    return (field.range as unknown[])
      .filter(isRangeItem)
      .map((item) => ({ value: item.identifier, label: item.name }));
  }

  // enum — plain string array
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
              <X size={10} aria-hidden="true" />
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
// SparkMetaForm
// ---------------------------------------------------------------------------

const SparkMetaForm: React.FC<SparkMetaFormProps> = ({
  fields,
  values,
  onChange,
  onValidityChange,
  readOnly = false,
  section,
}) => {
  // Filter to only visible fields for this section
  const visibleFields = fields.filter(
    (f) => f.visible && fieldMatchesSection(f, section),
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

        return (
          <div key={field.code} className={styles.field}>
            {/* Label */}
            <label className={styles.label} htmlFor={fieldId}>
              {field.label}
              {field.required && (
                <span className={styles.required} aria-label="required">
                  {' '}*
                </span>
              )}
            </label>

            {/* Field control */}
            <Controller
              name={field.code}
              control={control}
              rules={{ validate: validator }}
              render={({ field: rhfField }) => {
                const inputType = field.inputType ?? 'text';

                // ── textarea ──────────────────────────────────────────────
                if (inputType === 'textarea' || inputType === 'richtext') {
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
                  const options = buildOptions(field);
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

                // ── multiselect ───────────────────────────────────────────
                if (inputType === 'multiselect') {
                  const options = buildOptions(field);
                  const currentVal = Array.isArray(rhfField.value)
                    ? (rhfField.value as string[])
                    : [];

                  // Framework data not yet loaded; render disabled placeholder
                  if (options.length === 0 && field.sourceCategory) {
                    return (
                      <select
                        id={fieldId}
                        className={styles.select}
                        disabled
                        aria-label={`${field.label} — loading options…`}
                      >
                        <option>Loading {field.sourceCategory}…</option>
                      </select>
                    );
                  }

                  return (
                    <select
                      id={fieldId}
                      className={`${styles.select} ${error ? styles.inputError : ''}`}
                      multiple
                      size={Math.min(options.length || 4, 6)}
                      value={currentVal}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions).map(
                          (o) => o.value,
                        );
                        rhfField.onChange(selected);
                        onChange(field.code, selected);
                      }}
                      onBlur={rhfField.onBlur}
                      disabled={isDisabled}
                      aria-invalid={!!error}
                      aria-describedby={error ? `${fieldId}-error` : undefined}
                    >
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
                      <span className={styles.checkboxLabel}>
                        {field.placeholder ?? ''}
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
