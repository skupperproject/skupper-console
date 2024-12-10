import { render, screen } from '@testing-library/react';

import SkLinkCell from '../../src/core/components/SkLinkCell';
import { Providers } from '../../src/providers';

describe('SkLinkCell', () => {
  const data = { id: 1, name: 'Test' };

  it('should render a disabled cell with Truncate for non-empty value', () => {
    render(<SkLinkCell data={data} value="Long text" isDisabled={true} link="/some-link" />);
    const truncateElement = screen.getByText('Long text');
    expect(truncateElement).toBeInTheDocument();
  });

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

  it('should render a non-disabled cell with fitContent', () => {
    render(
      <Providers>
        <SkLinkCell data={data} value="Long text" link="/some-link" fitContent={true} />
      </Providers>
    );
    const textElement = screen.getByText('Long text');
    expect(textElement).toBeInTheDocument();
  });

  it('should handle non-string values', () => {
    render(<SkLinkCell data={data} value={undefined} link="/some-link" />);
    const emptyElement = screen.getByText('');
    expect(emptyElement).toBeInTheDocument();
  });
});
