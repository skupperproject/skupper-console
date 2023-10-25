// SkHeader.test.tsx

import { render } from '@testing-library/react';

import SkHeader from '../Header';

jest.mock('@config/config', () => ({
  brandLogo: '/path/to/logo.png',
  brandName: 'My Brand'
}));

describe('SkHeader', () => {
  it('renders the header with logo and brand name', () => {
    const { getByAltText } = render(<SkHeader />);

    const logo = getByAltText('logo');
    expect(logo).toBeInTheDocument();
    expect(logo.getAttribute('src')).toBe('/path/to/logo.png');
  });

  it('renders the header without brand name when brandName is undefined', () => {
    jest.mock('@config/config', () => ({
      brandLogo: '/path/to/logo.png',
      brandName: undefined
    }));

    const { queryByTestId } = render(<SkHeader />);

    const brandName = queryByTestId('brand-name');
    expect(brandName).toBeNull();
  });
});
