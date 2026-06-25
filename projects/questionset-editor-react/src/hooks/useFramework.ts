import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEditorStore } from '../store/editor.store';
import { getFramework } from '../api/framework';
import type { IFramework, ITerm } from '../types/framework';

export function useFramework() {
  const config = useEditorStore((s) => s.editorConfig);
  const frameworkIds = config?.context?.framework ? [config.context.framework] : (config?.config?.framework ?? []);
  const targetFWIds = config?.context?.targetFWIds ?? config?.config?.targetFWIds ?? [];

  const orgFrameworkId = frameworkIds[0] ?? '';

  const orgQuery = useQuery<IFramework>({
    queryKey: ['framework', orgFrameworkId],
    queryFn: () => getFramework(orgFrameworkId),
    enabled: !!orgFrameworkId,
    staleTime: 10 * 60 * 1000,
  });

  const targetQueries = targetFWIds.map((fwId) => ({
    queryKey: ['framework', fwId],
    queryFn: () => getFramework(fwId as string),
    staleTime: 10 * 60 * 1000,
  }));

  const frameworkTerms = useMemo<Map<string, Array<ITerm>>>(() => {
    const map = new Map<string, Array<ITerm>>();
    if (orgQuery.data?.categories) {
      for (const cat of orgQuery.data.categories) {
        map.set(cat.code, cat.terms ?? []);
      }
    }
    return map;
  }, [orgQuery.data]);

  return {
    orgFramework: orgQuery.data,
    isLoading: orgQuery.isLoading,
    targetFrameworkIds: targetFWIds as string[],
    frameworkTerms,
  };
}
