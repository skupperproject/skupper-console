import { renderHook } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { describe, expect, it, Mock, vi } from 'vitest';

import useUpdateQueryStringValueWithoutNavigation from '../src/hooks/useUpdateQueryStringValueWithoutNavigation';

// Mock useLocation hook
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useLocation: vi.fn()
}));

const mockReplaceState = vi.fn();
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

    (useLocation as Mock).mockImplementation(() => mockLocation);

    // Call the hook
    renderHook(() => useUpdateQueryStringValueWithoutNavigation('param3', 'value3'));

    // Expect the URL to be updated without navigation
    expect(mockReplaceState).toHaveBeenCalledWith(null, '', '#/test?param1=value1&param2=value2&param3=value3');
  });
});
