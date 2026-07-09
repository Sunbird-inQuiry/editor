import { apiClient } from './client';
import { URLS } from './urls';
import type { IContent } from '../types/content';

export async function compositeSearch(params: {
  filters?: Record<string, unknown>;
  query?: string;
  limit?: number;
  offset?: number;
  fields?: string[];
  channel?: string;
  sortBy?: Record<string, string>;
}): Promise<{ content: IContent[]; count: number }> {
  const baseFilters: Record<string, unknown> = {
    status: ['Live'],
    objectType: ['Question'],
    ...(params.filters ?? {}),
  };
  if (params.channel) baseFilters['channel'] = params.channel;

  const response = await apiClient.post(URLS.composite.search, {
    request: {
      filters: baseFilters,
      query: params.query ?? '',
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
      sort_by: params.sortBy ?? { lastUpdatedOn: 'desc' },
      fields: params.fields ?? [
        'identifier', 'name', 'mimeType', 'contentType', 'primaryCategory',
        'appIcon', 'channel', 'questionType', 'difficultyLevel', 'bloomsLevel',
      ],
    },
  });

  const result = response.data?.result ?? {};
  return {
    content: (result.Question ?? result.content ?? []) as IContent[],
    count: (result.count ?? 0) as number,
  };
}
