// jest.setup.ts

// 1. Import TextEncoder and TextDecoder from 'util' for Node.js environment
import { TextEncoder } from 'util';

// 2. Conditionally assign TextEncoder and TextDecoder to global object
// (for react router v7) Polyfill TextEncoder and TextDecoder globally if they aren't defined yet
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

// 3. Mock the React Router functions (useNavigate and useParams)
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: jest.fn(),
  useParams: jest.fn()
}));

// 4. Define mock functions for useNavigate and useParams
export const mockNavigate = jest.fn();
const mockUseParams = jest.fn();

// 5. Import hooks from 'react-router' to mock their implementations
import { useNavigate, useParams } from 'react-router';

// 6. Implement mock behavior for useNavigate and useParams
(useNavigate as jest.Mock).mockImplementation(() => mockNavigate);
(useParams as jest.Mock).mockImplementation(() => mockUseParams);

// 7. Utility function to set mock return values for useParams
// This function allows you to specify what values should be returned by the mocked useParams during the test
export const setMockUseParams = (params: Record<string, string>) => {
  (jest.mocked(useParams) as jest.Mock).mockReturnValue(params);
};
