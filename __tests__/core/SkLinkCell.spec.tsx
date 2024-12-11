import { render, screen } from '@testing-library/react';

import SkLinkCell from '../../src/core/components/SkLinkCell';
import { Providers } from '../../src/providers';

describe('SkLinkCell', () => {
  const data = { id: 1, name: 'Test' };

  it('should render a non-disabled cell with Link for non-empty value', () => {
    render(
      <Providers>
        <SkLinkCell data={data} value="Long text" link="/some-link" />
      </Providers>
    );
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '#/some-link');
  });

  it('should render an empty cell', () => {
    render(<SkLinkCell data={data} value="" link="/some-link" />);
    const emptyElement = screen.getByText('');
    expect(emptyElement).toBeInTheDocument();
  });

  it('should handle non-string values', () => {
    render(<SkLinkCell data={data} value={undefined} link="/some-link" />);
    const emptyElement = screen.getByText('');
    expect(emptyElement).toBeInTheDocument();
  });
});
