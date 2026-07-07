import { useMemo } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
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

  // Old editor reads every target framework too (setTargetFrameworkData).
  const targetResults = useQueries({
    queries: targetFWIds.map((fwId) => ({
      queryKey: ['framework', fwId],
      queryFn: () => getFramework(fwId as string),
      enabled: !!fwId,
      staleTime: 10 * 60 * 1000,
    })),
  });
  const targetDatas = targetResults.map((q) => q.data);
  const targetData = targetDatas.filter(Boolean) as IFramework[];
  // Scalar dep — an array spread would change the deps length as queries
  // resolve (or when targetFWIds itself changes), violating the Rules of Hooks.
  const targetKey = targetDatas.map((d) => d?.identifier ?? '').join(',');

  const frameworkTerms = useMemo<Map<string, Array<ITerm>>>(() => {
    const map = new Map<string, Array<ITerm>>();
    const addCategories = (fw?: IFramework) => {
      for (const cat of fw?.categories ?? []) {
        const existing = map.get(cat.code) ?? [];
        const seen = new Set(existing.map((t) => t.identifier));
        const merged = [...existing, ...(cat.terms ?? []).filter((t) => !seen.has(t.identifier))];
        map.set(cat.code, merged);
      }
    };
    addCategories(orgQuery.data);
    targetData.forEach(addCategories);
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgQuery.data, targetKey]);

  return {
    orgFramework: orgQuery.data,
    targetFrameworks: targetData,
    isLoading: orgQuery.isLoading,
    targetFrameworkIds: targetFWIds as string[],
    frameworkTerms,
  };
}
