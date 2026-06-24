import { useQuery } from '@tanstack/react-query';
import { useEditorStore } from '../store/editor.store';
import { getChannelData } from '../api/channel';
import type { IChannelData } from '../api/channel';

export function useChannelData() {
  const channelId = useEditorStore((s) => s.editorConfig?.context?.channel ?? '');

  return useQuery<IChannelData>({
    queryKey: ['channel', channelId],
    queryFn: () => getChannelData(channelId),
    enabled: !!channelId,
    staleTime: 10 * 60 * 1000,
  });
}
