import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Server } from 'miragejs';
import * as router from 'react-router';

import { loadMockServer } from '../mocks/server';
import SkHeader, { HeaderLabels, UserDropdown } from '../src/layout/Header';
import { Providers } from '../src/providers';

describe('SkHeader', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
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
    const navigate = jest.fn();
    jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);

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
