import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

const mockUseParams = vi.hoisted(() => vi.fn());
const mockUseNavigate = vi.hoisted(() => vi.fn());

vi.mock(import('react-router-dom'), async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    useParams: mockUseParams,
    useNavigate: () => mockUseNavigate
  };
});

export const mockNavigate = mockUseNavigate;

export const setMockUseParams = (params: Record<string, string>) => {
  mockUseParams.mockReturnValue(params);
};
