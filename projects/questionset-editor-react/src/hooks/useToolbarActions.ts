import { useCallback } from 'react';
import { notifySuccess, notifyError, apiErrorMessage } from '../utils/notify';
import type { ToolbarAction } from '../types/editor';
import { useEditorStore } from '../store/editor.store';
import { sendForReview, rejectContent, publishContent } from '../api/hierarchy';
import { getContentId, getUserId } from '../utils/context';
import { useTreeStore } from '../store/tree.store';

/** Reflect the workflow result on the root node so the status chip is live. */
function setRootStatus(status: string): void {
  const rootId = useTreeStore.getState().treeData[0]?.identifier;
  if (rootId) useTreeStore.getState().hydrateNodeMeta(rootId, { status });
}

export function useToolbarActions(save: () => Promise<boolean | void>) {
  const config = useEditorStore((s) => s.editorConfig);
  const setButtonLoader = useEditorStore((s) => s.setButtonLoader);

  const runAction = useCallback(
    async (action: ToolbarAction, data?: unknown): Promise<boolean> => {
      const contentId = getContentId(config?.context);
      if (!contentId) {
        notifyError('No content identifier found.');
        return false;
      }
      const lastUpdatedBy = getUserId(config?.context);

      try {
        switch (action) {
          case 'sendForReview':
            setButtonLoader('saveContent', true);
            if ((await save()) === false) return false;
            await sendForReview(contentId);
            setRootStatus('Review');
            notifySuccess('Question set sent for review');
            return true;

          case 'reject': {
            setButtonLoader('rejectContent', true);
            const comment = (data as { comment?: string } | undefined)?.comment ?? '';
            await rejectContent(contentId, comment);
            setRootStatus('Draft');
            notifySuccess('Content rejected');
            return true;
          }

          case 'publish':
            setButtonLoader('publishContent', true);
            if ((await save()) === false) return false;
            await publishContent(contentId, lastUpdatedBy);
            setRootStatus('Live');
            notifySuccess('Question set published successfully');
            return true;

          default:
            return false;
        }
      } catch (err) {
        console.error(`[useToolbarActions] ${action} failed`, err);
        const verb = action === 'sendForReview' ? 'send for review' : action === 'reject' ? 'reject' : 'publish';
        notifyError(apiErrorMessage(err, `Failed to ${verb}. Please try again.`));
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
