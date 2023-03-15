import { expect } from '@jest/globals';

import { capitalizeFirstLetter } from './capitalize';

describe('Utils - capitalize', () => {
  it('', () => {
    expect(capitalizeFirstLetter('test')).toBe('Test');
  });
});
