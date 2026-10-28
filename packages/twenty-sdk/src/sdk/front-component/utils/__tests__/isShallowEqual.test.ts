import { describe, expect, it } from 'vitest';

import { isShallowEqual } from '@/sdk/front-component/utils/isShallowEqual';

describe('isShallowEqual', () => {
  it('compares primitives with Object.is', () => {
    expect(isShallowEqual('record-id', 'record-id')).toBe(true);
    expect(isShallowEqual(null, null)).toBe(true);
    expect(isShallowEqual(Number.NaN, Number.NaN)).toBe(true);
    expect(isShallowEqual('record-id', 'other-record-id')).toBe(false);
    expect(isShallowEqual(null, undefined)).toBe(false);
    expect(isShallowEqual(0, -0)).toBe(false);
  });

  it('compares plain objects key by key', () => {
    const selectedRecordIds = ['record-id'];

    expect(
      isShallowEqual(
        { recordId: 'record-id', selectedRecordIds },
        { recordId: 'record-id', selectedRecordIds },
      ),
    ).toBe(true);
    expect(isShallowEqual({ recordId: 'a' }, { recordId: 'b' })).toBe(false);
    expect(isShallowEqual({ recordId: 'a' }, { userId: 'a' })).toBe(false);
    expect(isShallowEqual({ recordId: 'a' }, {})).toBe(false);
    expect(isShallowEqual({ recordId: undefined }, { userId: undefined })).toBe(
      false,
    );
  });

  it('does not look past the first level', () => {
    expect(
      isShallowEqual(
        { selectedRecordIds: ['record-id'] },
        { selectedRecordIds: ['record-id'] },
      ),
    ).toBe(false);
  });

  it('compares arrays item by item', () => {
    expect(isShallowEqual(['a', 'b'], ['a', 'b'])).toBe(true);
    expect(isShallowEqual(['a', 'b'], ['b', 'a'])).toBe(false);
    expect(isShallowEqual(['a'], ['a', 'b'])).toBe(false);
    expect(isShallowEqual(['a'], { 0: 'a' })).toBe(false);
  });

  it('only matches non-plain objects by identity', () => {
    expect(isShallowEqual(new Date(0), new Date(0))).toBe(false);
    expect(isShallowEqual(new Map(), new Map())).toBe(false);
  });
});
