import { expect } from '@jest/globals';

import { generateUUID } from './generateUUID';

describe('generateUUID', () => {
  test('returns a UUID string', () => {
    const uuid = generateUUID();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  test('returns a unique UUID string', () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();
    expect(uuid1).not.toBe(uuid2);
  });

  test('handles timestamp overflow', () => {
    // Set timestamp to maximum possible value
    const maxTimestamp = new Date('9999-12-31T23:59:59.999Z').getTime();
    const originalTimestamp = Date.now();
    Date.now = jest.fn(() => maxTimestamp + 1);
    const uuid = generateUUID();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    Date.now = jest.fn(() => originalTimestamp);
  });
});
