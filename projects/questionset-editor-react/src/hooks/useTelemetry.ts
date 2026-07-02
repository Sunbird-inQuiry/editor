declare global {
  interface Window {
    EkTelemetry?: {
      start: (config: Record<string, unknown>) => void;
      impression: (data: Record<string, unknown>) => void;
      interact: (data: Record<string, unknown>) => void;
      error: (data: Record<string, unknown>) => void;
      end: (data: Record<string, unknown>) => void;
    };
  }
}

import { useEffect } from 'react';
import { useEditorStore } from '../store/editor.store';
import { getContentId, getUserId } from '../utils/context';

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
      actor: { id: getUserId(config.context), type: 'User' },
      context: {
        channel: config.context.channel,
        pdata: config.context.pdata,
        env: config.context.env,
        sid: config.context.sid,
        did: config.context.did,
      },
      object: getContentId(config.context)
        ? { id: getContentId(config.context), type: config.config.objectType }
        : undefined,
      edata: { type: 'editor', pageid: 'questionset_editor', uaspec: {} },
    };
    if (window.EkTelemetry) {
      window.EkTelemetry.start(startEvent as unknown as Record<string, unknown>);
    } else {
      console.debug('[telemetry] START', startEvent);
    }

    return () => {
      const endEvent: TelemetryEvent = { ...startEvent, eid: 'END', ets: Date.now(), mid: makeMid() };
      if (window.EkTelemetry) {
        window.EkTelemetry.end(endEvent as unknown as Record<string, unknown>);
      } else {
        console.debug('[telemetry] END', endEvent);
      }
    };
  }, [config]);

  const logInteract = (id: string, type = 'click') => {
    if (!config) return;
    const data = { id, type };
    if (window.EkTelemetry) {
      window.EkTelemetry.interact(data);
    } else {
      console.debug('[telemetry] INTERACT', data);
    }
  };

  return { logInteract };
}
