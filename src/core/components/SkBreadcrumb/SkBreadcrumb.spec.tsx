import { useState } from 'react';

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import SkBreadcrumb from './index';

describe('SkBreadcrumb component', () => {
  it('should render null when there are less than 2 paths', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <SkBreadcrumb />
      </MemoryRouter>
    );
    expect(screen.queryByTestId('breadcrumb-component')).toBeNull();
  });

  it('should render the breadcrumb with correct links and names', () => {
    render(
      <MemoryRouter initialEntries={['/path1/path2']}>
        <SkBreadcrumb />
      </MemoryRouter>
    );

    const link1 = screen.getByRole('link', { name: 'path1' });

    expect(link1).toHaveAttribute('href', '/path1');
  });

  it('should render the last path as BreadcrumbHeading', () => {
    render(
      <MemoryRouter initialEntries={['/path1/path2']}>
        <SkBreadcrumb />
      </MemoryRouter>
    );

    const breadcrumbHeading = screen.getByRole('heading', { level: 1, name: 'path2' });

    expect(breadcrumbHeading).toBeInTheDocument();
  });

  it('should do something', () => {
    let mockSearchParam = 'pid=123';

    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useSearchParams: () => {
        const [params, setParams] = useState(new URLSearchParams(mockSearchParam));

        return [
          params,
          (newParams: string) => {
            mockSearchParam = newParams;
            setParams(new URLSearchParams(newParams));
          }
        ];
      }
    }));

    render(
      <MemoryRouter initialEntries={['/path1/path2?pid=123']}>
        <SkBreadcrumb />
      </MemoryRouter>
    );
    expect(mockSearchParam).toContain('pid=123');
  });
});
