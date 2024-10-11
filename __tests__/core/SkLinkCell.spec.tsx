import { render, screen } from '@testing-library/react';

import { EMPTY_VALUE_PLACEHOLDER } from '@config/config';

import SkLinkCell from '../../src/core/components/SkLinkCell';
import { Wrapper } from '../../src/core/components/Wrapper';

describe('SkLinkCell', () => {
  const data = { id: 1, name: 'Test' };

  it('should render a disabled cell with Truncate for non-empty value', () => {
    render(<SkLinkCell data={data} value="Long text" isDisabled={true} link="/some-link" />);
    const truncateElement = screen.getByText('Long text');
    expect(truncateElement).toBeInTheDocument();
  });

  it('should render a non-disabled cell with Link for non-empty value', () => {
    render(
      <Wrapper>
        <SkLinkCell data={data} value="Long text" link="/some-link" />
      </Wrapper>
    );
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '#/some-link');
  });

  it('should render an empty cell', () => {
    render(<SkLinkCell data={data} value="" link="/some-link" />);
    const emptyElement = screen.getByText(EMPTY_VALUE_PLACEHOLDER);
    expect(emptyElement).toBeInTheDocument();
  });

  it('should render a non-disabled cell with fitContent', () => {
    render(
      <Wrapper>
        <SkLinkCell data={data} value="Long text" link="/some-link" fitContent={true} />
      </Wrapper>
    );
    const textElement = screen.getByText('Long text');
    expect(textElement).toBeInTheDocument();
  });

  it('should handle non-string values', () => {
    render(<SkLinkCell data={data} value={undefined} link="/some-link" />);
    const emptyElement = screen.getByText(EMPTY_VALUE_PLACEHOLDER);
    expect(emptyElement).toBeInTheDocument();
  });
});
