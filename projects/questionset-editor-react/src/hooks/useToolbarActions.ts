import { useCallback } from 'react';
import toast from 'react-hot-toast';
import type { ToolbarAction } from '../types/editor';
import { useEditorStore } from '../store/editor.store';
import { sendForReview, rejectContent, publishContent } from '../api/hierarchy';

export function useToolbarActions(save: () => Promise<void>) {
  const config = useEditorStore((s) => s.editorConfig);
  const setButtonLoader = useEditorStore((s) => s.setButtonLoader);

  const runAction = useCallback(
    async (action: ToolbarAction, data?: unknown): Promise<boolean> => {
      const contentId = config?.context?.contentId ?? config?.context?.identifier ?? '';
      if (!contentId) {
        toast.error('No content identifier found.');
        return false;
      }
      const lastUpdatedBy = config?.context?.userId ?? config?.context?.uid ?? '';

      try {
        switch (action) {
          case 'sendForReview':
            setButtonLoader('saveContent', true);
            await save();
            await sendForReview(contentId);
            toast.success('Question set sent for review');
            return true;

          case 'reject': {
            setButtonLoader('rejectContent', true);
            const comment = (data as { comment?: string } | undefined)?.comment ?? '';
            await rejectContent(contentId, comment);
            toast.success('Content rejected');
            return true;
          }

          case 'publish':
            setButtonLoader('publishContent', true);
            await save();
            await publishContent(contentId, lastUpdatedBy);
            toast.success('Question set published successfully');
            return true;

          default:
            return false;
        }
      } catch (err) {
        console.error(`[useToolbarActions] ${action} failed`, err);
        const verb = action === 'sendForReview' ? 'send for review' : action === 'reject' ? 'reject' : 'publish';
        toast.error(`Failed to ${verb}. Please try again.`);
        return false;
      } finally {
        setButtonLoader('saveContent', false);
        setButtonLoader('rejectContent', false);
        setButtonLoader('publishContent', false);
      }
    },
    [config, save, setButtonLoader],
  );

  return { runAction };
}
