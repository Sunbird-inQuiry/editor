/**
 * Telemetry emitter — parity with the old editor's telemetry.service.ts:
 * START / END / IMPRESSION / INTERACT / ERROR events with the standard
 * Sunbird envelope, batched (size 20 like the old CsTelemetryModule config)
 * and POSTed to `${context.host}${context.endpoint || '/data/v3/telemetry'}`.
 * When the host page provides window.EkTelemetry, events are handed to it
 * instead of the internal batcher.
 */
import type { IContext } from '../types/editor';

declare global {
  interface Window {
    EkTelemetry?: Record<string, (data: Record<string, unknown>) => void>;
  }
}

const BATCH_SIZE = 20;
const VER = '3.0';

let ctx: IContext | null = null;
let objectId = '';
let pageId = 'questionset_editor';
let buffer: Array<Record<string, unknown>> = [];

function mid(): string {
  return `QS:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function endpointUrl(): string {
  const host = ctx?.host ?? '';
  const endpoint = ctx?.endpoint || '/data/v3/telemetry';
  return `${host}${endpoint}`;
}

function buildEvent(eid: string, edata: Record<string, unknown>): Record<string, unknown> {
  return {
    eid,
    ets: Date.now(),
    ver: VER,
    mid: mid(),
    actor: { id: ctx?.user?.id ?? ctx?.userId ?? ctx?.uid ?? 'anonymous', type: 'User' },
    context: {
      channel: ctx?.channel ?? '',
      pdata: ctx?.pdata ?? { id: 'sunbird-questionset-editor', ver: '1.0' },
      env: ctx?.env ?? 'questionset_editor',
      sid: ctx?.sid ?? '',
      did: ctx?.did ?? '',
      cdata: ctx?.cdata ?? [],
      rollup: ctx?.contextRollup ?? ctx?.rollup ?? {},
    },
    object: objectId
      ? { id: objectId, type: 'QuestionSet', ver: '1.0', rollup: ctx?.objectRollup ?? {} }
      : undefined,
    edata,
  };
}

function flush(useBeacon = false): void {
  if (!buffer.length || !ctx) return;
  const events = buffer;
  buffer = [];
  const payload = JSON.stringify({
    id: 'api.sunbird.telemetry',
    ver: VER,
    params: { msgid: mid() },
    ets: Date.now(),
    events,
  });
  const url = endpointUrl();
  try {
    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
      return;
    }
    void fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(ctx.authToken ? { Authorization: `Bearer ${ctx.authToken}` } : {}),
      },
      body: payload,
      keepalive: true,
    }).catch(() => { /* telemetry must never break the editor */ });
  } catch { /* ignore */ }
}

function dispatch(eid: string, edata: Record<string, unknown>): void {
  if (!ctx) return;
  const method = eid.toLowerCase();
  const ek = window.EkTelemetry;
  if (ek && typeof ek[method] === 'function') {
    ek[method]!(buildEvent(eid, edata));
    return;
  }
  buffer.push(buildEvent(eid, edata));
  if (buffer.length >= BATCH_SIZE) flush();
}

// ── Public API (old telemetry.service parity) ───────────────────────────────

export function initTelemetry(context: IContext, contentId: string): void {
  ctx = context;
  objectId = contentId;
}

export function setTelemetryPageId(id: string): void {
  pageId = id;
}

export function telemetryStart(): void {
  dispatch('START', { type: 'editor', pageid: pageId, mode: 'edit', uaspec: {} });
}

export function telemetryEnd(): void {
  dispatch('END', { type: 'editor', pageid: pageId });
  flush(true);
}

export function telemetryImpression(pageid = pageId): void {
  dispatch('IMPRESSION', { type: 'edit', pageid, uri: '' });
}

export function telemetryInteract(id: string, pageid = pageId): void {
  dispatch('INTERACT', { type: 'click', id, pageid });
}

export function telemetryError(err: string, errtype = 'SYSTEM'): void {
  dispatch('ERROR', { err, errtype, stacktrace: '' });
}

export function flushTelemetry(): void {
  flush(true);
}
