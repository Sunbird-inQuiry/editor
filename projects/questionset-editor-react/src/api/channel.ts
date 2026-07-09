import { apiClient } from './client';
import { URLS } from './urls';

export interface IChannelData {
  identifier: string;
  name?: string;
  frameworks?: Array<{ identifier: string; name: string; type?: string }>;
  collectionAdditionalCategories?: string[];
  contentAdditionalCategories?: string[];
  defaultLicense?: string;
}

export async function getChannelData(channelId: string): Promise<IChannelData> {
  const response = await apiClient.get(`${URLS.channel.read}/${channelId}`);
  return response.data?.result?.channel as IChannelData;
}
