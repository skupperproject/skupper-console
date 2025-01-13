import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Server } from 'miragejs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loadMockServer } from '../mocks/server';
import SkHeader, { HeaderLabels, UserDropdown } from '../src/layout/Header';
import { Providers } from '../src/providers';

const navigate = vi.hoisted(() => vi.fn());

vi.mock(import('react-router-dom'), async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    useNavigate: vi.fn().mockImplementation(() => navigate)
  };
});

describe('SkHeader', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    vi.clearAllMocks();
  });

  it('should renders the header with logo', () => {
    const { getByAltText } = render(
      <Providers>
        <SkHeader />
      </Providers>
    );

    const logo = getByAltText('logo');
    expect(logo).toBeInTheDocument();
  });

  it('should show the username', async () => {
    render(
      <Providers>
        <UserDropdown />
      </Providers>
    );

    await waitFor(() => expect(screen.getByText('IAM#Mock-User@user.mock')).toBeInTheDocument());
  });

  it('should click logout', async () => {
    render(
      <Providers>
        <UserDropdown />
      </Providers>
    );

    await waitFor(() => expect(screen.getByText('IAM#Mock-User@user.mock')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId(HeaderLabels.UserDropdownTestId));
    fireEvent.click(screen.getByText(HeaderLabels.Logout));

    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
  });
});
