import { apiClient } from './client';
import { URLS } from './urls';

export interface IComment {
  id: string;
  text: string;
  createdBy: string;
  createdOn: string;
}

/** Old editor: GET questionset/v2/comment/read/{id} → result.comments[]. */
export async function readComments(contentId: string): Promise<IComment[]> {
  try {
    const response = await apiClient.get(`${URLS.questionSet.commentRead}/${contentId}`);
    const comments = (response.data?.result?.comments ?? []) as Array<Record<string, unknown>>;
    return comments.map((c, i) => ({
      id: (c.id as string) ?? String(i),
      text: (c.comment as string) ?? (c.text as string) ?? '',
      createdBy: (c.createdBy as string) ?? '',
      createdOn: (c.createdOn as string) ?? '',
    }));
  } catch {
    return [];
  }
}

/** Old editor: PATCH questionset/v2/comment/update/{id} with request.comments. */
export async function saveComment(contentId: string, comment: string): Promise<void> {
  await apiClient.patch(`${URLS.questionSet.commentUpdate}/${contentId}`, {
    request: { comments: [{ comment }] },
  });
}
