import { apiClient } from './client';
import { URLS } from './urls';
import type { INode } from '../types/editor';

function mapToINode(raw: unknown, parentId?: string): INode {
  const r = (raw ?? {}) as Record<string, unknown>;
  const identifier = (r['identifier'] as string) ?? '';
  const objectType = (r['objectType'] as string) ?? '';
  const mime = (r['mimeType'] as string) ?? '';
  const primaryCategory = (r['primaryCategory'] as string) ?? '';

  const isFolder =
    mime === 'application/vnd.ekstep.content-collection' ||
    objectType === 'QuestionSet' ||
    primaryCategory === 'Question Set' ||
    (r['visibility'] as string) === 'Parent';

  const isQuestion =
    objectType === 'Question' ||
    mime === 'application/vnd.sunbird.question';

  const rawChildren = r['children'];
  const children: INode[] = Array.isArray(rawChildren)
    ? rawChildren.map((child) => mapToINode(child, identifier))
    : [];

  return {
    id: identifier,
    identifier,
    name: (r['name'] as string) ?? 'Untitled',
    title: (r['name'] as string) ?? 'Untitled',
    description: r['description'] as string | undefined,
    primaryCategory: primaryCategory || undefined,
    mimeType: mime || undefined,
    objectType,
    contentType: r['contentType'] as string | undefined,
    visibility: r['visibility'] as string | undefined,
    status: r['status'] as string | undefined,
    appIcon: r['appIcon'] as string | undefined,
    isFolder,
    isQuestion,
    questionType: r['questionType'] as string | undefined,
    children,
    metadata: r as Record<string, unknown>,
    parent: parentId,
  };
}

// Fields not present in the hierarchy response that are needed for the form.
const EXTRA_FIELDS = URLS.questionSet.defaultFields;

export async function readQuestionSet(
  contentId: string,
): Promise<Record<string, unknown>> {
  const response = await apiClient.get(
    `${URLS.questionSet.read}/${contentId}`,
    { params: { mode: 'edit', fields: EXTRA_FIELDS } },
  );
  return (
    response.data?.result?.questionSet as Record<string, unknown> | undefined ??
    response.data?.result?.questionset as Record<string, unknown> | undefined ??
    {}
  );
}

export async function readHierarchy(
  contentId: string,
): Promise<{ content: Record<string, unknown>; rootNode: INode }> {
  const response = await apiClient.get(
    `${URLS.questionSet.hierarchyRead}/${contentId}`,
    { params: { mode: 'edit' } },
  );
  const content = response.data?.result?.questionSet as Record<string, unknown> | undefined
    ?? response.data?.result?.questionset as Record<string, unknown> | undefined
    ?? response.data?.result?.content as Record<string, unknown> | undefined;

  if (!content || !content['identifier']) {
    const reason =
      (response.data?.params?.errmsg as string) ||
      (response.data?.params?.err as string) ||
      `No content returned for "${contentId}"`;
    throw new Error(`Unable to load hierarchy: ${reason}`);
  }
  return { content, rootNode: mapToINode(content) };
}

export async function updateHierarchy(
  _contentId: string,
  nodesModified: Record<string, unknown>,
  hierarchy: Record<string, unknown>,
  lastUpdatedBy?: string,
): Promise<{ identifiers: Record<string, string> }> {
  const response = await apiClient.patch(URLS.questionSet.hierarchyUpdate, {
    request: {
      data: {
        nodesModified,
        hierarchy,
        ...(lastUpdatedBy ? { lastUpdatedBy } : {}),
      },
    },
  });
  return {
    identifiers: (response.data?.result?.identifiers ?? {}) as Record<string, string>,
  };
}

export async function publishContent(contentId: string, lastPublishedBy = ''): Promise<void> {
  await apiClient.post(`${URLS.questionSet.publish}/${contentId}`, {
    request: { questionset: { lastPublishedBy } },
  });
}

export async function sendForReview(contentId: string): Promise<void> {
  await apiClient.post(`${URLS.questionSet.review}/${contentId}`, {
    request: { questionset: {} },
  });
}

export async function rejectContent(contentId: string, comment: string): Promise<void> {
  await apiClient.post(`${URLS.questionSet.reject}/${contentId}`, {
    request: { questionset: { rejectComment: comment } },
  });
}
