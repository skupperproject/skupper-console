import { render } from '@testing-library/react';
import { Server } from 'miragejs';

import { Wrapper } from '@core/components/Wrapper';
import { loadMockServer } from '@mocks/server';

import SkHeader from '../Header';

jest.mock('@config/config', () => ({
  brandLogo: '/path/to/logo.png',
  brandName: 'My Brand'
}));

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

  it('renders the header with logo and brand name', () => {
    const { getByAltText } = render(
      <Wrapper>
        <SkHeader />
      </Wrapper>
    );

    const logo = getByAltText('logo');
    expect(logo).toBeInTheDocument();
    expect(logo.getAttribute('src')).toBe('/path/to/logo.png');
  });

  it('renders the header without brand name when brandName is undefined', () => {
    jest.mock('@config/config', () => ({
      brandLogo: '/path/to/logo.png',
      brandName: undefined
    }));

    const { queryByTestId } = render(
      <Wrapper>
        <SkHeader />
      </Wrapper>
    );

    const brandName = queryByTestId('brand-name');
    expect(brandName).toBeNull();
  });
});
