import { useCallback, useEffect, useRef } from 'react';
import { useLibraryStore } from '../store/library.store';
import { useEditorStore } from '../store/editor.store';
import { compositeSearch } from '../api/content';
import type { LibraryFilters } from '../store/library.store';

const PAGE_SIZE = 20;

export function useLibrary() {
  const store = useLibraryStore();
  const channel = useEditorStore((s) => s.editorConfig?.context?.channel ?? '');
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();
  // Monotonic request id — a slow response for an older query must not
  // overwrite the results of a newer one.
  const requestSeq = useRef(0);

  // Clear a pending debounced search on unmount so it can't fire into the
  // global library store after the panel closes.
  useEffect(() => () => clearTimeout(searchTimerRef.current), []);

  const load = useCallback(
    async (
      query = '',
      filter = 'all',
      advancedFilters: LibraryFilters = {},
      reset = true,
      sortAZ = false,
    ) => {
      const requestId = ++requestSeq.current;
      // Call-time store read — the hook-snapshot `store` captured at render
      // keeps a stale offset, which would re-request page 1 forever.
      const state = useLibraryStore.getState();
      state.setLoading(true);
      try {
        const filters: Record<string, unknown> = { status: ['Live'] };
        if (filter && filter !== 'all') filters['primaryCategory'] = [filter];
        if (advancedFilters?.board?.length) filters['board'] = advancedFilters.board;
        if (advancedFilters?.medium?.length) filters['medium'] = advancedFilters.medium;
        if (advancedFilters?.gradeLevel?.length) filters['gradeLevel'] = advancedFilters.gradeLevel;
        if (advancedFilters?.subject?.length) filters['subject'] = advancedFilters.subject;

        const currentOffset = reset ? 0 : state.offset;
        const { content, count } = await compositeSearch({
          filters,
          query,
          limit: query ? 50 : PAGE_SIZE,
          offset: currentOffset,
          channel: channel || undefined,
          sortBy: sortAZ ? { name: 'asc' } : { lastUpdatedOn: 'desc' },
        });

        if (requestId !== requestSeq.current) return; // stale response — a newer load superseded it
        if (reset) state.setContent(content, count);
        else state.appendContent(content, count);
      } catch (e) {
        console.error('[useLibrary] load error:', e);
      } finally {
        if (requestId === requestSeq.current) useLibraryStore.getState().setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [channel],
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);

  const search = useCallback(
    (query: string) => {
      store.setSearch(query);
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(
        () => load(query, store.activeFilter, store.advancedFilters, true, store.sortAZ),
        300,
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.activeFilter, store.advancedFilters, store.sortAZ, load],
  );

  const setFilter = useCallback(
    (filter: string) => {
      store.setFilter(filter);
      load(store.searchQuery, filter, store.advancedFilters, true, store.sortAZ);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.searchQuery, store.advancedFilters, store.sortAZ, load],
  );

  const applyAdvancedFilters = useCallback(
    (advancedFilters: LibraryFilters) => {
      store.setAdvancedFilters(advancedFilters);
      load(store.searchQuery, store.activeFilter, advancedFilters, true, store.sortAZ);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.searchQuery, store.activeFilter, store.sortAZ, load],
  );

  const toggleSort = useCallback(() => {
    const next = !store.sortAZ;
    store.setSortAZ(next);
    load(store.searchQuery, store.activeFilter, store.advancedFilters, true, next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.sortAZ, store.searchQuery, store.activeFilter, store.advancedFilters, load]);

  const loadMore = useCallback(() => {
    if (store.isLoading) return;
    load(store.searchQuery, store.activeFilter, store.advancedFilters, false, store.sortAZ);
  }, [store.isLoading, store.searchQuery, store.activeFilter, store.advancedFilters, store.sortAZ, load]);

  return {
    content: store.filteredContent,
    isLoading: store.isLoading,
    totalCount: store.totalCount,
    activeFilter: store.activeFilter,
    advancedFilters: store.advancedFilters,
    searchQuery: store.searchQuery,
    sortAZ: store.sortAZ,
    hasMore: store.allContent.length < store.totalCount,
    search,
    setFilter,
    applyAdvancedFilters,
    toggleSort,
    loadMore,
    refetch: () => load(store.searchQuery, store.activeFilter, store.advancedFilters, true, store.sortAZ),
  };
}
