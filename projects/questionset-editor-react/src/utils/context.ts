import type { IContext } from '../types/editor';

// The sunbird portal host passes the OLD Angular editor contract
// (context.user.id, context.identifier); standalone hosts may pass
// userId/contentId directly. Normalize both here.

export function getUserId(ctx?: IContext | null): string {
  return ctx?.user?.id ?? ctx?.userId ?? ctx?.uid ?? '';
}

export function getContentId(ctx?: IContext | null): string {
  return ctx?.identifier ?? ctx?.contentId ?? '';
}
