import { renderHook } from '@testing-library/react';
import { useLocation } from 'react-router-dom';

import useUpdateQueryStringValueWithoutNavigation from '../src/hooks/useUpdateQueryStringValueWithoutNavigation';

// Mock useLocation hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn()
}));

const mockReplaceState = jest.fn();
Object.defineProperty(window, 'history', {
  value: { replaceState: mockReplaceState }
});

describe('useUpdateQueryStringValueWithoutNavigation', () => {
  it('should update query string without navigation', () => {
    // Mock location object
    const mockLocation = {
      pathname: '/test',
      search: '?param1=value1&param2=value2'
    };

    (useLocation as jest.Mock).mockImplementation(() => mockLocation);

    // Call the hook
    renderHook(() => useUpdateQueryStringValueWithoutNavigation('param3', 'value3'));

    // Expect the URL to be updated without navigation
    expect(mockReplaceState).toHaveBeenCalledWith(null, '', '#/test?param1=value1&param2=value2&param3=value3');
  });
});
