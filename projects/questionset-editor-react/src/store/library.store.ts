import { create } from 'zustand';
import type { IContent } from '../types/content';

export interface LibraryFilters {
  board?: string[];
  medium?: string[];
  gradeLevel?: string[];
  subject?: string[];
  primaryCategory?: string[];
  questionType?: string[];
}

interface LibraryState {
  allContent: IContent[];
  filteredContent: IContent[];
  searchQuery: string;
  activeFilter: string;
  advancedFilters: LibraryFilters;
  isLoading: boolean;
  totalCount: number;
  offset: number;
  sortAZ: boolean;
  setContent: (content: IContent[], total: number) => void;
  appendContent: (content: IContent[], total: number) => void;
  setFilter: (filter: string) => void;
  setSearch: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setAdvancedFilters: (filters: LibraryFilters) => void;
  setOffset: (offset: number) => void;
  setSortAZ: (sortAZ: boolean) => void;
  applyFilter: () => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  allContent: [],
  filteredContent: [],
  searchQuery: '',
  activeFilter: 'all',
  advancedFilters: {},
  isLoading: false,
  totalCount: 0,
  offset: 0,
  sortAZ: false,

  setContent: (content, total) => {
    set({ allContent: content, totalCount: total, offset: content.length });
    get().applyFilter();
  },

  appendContent: (content, total) => {
    const merged = [...get().allContent, ...content];
    set({ allContent: merged, totalCount: total, offset: merged.length });
    get().applyFilter();
  },

  setFilter: (filter) => {
    set({ activeFilter: filter });
    get().applyFilter();
  },

  setSearch: (query) => {
    set({ searchQuery: query });
    get().applyFilter();
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setAdvancedFilters: (filters) => set({ advancedFilters: filters }),
  setOffset: (offset) => set({ offset }),
  setSortAZ: (sortAZ) => set({ sortAZ }),

  applyFilter: () => {
    const { allContent, activeFilter, searchQuery } = get();
    let filtered = allContent;

    if (activeFilter && activeFilter !== 'all') {
      const filterLower = activeFilter.toLowerCase();
      filtered = filtered.filter((item) =>
        [item.mimeType ?? '', item.primaryCategory ?? '', item.contentType ?? '']
          .join(' ').toLowerCase().includes(filterLower),
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) => (item.name ?? '').toLowerCase().includes(q));
    }

    set({ filteredContent: filtered });
  },
}));
