/**
 * telemetry.ts — lightweight telemetry utility.
 *
 * All functions currently emit console.debug messages prefixed with [telemetry].
 * Replace the bodies with real Sunbird Telemetry SDK calls once integrated.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TelemetryConfig {
  /** Sunbird environment (e.g. "staging", "production"). */
  env: string;
  /** Channel ID. */
  channel: string;
  /** Producer data — id, version, pid. */
  pdata: { id: string; ver: string; pid?: string };
  /** User ID. */
  uid?: string;
  /** Device ID. */
  did?: string;
  /** Session ID. */
  sid?: string;
  /** Rollup object. */
  rollup?: Record<string, string>;
  /** Optional tags. */
  tags?: string[];
}

// ---------------------------------------------------------------------------
// Module-level state
// ---------------------------------------------------------------------------

let _config: TelemetryConfig | null = null;
let _initialised = false;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Initialise the telemetry module with the given config.
 * Must be called before any other telemetry functions are used.
 */
export function initTelemetry(config: Record<string, unknown>): void {
  _config = config as unknown as TelemetryConfig;
  _initialised = true;
  console.debug('[telemetry] initialised', _config);
}

/**
 * Log a generic telemetry event.
 *
 * @param eid   - Event ID (e.g. "INTERACT", "IMPRESSION", "START", "END").
 * @param edata - Event-specific payload.
 */
export function logEvent(eid: string, edata: Record<string, unknown>): void {
  if (!_initialised) {
    console.debug('[telemetry] not initialised — skipping event', eid, edata);
    return;
  }
  console.debug('[telemetry] event', { eid, edata, ts: Date.now() });
}

/**
 * Log an INTERACT telemetry event.
 *
 * @param id   - Element/action ID being interacted with.
 * @param type - Interaction type (e.g. "click", "touch"). Defaults to "click".
 */
export function logInteract(id: string, type = 'click'): void {
  logEvent('INTERACT', { type, id });
}

/**
 * Log an IMPRESSION telemetry event.
 *
 * @param type    - Impression type (e.g. "view", "detail").
 * @param subtype - Optional subtype (e.g. "paginate").
 */
export function logImpression(type: string, subtype?: string): void {
  logEvent('IMPRESSION', { type, ...(subtype ? { subtype } : {}) });
}
