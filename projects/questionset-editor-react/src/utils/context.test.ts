import { describe, it, expect } from 'vitest';
import { getUserId, getContentId } from './context';
import type { IContext } from '../types/editor';

const base: IContext = {
  channel: 'ch',
  sid: 's',
  did: 'd',
  pdata: { id: 'p', ver: '1' },
};

describe('context normalization (old + new host contracts)', () => {
  it('prefers user.id (old portal contract) over userId/uid', () => {
    expect(getUserId({ ...base, user: { id: 'u-old' }, userId: 'u-flat', uid: 'u-uid' })).toBe('u-old');
  });

  it('falls back to userId, then uid', () => {
    expect(getUserId({ ...base, userId: 'u-flat', uid: 'u-uid' })).toBe('u-flat');
    expect(getUserId({ ...base, uid: 'u-uid' })).toBe('u-uid');
    expect(getUserId(base)).toBe('');
    expect(getUserId(undefined)).toBe('');
  });

  it('prefers identifier (old portal contract) over contentId', () => {
    expect(getContentId({ ...base, identifier: 'do_old', contentId: 'do_flat' })).toBe('do_old');
    expect(getContentId({ ...base, contentId: 'do_flat' })).toBe('do_flat');
    expect(getContentId(base)).toBe('');
    expect(getContentId(null)).toBe('');
  });
});
