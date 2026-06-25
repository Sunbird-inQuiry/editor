import { apiClient } from './client';

export interface IComment {
  id: string;
  text: string;
  createdBy: string;
  createdOn: string;
}

export async function readComments(contentId: string): Promise<IComment[]> {
  try {
    const response = await apiClient.get(`/action/questionset/v1/comment/${contentId}`);
    const comments = response.data?.result?.content ?? [];
    return comments as IComment[];
  } catch {
    return [];
  }
}

export async function saveComment(contentId: string, comment: string): Promise<void> {
  await apiClient.patch(`/action/questionset/v1/comment/${contentId}`, {
    request: { content: { comment } },
  });
}
