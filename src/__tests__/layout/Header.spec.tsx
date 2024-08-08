import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Server } from 'miragejs';
import * as router from 'react-router';

import { Wrapper } from '@core/components/Wrapper';
import SkHeader, { HeaderLabels, UserDropdown } from '@layout/Header';
import { loadMockServer } from '@mocks/server';

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
      <Wrapper>
        <SkHeader />
      </Wrapper>
    );

    const logo = getByAltText('logo');
    expect(logo).toBeInTheDocument();
  });

  it('should show the username', async () => {
    render(
      <Wrapper>
        <UserDropdown />
      </Wrapper>
    );

    await waitFor(() => expect(screen.getByText('IAM#Mock-User@user.mock')).toBeInTheDocument());
  });

  it('should click logout', async () => {
    const navigate = jest.fn();
    jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);

    render(
      <Wrapper>
        <UserDropdown />
      </Wrapper>
    );

    await waitFor(() => expect(screen.getByText('IAM#Mock-User@user.mock')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId(HeaderLabels.UserDropdownTestId));
    fireEvent.click(screen.getByText(HeaderLabels.Logout));

    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
  });
});
