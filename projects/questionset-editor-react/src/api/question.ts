import { apiClient } from './client';
import { URLS } from './urls';

// Question create/update goes through the hierarchy-update flow in
// useSaveQuestion (like the old editor) — only read/retire live here.

/**
 * Fields requested on question read — the old editor's
 * `editor.config.json → readQuestionFields` list, verbatim.
 */
export const READ_QUESTION_FIELDS =
  'body,primaryCategory,mimeType,qType,answer,templateId,responseDeclaration,' +
  'interactionTypes,interactions,name,solutions,editorState,media,remarks,' +
  'evidence,hints,instructions,outcomeDeclaration,isPartialScore,evalUnordered';

/**
 * Read a single question with the old editor's field list. `extraFields`
 * mirrors the old leafFormConfig field codes appended per category
 * definition (isReviewModificationAllowed is always appended, as the old
 * editor did).
 */
export async function readQuestion(
  questionId: string,
  extraFields: string[] = [],
): Promise<Record<string, unknown>> {
  const fields = [READ_QUESTION_FIELDS, ...extraFields, 'isReviewModificationAllowed'].join(',');
  const response = await apiClient.get(`${URLS.question.read}/${questionId}`, {
    params: { fields },
  });
  return (response.data?.result?.question ?? {}) as Record<string, unknown>;
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await apiClient.delete(`${URLS.question.retire}/${questionId}`);
}
