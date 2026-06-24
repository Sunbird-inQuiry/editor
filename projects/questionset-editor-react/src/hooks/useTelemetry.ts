import { useEffect } from 'react';
import { useEditorStore } from '../store/editor.store';

interface TelemetryEvent {
  eid: string;
  ets: number;
  ver: string;
  mid: string;
  actor: { id: string; type: string };
  context: Record<string, unknown>;
  object?: Record<string, unknown>;
  edata: Record<string, unknown>;
}

function makeMid() {
  return Math.random().toString(36).slice(2, 11);
}

export function useTelemetry() {
  const config = useEditorStore((s) => s.editorConfig);

  useEffect(() => {
    if (!config) return;
    const startEvent: TelemetryEvent = {
      eid: 'START',
      ets: Date.now(),
      ver: '3.0',
      mid: makeMid(),
      actor: { id: config.context.userId, type: 'User' },
      context: {
        channel: config.context.channel,
        pdata: config.context.pdata,
        env: config.context.env,
        sid: config.context.sid,
        did: config.context.did,
      },
      object: config.context.contentId
        ? { id: config.context.contentId, type: config.config.objectType }
        : undefined,
      edata: { type: 'editor', pageid: 'questionset_editor', uaspec: {} },
    };
    console.debug('[telemetry] START', startEvent);

    return () => {
      const endEvent: TelemetryEvent = { ...startEvent, eid: 'END', ets: Date.now(), mid: makeMid() };
      console.debug('[telemetry] END', endEvent);
    };
  }, [config]);

  const logInteract = (id: string, type = 'click') => {
    if (!config) return;
    console.debug('[telemetry] INTERACT', { id, type });
  };

  return { logInteract };
}
