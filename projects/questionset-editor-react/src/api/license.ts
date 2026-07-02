import { apiClient } from './client';
import { URLS } from './urls';

/** Old helper.service.getLicenses(): composite search objectType 'license'. */
export async function getLicenses(): Promise<string[]> {
  const response = await apiClient.post(URLS.composite.search, {
    request: { filters: { objectType: 'license', status: ['Live'] } },
  });
  const licenses = (response.data?.result?.license ?? []) as Array<{ name?: string }>;
  return licenses.map((l) => l.name ?? '').filter(Boolean);
}
