import type { INode } from '../types/editor';

export type NodeKind = 'root' | 'section' | 'question';

/**
 * Determines node kind from data fields rather than relying on isFolder alone.
 * Question nodes from the API often have isFolder:true (they have children:[]),
 * so we check mimeType / objectType / questionType / isQuestion first.
 */
export function detectNodeKind(node: INode): NodeKind {
  if (!node.parent) return 'root';
  if (
    node.mimeType === 'application/vnd.sunbird.question' ||
    node.objectType === 'Question' ||
    node.isQuestion === true ||
    (node.questionType != null && node.questionType !== '')
  ) return 'question';
  return 'section';
}
