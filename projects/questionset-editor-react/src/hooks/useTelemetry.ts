import { useEffect } from 'react';
import { useEditorStore } from '../store/editor.store';
import { getContentId } from '../utils/context';
import {
  initTelemetry,
  telemetryStart,
  telemetryEnd,
  telemetryImpression,
  telemetryInteract,
} from '../utils/telemetry';

/**
 * Telemetry lifecycle — old editor parity: init with the host context, fire
 * START + the first IMPRESSION on mount, END (with a final flush) on unmount.
 */
export function useTelemetry() {
  const config = useEditorStore((s) => s.editorConfig);

  useEffect(() => {
    if (!config) return;
    initTelemetry(config.context, getContentId(config.context));
    telemetryStart();
    telemetryImpression();
    return () => telemetryEnd();
  }, [config]);

  return { logInteract: telemetryInteract };
}
