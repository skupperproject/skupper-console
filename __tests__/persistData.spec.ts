// sessionStorageUtils.test.ts

import { getDataFromSession, storeDataToSession } from '../src/core/utils/persistData';

describe('sessionStorageUtils', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('should store data to sessionStorage and retrieve it correctly', () => {
    const key = 'testData';
    const testData = { name: 'John', age: 30 };
    storeDataToSession(key, testData);

    const retrievedData = getDataFromSession<typeof testData>(key);
    expect(retrievedData).toEqual(testData);
  });

  it('should return null for non-existent key', () => {
    const key = 'nonExistentKey';
    const retrievedData = getDataFromSession<null>(key);

    expect(retrievedData).toBeNull();
  });
});
