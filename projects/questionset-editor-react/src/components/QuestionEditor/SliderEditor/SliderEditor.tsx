import React, { useState, useId } from 'react';
import styles from './SliderEditor.module.scss';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SliderConfig {
  min: number;
  max: number;
  step: number;
  minLabel: string;
  maxLabel: string;
}

export interface SliderEditorProps {
  /** Initial/controlled config — omit for uncontrolled defaults. */
  value?: Partial<SliderConfig>;
  /** Called whenever any config value changes and the config is valid. */
  onChange?: (config: SliderConfig) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clampedStep(step: number): number {
  return Math.max(1, Math.floor(step));
}

/** Generate the preview tick values for the current range + step. */
function buildTicks(min: number, max: number, step: number): number[] {
  const ticks: number[] = [];
  // Guard against infinite loops from bad input during editing
  if (min >= max || step <= 0 || (max - min) / step > 50) return ticks;
  for (let v = min; v <= max; v += step) {
    ticks.push(v);
  }
  return ticks;
}

// ---------------------------------------------------------------------------
// SliderEditor
// ---------------------------------------------------------------------------

const SliderEditor: React.FC<SliderEditorProps> = ({ value, onChange }) => {
  const uid = useId();
  const id = (suffix: string) => `${uid}-${suffix}`;

  // ── local state ────────────────────────────────────────────────────────────
  const [min, setMin] = useState<number>(value?.min ?? 1);
  const [max, setMax] = useState<number>(value?.max ?? 5);
  const [step, setStep] = useState<number>(value?.step ?? 1);
  const [minLabel, setMinLabel] = useState<string>(value?.minLabel ?? '');
  const [maxLabel, setMaxLabel] = useState<string>(value?.maxLabel ?? '');

  // ── derived validation ─────────────────────────────────────────────────────
  const minGtMax = min >= max;
  const stepInvalid = step < 1;
  const isValid = !minGtMax && !stepInvalid;

  // ── notify parent when config is valid ────────────────────────────────────
  function notify(
    nextMin: number,
    nextMax: number,
    nextStep: number,
    nextMinLabel: string,
    nextMaxLabel: string,
  ) {
    if (nextMin < nextMax && nextStep >= 1) {
      onChange?.({
        min: nextMin,
        max: nextMax,
        step: nextStep,
        minLabel: nextMinLabel,
        maxLabel: nextMaxLabel,
      });
    }
  }

  // ── handlers ───────────────────────────────────────────────────────────────
  function handleMin(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseInt(e.target.value, 10);
    if (isNaN(v)) return;
    setMin(v);
    notify(v, max, step, minLabel, maxLabel);
  }

  function handleMax(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseInt(e.target.value, 10);
    if (isNaN(v)) return;
    setMax(v);
    notify(min, v, step, minLabel, maxLabel);
  }

  function handleStep(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseInt(e.target.value, 10);
    if (isNaN(v)) return;
    const clamped = clampedStep(v);
    setStep(clamped);
    notify(min, max, clamped, minLabel, maxLabel);
  }

  function handleMinLabel(e: React.ChangeEvent<HTMLInputElement>) {
    setMinLabel(e.target.value);
    notify(min, max, step, e.target.value, maxLabel);
  }

  function handleMaxLabel(e: React.ChangeEvent<HTMLInputElement>) {
    setMaxLabel(e.target.value);
    notify(min, max, step, minLabel, e.target.value);
  }

  // ── preview ticks ──────────────────────────────────────────────────────────
  const ticks = isValid ? buildTicks(min, max, step) : [];

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.container} aria-label="Slider configuration">
      <h3 className={styles.sectionTitle}>Slider Configuration</h3>

      {/* ── number config row ── */}
      <div className={styles.configGrid}>
        {/* Min */}
        <div className={styles.configField}>
          <label className={styles.configLabel} htmlFor={id('min')}>
            Min Value
          </label>
          <input
            id={id('min')}
            type="number"
            className={`${styles.numberInput} ${minGtMax ? styles.inputError : ''}`}
            value={min}
            onChange={handleMin}
            aria-invalid={minGtMax}
            aria-describedby={minGtMax ? id('min-err') : undefined}
          />
          {minGtMax && (
            <span id={id('min-err')} className={styles.errorMsg} role="alert">
              Min must be less than Max
            </span>
          )}
        </div>

        {/* Max */}
        <div className={styles.configField}>
          <label className={styles.configLabel} htmlFor={id('max')}>
            Max Value
          </label>
          <input
            id={id('max')}
            type="number"
            className={`${styles.numberInput} ${minGtMax ? styles.inputError : ''}`}
            value={max}
            onChange={handleMax}
            aria-invalid={minGtMax}
          />
        </div>

        {/* Step */}
        <div className={styles.configField}>
          <label className={styles.configLabel} htmlFor={id('step')}>
            Step
          </label>
          <input
            id={id('step')}
            type="number"
            min={1}
            className={`${styles.numberInput} ${stepInvalid ? styles.inputError : ''}`}
            value={step}
            onChange={handleStep}
            aria-invalid={stepInvalid}
            aria-describedby={stepInvalid ? id('step-err') : undefined}
          />
          {stepInvalid && (
            <span id={id('step-err')} className={styles.errorMsg} role="alert">
              Step must be at least 1
            </span>
          )}
        </div>
      </div>

      {/* ── label config row ── */}
      <div className={styles.labelGrid}>
        <div className={styles.configField}>
          <label className={styles.configLabel} htmlFor={id('minLabel')}>
            Min Label
          </label>
          <input
            id={id('minLabel')}
            type="text"
            className={styles.textInput}
            value={minLabel}
            onChange={handleMinLabel}
            placeholder="e.g. Strongly Disagree"
          />
        </div>

        <div className={styles.configField}>
          <label className={styles.configLabel} htmlFor={id('maxLabel')}>
            Max Label
          </label>
          <input
            id={id('maxLabel')}
            type="text"
            className={styles.textInput}
            value={maxLabel}
            onChange={handleMaxLabel}
            placeholder="e.g. Strongly Agree"
          />
        </div>
      </div>

      {/* ── preview ── */}
      <div className={styles.previewSection}>
        <span className={styles.previewTitle}>Preview</span>

        {!isValid && (
          <p className={styles.previewHint}>
            Fix validation errors above to see the preview.
          </p>
        )}

        {isValid && ticks.length === 0 && (
          <p className={styles.previewHint}>
            Range too large for the current step — adjust values to see preview.
          </p>
        )}

        {isValid && ticks.length > 0 && (
          <>
            <div className={styles.previewTrack} role="img" aria-label="Slider preview">
              {ticks.map((tick) => (
                <div key={tick} className={styles.tickWrapper}>
                  <div className={styles.previewCircle}>{tick}</div>
                </div>
              ))}
            </div>

            <div className={styles.previewEndLabels}>
              <span className={styles.endLabel}>{minLabel || String(min)}</span>
              <span className={styles.endLabel}>{maxLabel || String(max)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SliderEditor;
